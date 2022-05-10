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

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "dark" }));
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;
    localStorage.setItem("plantdb.theme", "light");

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "light" }));
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
   * @param path The path of the link the user clicked on.
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
}
