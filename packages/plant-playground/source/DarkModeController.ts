import { LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("dark-mode-controller")
export class DarkModeController extends LitElement {
  @property({ type: Boolean })
  darkMode = false;

  constructor() {
    super();
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      this.darkModeEnter();
    }
  }

  install() {
    if (window.matchMedia) {
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", event => {
        const newColorScheme = event.matches ? "dark" : "light";
        if (newColorScheme === "dark") {
          this.darkModeEnter();
        } else {
          this.darkModeLeave();
        }
      });
    }
  }

  darkModeEnter() {
    document.documentElement.classList.add("sl-theme-dark");
    this.darkMode = true;
  }

  darkModeLeave() {
    document.documentElement.classList.remove("sl-theme-dark");
    this.darkMode = false;
  }
}
