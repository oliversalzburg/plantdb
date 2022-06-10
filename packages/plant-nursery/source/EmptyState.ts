import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("pn-empty-state")
export class EmptyState extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
    `,
  ];

  render() {
    return [html`<slot></slot>`];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-empty-state": EmptyState;
  }
}
