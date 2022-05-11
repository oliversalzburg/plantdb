import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";

@customElement("plant-empty-state")
export class PlantEmptyState extends LitElement {
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
