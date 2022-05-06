import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("plant-card")
export class PlantCard extends LitElement {
  static styles = css`
    :host {
      display: block;
      margin: var(--block-spacing-vertical) 0;
      padding: var(--block-spacing-vertical) var(--block-spacing-horizontal);
      border-radius: var(--border-radius);
      background: var(--card-background-color);
      box-shadow: var(--card-box-shadow);
    }
    :host > header,
    :host > footer {
      margin-right: calc(var(--block-spacing-horizontal) * -1);
      margin-left: calc(var(--block-spacing-horizontal) * -1);
      padding: calc(var(--block-spacing-vertical) * 0.66) var(--block-spacing-horizontal);
      background-color: var(--card-sectionning-background-color);
    }
    :host > header {
      margin-top: calc(var(--block-spacing-vertical) * -1);
      margin-bottom: var(--block-spacing-vertical);
      border-bottom: var(--border-width) solid var(--card-border-color);
    }
    :host > footer {
      margin-top: var(--block-spacing-vertical);
      margin-bottom: calc(var(--block-spacing-vertical) * -1);
      border-top: var(--border-width) solid var(--card-border-color);
    }
  `;

  @property()
  plantId = "";

  @property()
  name = "";

  @property()
  kind = "";

  @property()
  dateCreated = "";

  @property()
  lastUpdated = "";

  render() {
    return html`<header>${this.plantId}</header>
      ${this.name}
      <em>${this.kind}</em>
      <footer>
        <ul>
          <li>Added: ${DateTime.fromJSDate(new Date(this.dateCreated)).toRelative()}</li>
          <li>Last updated: ${DateTime.fromJSDate(new Date(this.lastUpdated)).toRelative()}</li>
        </ul>
      </footer>`;
  }
}
