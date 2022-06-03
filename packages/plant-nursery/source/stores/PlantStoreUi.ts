import { getBasePath } from "@shoelace-style/shoelace";
import i18next, { t } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Settings } from "luxon";
import { LogEntry, Plant } from "packages/libplantdb/typings";
import { registerSW } from "virtual:pwa-register";
import { assertExists, mustExist } from "../Maybe";
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
  | "types"
  | "view404";

@customElement("plant-store-ui")
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
      })
      .then(() => {
        this.i18nReady = true;
        this.locale = i18next.language;
        document.documentElement.lang = i18next.language;
        this._updateTextDirectionality();
        Settings.defaultLocale = i18next.language;
        this.dispatchEvent(new CustomEvent("plant-i18n-ready", { detail: i18next.language }));
      })
      .catch(console.error);

    const updateSW = registerSW({
      onNeedRefresh: () => {
        if (this.confirm("Load new version?")) {
          updateSW().catch(console.error);
        }
      },
      onOfflineReady: () => {
        this.alert("offline ready").catch(console.error);
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

    this.dispatchEvent(new CustomEvent("plant-theme-changed", { detail: "dark" }));
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;
    localStorage.setItem("plantdb.theme", "light");

    this.dispatchEvent(new CustomEvent("plant-theme-changed", { detail: "light" }));
  }

  async changeLocale(locale: SupportedLocales) {
    await i18next.changeLanguage(locale);
    this.locale = i18next.language;
    document.documentElement.lang = i18next.language;
    this._updateTextDirectionality();
    Settings.defaultLocale = i18next.language;
    this.dispatchEvent(new CustomEvent("plant-i18n-changed", { detail: i18next.language }));
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
    this.dispatchEvent(new CustomEvent("plant-drawer-open", { detail: true }));
  }

  drawerClose() {
    if (!this.drawerIsOpen) {
      return;
    }

    this.drawerIsOpen = false;
    this.dispatchEvent(new CustomEvent("plant-drawer-open", { detail: false }));
  }

  /**
   * Invoked when the user clicked on a link.
   *
   * @param href The path of the link the user clicked on.
   */
  handleUserNavigationEvent(href: string) {
    const { path, pathParameters } = this.parsePath(href);
    this.page = path as KnownViews;
    this.pageParams = pathParameters;

    this.dispatchEvent(
      new CustomEvent("plant-navigate", {
        detail: { page: this.page, pageParams: this.pageParams },
      })
    );
  }

  /**
   * Navigates to a given view, without updating the browser's location.
   * If you need to update the browsers' location, use `navigateTo()` instead.
   *
   * @param page The view to navigate to.
   * @param pageParams The parameters for the view.
   */
  navigate(page: KnownViews, pageParams = new Array<string>()) {
    this.page = page;
    this.pageParams = pageParams;

    this.drawerClose();

    this.dispatchEvent(
      new CustomEvent("plant-navigate", {
        detail: { page: this.page, pageParams: this.pageParams },
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
   */
  navigateTo(page: KnownViews, pageParams = new Array<string>()) {
    const href = this.makePath(page, pageParams);
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

    const pathString =
      href === "/" ? assumePathForRoot : href.startsWith("/") ? href.slice(1) : href;

    if (pathString.includes("/")) {
      const pathParts = pathString.split("/");
      return { path: pathParts[0], pathParameters: pathParts.slice(1) };
    }

    return { path: pathString, pathParameters: [] };
  }
  makePath(page: KnownViews, pageParams = new Array<string>()) {
    const params = pageParams.length ? pageParams.join("/") : "";
    return `${page}/${params}`;
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

  confirm(message: string) {
    return window.confirm(message);
  }

  showEntryEditor(logEntry?: LogEntry) {
    const index = logEntry
      ? mustExist(this.plantStore).plantDb.log.indexOf(logEntry).toString()
      : "new";

    return new Promise<LogEntry | null>(resolve => {
      this.navigateTo("log-entry", [index]);

      const onCancel = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve(null);

        document.removeEventListener("plant-log-entry-saved", onSave);
        document.removeEventListener("plant-log-entry-cancelled", onCancel);
      };
      const onSave = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve((event as CustomEvent<LogEntry>).detail);

        document.removeEventListener("plant-log-entry-saved", onSave);
        document.removeEventListener("plant-log-entry-cancelled", onCancel);
      };

      document.addEventListener("plant-log-entry-saved", onSave);
      document.addEventListener("plant-log-entry-cancelled", onCancel);
    });
  }

  showPlantEditor(plant?: Plant) {
    return new Promise<Plant | null>(resolve => {
      this.navigateTo("plant-properties", [plant ? plant.id : "new"]);

      const onCancel = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve(null);

        document.removeEventListener("plant-properties-saved", onSave);
        document.removeEventListener("plant-properties-cancelled", onCancel);
      };
      const onSave = (event: Event) => {
        event.preventDefault();
        history.back();

        resolve((event as CustomEvent<Plant>).detail);

        document.removeEventListener("plant-properties-saved", onSave);
        document.removeEventListener("plant-properties-cancelled", onCancel);
      };

      document.addEventListener("plant-properties-saved", onSave);
      document.addEventListener("plant-properties-cancelled", onCancel);
    });
  }

  async editLogEntry(logEntry: LogEntry) {
    assertExists(this.plantStore);

    const updatedEntry = await this.showEntryEditor(logEntry);
    if (!updatedEntry) {
      return;
    }

    const shouldDelete = updatedEntry.plantId === "" || updatedEntry.type === "";

    const newDb = shouldDelete
      ? this.plantStore.plantDb.withoutLogEntry(logEntry)
      : this.plantStore.plantDb.withUpdatedLogEntry(updatedEntry, logEntry);

    if (shouldDelete) {
      void this.alert(t("log.entryDeleted"), "danger", "x-circle");
    } else {
      void this.alert(t("log.entryUpdate"));
    }

    this.plantStore.updatePlantDb(newDb);
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

    this.plantStore.updatePlantDb(newDb);
  }
}