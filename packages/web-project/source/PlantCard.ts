import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { style } from "./PlantCard-css";

@customElement("plant-card")
export class PlantCard extends LitElement {
  static styles = [style];

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
    return html`<sl-card class="card-basic">
      <header><code>${this.plantId}</code></header>
      ${this.name}
      <em>${this.kind}</em>
      <footer>
        <ul>
          <li>Added: ${DateTime.fromJSDate(new Date(this.dateCreated)).toRelative()}</li>
          <li>Last updated: ${DateTime.fromJSDate(new Date(this.lastUpdated)).toRelative()}</li>
        </ul>
        <sl-button href="#confirm" role="button">Update</sl-button>
      </footer>
    </sl-card>`;
  }
}
