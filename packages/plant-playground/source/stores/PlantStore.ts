import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

let globalStore: PlantStore | undefined;

export const retrieveStore = () => globalStore;

@customElement("plant-store")
export class PlantStore extends LitElement {
  @property({ type: Boolean })
  darkMode = false;

  private _onChange: ((event: MediaQueryListEvent) => void) | undefined;

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    const userConfiguredTheme = localStorage.getItem("plant-theme") as "light" | "dark" | null;

    // Watch for global theme preference change. If this happens, it overrides everything.
    if (window.matchMedia) {
      this._onChange = (event: MediaQueryListEvent) => {
        const newColorScheme = event.matches ? "dark" : "light";
        if (newColorScheme === "dark") {
          this.darkModeEnter();
        } else {
          this.darkModeLeave();
        }
      };
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", this._onChange);
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

    if (this._onChange) {
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", this._onChange);
      this._onChange = undefined;
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
}
