import { LogEntry, Plant } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("plant-log-entry")
export class PlantLogEntry extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
        width: 100%;
      }

      :host sl-card {
        width: 95%;
        margin: 1rem;
      }

      :host sl-card [slot="header"] {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      :host sl-card section {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 2rem;
      }
    `,
  ];

  @property({ type: [LogEntry] })
  log = new LogEntry("");

  @property({ type: Plant })
  plant = Plant.Empty();

  render() {
    return html`<sl-card>
      <div slot="header">
        <div>
          ${this.plant.name}
          <br />
          <small><em>${this.plant.kind}</em></small>
        </div>
        <sl-badge variant="neutral">${this.plant.id}</sl-badge>
      </div>
      <section>
        <div>
          ${DateTime.fromJSDate(new Date(this.log.timestamp)).toFormat("f")}<br />
          <small>${DateTime.fromJSDate(new Date(this.log.timestamp)).toRelative()}</small>
        </div>
        <sl-divider vertical></sl-divider>
        ${this.log.type}: ${this.log.note}
      </section>
    </sl-card>`;
  }
}
