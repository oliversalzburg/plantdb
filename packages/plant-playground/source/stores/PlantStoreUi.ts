import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

let globalStore: PlantStoreUi | undefined;

export const retrieveStore = () => globalStore;

@customElement("plant-store-ui")
export class PlantStoreUi extends LitElement {
  @property({ type: Boolean })
  darkMode = false;

  private _onChange: ((event: MediaQueryListEvent) => void) | undefined;

  connectedCallback(): void {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    globalStore = this;

    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.darkModeEnter();
    }

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

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "dark" }));
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;

    this.dispatchEvent(new CustomEvent("plant-theme-change", { detail: "light" }));
  }
}
