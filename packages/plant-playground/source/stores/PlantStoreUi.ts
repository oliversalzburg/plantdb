import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

let globalStore: PlantStoreUi | undefined;

export const retrieveStoreUi = () => globalStore;

@customElement("plant-store-ui")
export class PlantStoreUi extends LitElement {
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

    if (
      !userConfiguredTheme &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
    ) {
      this.darkModeEnter();
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
    localStorage.setItem("plant-theme", "dark");

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "dark" }));
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;
    localStorage.setItem("plant-theme", "light");

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "light" }));
  }

  drawerOpen() {
    this.drawerIsOpen = true;
    this.dispatchEvent(new CustomEvent("plant-drawer-open", { detail: true }));
  }

  drawerClose() {
    this.drawerIsOpen = false;
    this.dispatchEvent(new CustomEvent("plant-drawer-open", { detail: false }));
  }

  navigate(page: string, pageParams = new Array<string>()) {
    this.page = page;
    this.pageParams = pageParams;

    this.dispatchEvent(new CustomEvent("plant-navigate", { detail: { page, pageParams } }));
  }
  navigatePath(path: string) {
    history.pushState(null, "", path);

    // Extract the page name from path.
    const pathString = path === "/" ? "log" : path.slice(1);

    if (pathString.includes("/")) {
      const pathParts = pathString.split("/");
      return this.navigate(pathParts[0], pathParts.slice(1));
    }

    // Any other info you might want to extract from the path (like page type),
    // you can do here
    this.navigate(pathString);
  }
}
