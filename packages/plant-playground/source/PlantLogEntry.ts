import { EventType, identifyLogType, LogEntry, Plant, PlantDB } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { Typography } from "./PlantComponentStyles";
import { retrieveStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-log-entry")
export class PlantLogEntry extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        display: inline-block;
        width: 100%;
      }

      :host sl-card {
        padding: 1rem;
        width: 100%;
      }

      :host sl-card [slot="header"] {
        display: none;
      }

      :host([headervisible]) sl-card [slot="header"] {
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

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

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
      case "Observation":
        return "🔍";
      case "PestControl":
        return `☠ ${logEntry.product ? logEntry.product : ""}`;
      case "PestInfestation":
        return "🐛";
      case "Pruning":
        return "✂";
      case "Relocation":
        return "🏠";
      case "Repotting":
        return "🌻";
      case "RootPruning":
        return "✂";
      case "Shaping":
        return "✂";
      case "Watering":
        return `💧 ${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
          logEntry.ph ? `pH: ${logEntry.ph}` : ""
        }`;
      default:
        return "";
    }
  }

  render() {
    const identifiedType = identifyLogType(this.logEntry.type, this.plantDb);
    return [
      html`<sl-card>
        ${this.headerVisible
          ? html`<div
              slot="header"
              @click=${() => {
                retrieveStoreUi()?.navigatePath(`/plant/${this.plant.id}`);
              }}
            >
              <div>
                ${this.plant.name}
                <br />
                <small><em>${this.plant.kind}</em></small>
              </div>
              <sl-badge variant="neutral">${this.plant.id}</sl-badge>
            </div>`
          : html``}
        <section>
          <div>
            ${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toFormat("f")}<br />
            <small
              >${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toRelative()}${this.plant
                .logEntryOldest === this.logEntry
                ? "🌟"
                : ""}</small
            >
          </div>
          <sl-divider vertical></sl-divider>
          <div>
            <strong
              >${this.logEntry.type}:
              ${this.extractTypeDetails(this.logEntry, identifiedType)}</strong
            >
            <br /><cite>${this.linkify(this.logEntry.note)}</cite>
          </div>
        </section>
      </sl-card>`,
    ];
  }

  linkify(text = "") {
    const matches = text.matchAll(/PID-\d{1,6}/g);
    const output = [];
    let lastIndex = 0;
    for (const match of matches) {
      if (!match.index) {
        continue;
      }
      output.push(html`${text.substring(lastIndex, match.index)}`);
      output.push(html`<a href="/plant/${match[0]}">${match[0]}</a>`);
      lastIndex = match.index + match[0].length;
      console.debug(match.index);
    }
    output.push(html`${text.substring(lastIndex)}`);
    return output;
  }
}
