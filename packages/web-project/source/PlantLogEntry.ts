import { EventType, identifyLogType, LogEntry, Plant, PlantDB } from "@plantdb/libplantdb";
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

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [LogEntry] })
  logEntry = new LogEntry("");

  @property({ type: Plant })
  plant = Plant.Empty();

  extractTypeDetails(logEntry: LogEntry, eventType?: EventType) {
    switch (eventType) {
      case "Acquisition":
        return "🌟";
      case "Fertilization":
        return `🧪 ${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
          logEntry.ph ? `pH: ${logEntry.ph}` : ""
        }`;
      case "Measurement":
        return `📏 ${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
          logEntry.ph ? `pH: ${logEntry.ph}` : ""
        }`;
      default:
        return "";
    }
  }

  render() {
    const identifiedType = identifyLogType(this.logEntry.type, this.plantDb);
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
          ${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toFormat("f")}<br />
          <small>${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toRelative()}</small>
        </div>
        <sl-divider vertical></sl-divider>
        ${identifiedType ?? this.logEntry.type}:
        ${this.extractTypeDetails(this.logEntry, identifiedType)} ${this.logEntry.note}
      </section>
    </sl-card>`;
  }
}
