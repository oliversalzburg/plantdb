import { getBasePath } from "@shoelace-style/shoelace";
import i18next, { t } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Settings } from "luxon";
import { LogEntry, Plant } from "packages/libplantdb/typings";
import { registerSW } from "virtual:pwa-register";
import { ConfirmDialog } from "../ConfirmDialog";
import { prepareAsyncContext } from "../tools/Async";
import { assertExists } from "../tools/Maybe";
import { PlantStore } from "./PlantStore";

let globalStore: PlantStoreUi | undefined;

export const retrieveStoreUi = () => globalStore;

export type SupportedLocales = "de-DE" | "en-US" | "he-IL";
export type KnownViews =
  | "import"
  | "list"
  | "log"
  | "log-entry"
  | "plant"
  | "plant-properties"
  | "tasks"
  | "types"
  | "view404";

@customElement("pn-plant-store-ui")
export class PlantStoreUi extends LitElement {
  @property({ type: Boolean })
  i18nReady = false;
  @property({})
  locale = "en-US";

  @property({ type: Boolean })
  darkMode = false;

  @property({ type: Boolean })
  drawerIsOpen = false;

  @property({ type: String })
  page: KnownViews = "list";
  @property({ type: [String] })
  pageParams = new Array<string>();
  @property()
  pageQuery: Record<string, string> | undefined;

  @property({ type: PlantStore })
  plantStore: PlantStore | null | undefined;

  private _onSchemePreferenceChanged: ((event: MediaQueryListEvent) => void) | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    const userConfiguredTheme = localStorage.getItem("plant-theme") as "light" | "dark" | null;

    // Watch for global theme preference change. If this happens, it overrides everything.
    if (window.matchMedia) {
      this._onSchemePreferenceChanged = (event: MediaQueryListEvent) => {
        const newColorScheme = event.matches ? "dark" : "light";
        if (newColorScheme === "dark") {
          this.darkModeEnter();
        } else {
          this.darkModeLeave();
        }
      };
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .addEventListener("change", this._onSchemePreferenceChanged);
    }

    i18next
      .use(LanguageDetector)
      .use(HttpApi)
      .init({
        backend: {
          loadPath: `${getBasePath()}locales/{{lng}}/{{ns}}.json`,
        },
        debug: true,
        defaultNS: "nursery",
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
          lookupLocalStorage: "plantdb.i18nextLng",
        },
        fallbackLng: ["en-US"],
        ns: ["common", "nursery"],
        supportedLngs: ["de-DE", "en-US", "he-IL"],
      })
      .then(() => {
        this.i18nReady = true;
        this.locale = i18next.language;
        document.documentElement.lang = i18next.language;
        this._updateTextDirectionality();
        Settings.defaultLocale = i18next.language;
        this.dispatchEvent(new CustomEvent("pn-i18n-ready", { detail: i18next.language }));
      })
      .catch(console.error);

    const updateSW = registerSW({
      onNeedRefresh: prepareAsyncContext(async () => {
        if (await this.confirm(t("app.updateConfirm"), t("app.updateAvailable"))) {
          await updateSW();
        }
      }),
      onOfflineReady: () => {
        this.alert(t("app.offlineReady")).catch(console.error);
      },
    });

    if (
      !userConfiguredTheme &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.darkModeEnter();
      return;
    }

    if (userConfiguredTheme === "dark") {
      this.darkModeEnter();
      return;
    }

    // Set everything up for default light mode.
    this.darkModeLeave();
  }

  disconnectedCallback(): void {
    globalStore = undefined;

    if (this._onSchemePreferenceChanged) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", this._onSchemePreferenceChanged);
      this._onSchemePreferenceChanged = undefined;
    }
  }

  darkModeEnter() {
    document.documentElement.classList.add("sl-theme-dark");
    this.darkMode = true;
    localStorage.setItem("plantdb.theme", "dark");

    this.dispatchEvent(new CustomEvent("pn-theme-changed", { detail: "dark" }));
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;
    localStorage.setItem("plantdb.theme", "light");

    this.dispatchEvent(new CustomEvent("pn-theme-changed", { detail: "light" }));
  }

  async changeLocale(locale: SupportedLocales) {
    await i18next.changeLanguage(locale);
    this.locale = i18next.language;
    document.documentElement.lang = i18next.language;
    this._updateTextDirectionality();
    Settings.defaultLocale = i18next.language;
    this.dispatchEvent(new CustomEvent("pn-i18n-changed", { detail: i18next.language }));
  }

  private _updateTextDirectionality() {
    if (this.locale === "he-IL") {
      document.documentElement.dir = "rtl";
    } else {
      document.documentElement.dir = "ltr";
    }
  }

  drawerOpen() {
    if (this.drawerIsOpen) {
      return;
    }

    this.drawerIsOpen = true;
    this.dispatchEvent(new CustomEvent("pn-drawer-open", { detail: true }));
  }

  drawerClose() {
    if (!this.drawerIsOpen) {
      return;
    }

    this.drawerIsOpen = false;
    this.dispatchEvent(new CustomEvent("pn-drawer-open", { detail: false }));
  }

  /**
   * Invoked when the user clicked on a link.
   *
   * @param href The path of the link the user clicked on.
   */
  handleUserNavigationEvent(href: string) {
    const { path, pathParameters, pathQuery } = this.parsePath(href);
    this.page = path as KnownViews;
    this.pageParams = pathParameters;
    this.pageQuery = pathQuery;

    this.dispatchEvent(
      new CustomEvent("pn-navigate", {
        detail: { page: this.page, pageParams: this.pageParams, pageQuery: this.pageQuery },
      })
    );
  }

  /**
   * Navigates to a given view, without updating the browser's location.
   * If you need to update the browsers' location, use `navigateTo()` instead.
   *
   * @param page The view to navigate to.
   * @param pageParams The parameters for the view.
   * @param pageQuery The search/query part to pass to the view.
   */
  navigate(page: KnownViews, pageParams = new Array<string>(), pageQuery?: Record<string, string>) {
    this.page = page;
    this.pageParams = pageParams;
    this.pageQuery = pageQuery;

    this.drawerClose();

    this.dispatchEvent(
      new CustomEvent("pn-navigate", {
        detail: { page: this.page, pageParams: this.pageParams, pageQuery: this.pageQuery },
      })
    );
  }

  /**
   * Updates the browser's location and navigates to the given view.
   * If the browser is already navigated to the given page and the view only needs to be drawn,
   * use `navigate()` instead.
   *
   * @param page The view to navigate to.
   * @param pageParams The parameters for the view.
   * @param pageQuery The query part for the URL.
   */
  navigateTo(page: KnownViews, pageParams = new Array<string>(), pageQuery = "") {
    const href = this.makePath(page, pageParams, pageQuery);
    this.navigatePath(href);
  }

  /**
   * Updates the browser's location and navigates to the given view.
   *
   * @param href The path to navigate to.
   */
  navigatePath(href: string) {
    const newPath = import.meta.env.BASE_URL + (href.startsWith("/") ? href.slice(1) : href);
    history.pushState(null, "", newPath);

    const { path, pathParameters } = this.parsePath(href);

    this.navigate(path as KnownViews, pathParameters);
  }

  parsePath(href: string, assumePathForRoot: KnownViews = "log") {
    if (href.startsWith(import.meta.env.BASE_URL)) {
      href = href.slice(import.meta.env.BASE_URL.length - 1);
    }

    // If the path is / then allow the fallback to take its place.
    // The fallback has no / prefix, as it's the name of a view.
    // If the path is something else, slice off any / prefix.
    // Then ensure the final thing _does_ have a / prefix.
    const pathString = `/${
      href === "/" ? assumePathForRoot : href.startsWith("/") ? href.slice(1) : href
    }`;

    const url = new URL(`${location.origin}${pathString}`);

    const pathParts = pathString.split("/");
    if (1 < pathParts.length) {
      return {
        path: pathParts[1],
        pathParameters: pathParts.slice(2),
        pathQuery: Object.fromEntries(url.searchParams.entries()),
      };
    }

    return {
      path: pathString,
      pathParameters: [],
      pathQuery: Object.fromEntries(url.searchParams.entries()),
    };
  }
  makePath(page: KnownViews, pageParams = new Array<string>(), pageQuery = "") {
    const params = pageParams.length ? pageParams.join("/") : "";
    return `${page}/${params}${pageQuery ? `?${pageQuery}` : ""}`;
  }

  alert(message: string, variant = "primary", icon = "info-circle", duration = 3000) {
    const escapeHtml = (html: string) => {
      const div = document.createElement("div");
      div.textContent = html;
      return div.innerHTML;
    };

    const alert = Object.assign(document.createElement("sl-alert"), {
      variant,
      closable: true,
      duration: duration,
      innerHTML: `
        <sl-icon name="${icon}" slot="icon"></sl-icon>
        ${escapeHtml(message)}
      `,
    });

    document.body.append(alert);
    return alert.toast();
  }

  async confirm(message: string, title = "") {
    const confirm = Object.assign(document.createElement("pn-confirm-dialog"), {
      message,
      title,
    }) as ConfirmDialog;
    return confirm.show();
  }

  showEntryEditor(logEntry?: Partial<LogEntry>) {
    const index = logEntry?.id ? logEntry.id.toString() : "new";

    const template = logEntry
      ? new URLSearchParams(logEntry as Record<string, string>).toString()
      : undefined;

    return new Promise<LogEntry | null>(resolve => {
      this.navigateTo("log-entry", [index], template);

      const onCancel = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve(null);

        document.removeEventListener("pn-log-entry-saved", onSave);
        document.removeEventListener("pn-log-entry-cancelled", onCancel);
      };
      const onSave = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve((event as CustomEvent<LogEntry>).detail);

        document.removeEventListener("pn-log-entry-saved", onSave);
        document.removeEventListener("pn-log-entry-cancelled", onCancel);
      };

      document.addEventListener("pn-log-entry-saved", onSave);
      document.addEventListener("pn-log-entry-cancelled", onCancel);
    });
  }

  showPlantEditor(plant?: Plant) {
    return new Promise<Plant | null>(resolve => {
      this.navigateTo("plant-properties", [plant ? plant.id : "new"]);

      const onCancel = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve(null);

        document.removeEventListener("pn-properties-saved", onSave);
        document.removeEventListener("pn-properties-cancelled", onCancel);
      };
      const onSave = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve((event as CustomEvent<Plant>).detail);

        document.removeEventListener("pn-properties-saved", onSave);
        document.removeEventListener("pn-properties-cancelled", onCancel);
      };

      document.addEventListener("pn-properties-saved", onSave);
      document.addEventListener("pn-properties-cancelled", onCancel);
    });
  }

  async editLogEntry(logEntry: LogEntry) {
    assertExists(this.plantStore);
    console.debug(`Editing log entry ${logEntry.id}`);

    const updatedEntry = await this.showEntryEditor(logEntry);
    if (!updatedEntry) {
      return;
    }

    const shouldDelete = updatedEntry.plantId === "" || updatedEntry.type === "";

    const newDb = shouldDelete
      ? this.plantStore.plantDb.withoutLogEntry(logEntry)
      : this.plantStore.plantDb.withUpdatedLogEntry(updatedEntry, logEntry);

    if (shouldDelete) {
      this.alert(t("log.entryDeleted"), "danger", "x-circle").catch(console.error);
    } else {
      this.alert(t("log.entryUpdated")).catch(console.error);
    }

    return this.plantStore.updatePlantDb(newDb);
  }

  async editPlant(plant: Plant) {
    assertExists(this.plantStore);

    console.debug(`Show details dialog for plant #${plant.id}`);
    const updatedPlant = await this.showPlantEditor(plant);
    if (!updatedPlant) {
      return;
    }

    const shouldDelete = updatedPlant.id === "";

    const newDb = shouldDelete
      ? this.plantStore.plantDb.withoutPlant(plant)
      : this.plantStore.plantDb.withUpdatedPlant(updatedPlant, plant);

    if (shouldDelete) {
      void this.alert(t("plant.plantDeleted"), "danger", "x-circle");
    } else {
      void this.alert(t("plant.plantUpdated"));
    }

    return this.plantStore.updatePlantDb(newDb);
  }
}
