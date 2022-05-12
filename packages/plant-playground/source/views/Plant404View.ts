import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-404-view")
export class Plant404View extends View {
  static readonly styles = [
    ...View.styles,
    css`
      :host {
        text-align: center;
      }
      :host * {
        flex: 1;
      }
      a {
        color: var(--sl-color-primary-600);
      }
    `,
  ];

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
