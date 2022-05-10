import { html } from "lit";
import { customElement } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-404-view")
export class Plant404View extends View {
  static readonly styles = [...View.styles];

  render() {
    return [
      html`<section>
        <h2>Oops! You hit a 404</h2>
        <p>
          The page you're looking for doesn't seem to exist. Head back
          <a href="">home</a> and try again?
        </p>
      </section>`,
    ];
  }
}
