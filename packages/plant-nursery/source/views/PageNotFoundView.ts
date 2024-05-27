import { css, html } from "lit";
import { translate as t } from "lit-i18n";
import { customElement } from "lit/decorators.js";
import { View } from "./View.js";

@customElement("pn-page-not-found-view")
export class PageNotFoundView extends View {
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
        <h2>${t("app.404Title")}</h2>
        <p>${t("app.404Body")}</p>
        <sl-button href="list" variant="primary">${t("empty.backToPlants")}</sl-button>
      </section>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-page-not-found-view": PageNotFoundView;
  }
}
