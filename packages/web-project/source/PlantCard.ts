import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("plant-card")
export class PlantCard extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
        width: 400px;
      }

      :host sl-card {
        width: 95%;
        margin: 1rem;
      }

      :host sl-card [slot="header"] {
        text-align: right;
      }

      :host sl-card [slot="footer"] {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      :host sl-card [slot="footer"] ul {
        padding: 0;
        list-style: none;
      }

      :host sl-card [slot="footer"] ul li {
        color: #777;
      }
    `,
  ];

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
    return html`<sl-card>
      <div slot="header"><sl-badge variant="neutral">${this.plantId}</sl-badge></div>
      ${this.name}
      <br />
      <small><em>${this.kind}</em></small>
      <div slot="footer">
        <small>
          <ul>
            <li>Added: ${DateTime.fromJSDate(new Date(this.dateCreated)).toRelative()}</li>
            <li>Last updated: ${DateTime.fromJSDate(new Date(this.lastUpdated)).toRelative()}</li>
          </ul>
        </small>
        <sl-button href="#confirm" role="button">Update</sl-button>
      </div>
    </sl-card>`;
  }
}
