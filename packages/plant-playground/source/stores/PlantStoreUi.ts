import i18next, { t } from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpApi from "i18next-http-backend";
import { html, LitElement, render } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Settings } from "luxon";
import { LogEntry } from "packages/libplantdb/typings";
import { PlantLogEntryForm } from "../PlantLogEntryForm";
import { PlantStore } from "./PlantStore";

let globalStore: PlantStoreUi | undefined;

export const retrieveStoreUi = () => globalStore;

export type SupportedLocales = "de-DE" | "en-US" | "he-IL";

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
  page = "list";
  @property({ type: [String] })
  pageParams = new Array<string>();

  private _onSchemePreferenceChanged: ((event: MediaQueryListEvent) => void) | undefined;

  connectedCallback(): void {
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
        debug: true,
        defaultNS: "playground",
        detection: {
          order: ["localStorage", "navigator"],
          caches: ["localStorage"],
          lookupLocalStorage: "plantdb.i18nextLng",
        },
        fallbackLng: ["en-US"],
        ns: ["common", "playground"],
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
    this.page = path;
    this.pageParams = pathParameters;

    this.dispatchEvent(
      new CustomEvent("plant-navigate", {
        detail: { page: this.page, pageParams: this.pageParams },
      })
    );
  }

  navigate(page: string, pageParams = new Array<string>()) {
    this.page = page;
    this.pageParams = pageParams;

    this.drawerClose();

    this.dispatchEvent(
      new CustomEvent("plant-navigate", {
        detail: { page: this.page, pageParams: this.pageParams },
      })
    );
  }
  navigatePath(href: string) {
    const newPath = import.meta.env.BASE_URL + (href.startsWith("/") ? href.slice(1) : href);
    history.pushState(null, "", newPath);

    const { path, pathParameters } = this.parsePath(href);

    this.navigate(path, pathParameters);
  }

  parsePath(href: string, assumePathForRoot = "log") {
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

  editLogEntry(plantStore: PlantStore, logEntry?: LogEntry) {
    return new Promise<LogEntry | null>((resolve, reject) => {
      const dialog = Object.assign(document.createElement("sl-dialog"), {
        label: t("log.add"),
      });

      render(
        html`<plant-log-entry-form
            id="entry-form"
            .plantStore=${plantStore}
            .plantStoreUi=${this}
            .logEntry=${logEntry}
          ></plant-log-entry-form>

          <sl-button
            slot="footer"
            variant="primary"
            @click=${() => {
              dialog
                .hide()
                .catch(console.error)
                .finally(() => document.body.removeChild(dialog));

              const entryForm = dialog.querySelector("#entry-form") as PlantLogEntryForm;
              entryForm.reportValidity();
              const logEntry = entryForm.asLogEntry();
              resolve(logEntry);
            }}
            >${t("save", { ns: "common" })}</sl-button
          ><sl-button
            slot="footer"
            @click=${() => {
              dialog
                .hide()
                .catch(console.error)
                .finally(() => document.body.removeChild(dialog));

              resolve(null);
            }}
            >${t("close", { ns: "common" })}</sl-button
          >`,
        dialog
      );

      document.body.appendChild(dialog);

      dialog.show().catch(reject);
    });
  }
}
