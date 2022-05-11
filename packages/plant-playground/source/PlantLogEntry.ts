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
  plant: Plant | null = Plant.Empty();

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

  extractTypeDetails(logEntry: LogEntry, eventType?: EventType) {
    switch (eventType) {
      case "Acquisition":
        return { icon: "🌟" };
      case "Fertilization":
        return {
          icon: "🧪",
          details: `${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry.ph ? `pH: ${logEntry.ph}` : ""
          }`,
        };
      case "Measurement":
        return {
          icon: "📏",
          details: `${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry.ph ? `pH: ${logEntry.ph}` : ""
          }`,
        };
      case "Observation":
        return { icon: "🔍" };
      case "PestControl":
        return { icon: "☠", details: `${logEntry.product ? logEntry.product : ""}` };
      case "PestInfestation":
        return { icon: "🐛" };
      case "Pruning":
        return { icon: "✂" };
      case "Relocation":
        return { icon: "🏠" };
      case "Repotting":
        return { icon: "🌻" };
      case "RootPruning":
        return { icon: "✂" };
      case "Shaping":
        return { icon: "✂" };
      case "Watering":
        return {
          icon: "💧",
          details: `${logEntry.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry.ph ? `pH: ${logEntry.ph}` : ""
          }`,
        };
      default:
        return { icon: "" };
    }
  }

  augmentType(logEntry: LogEntry, eventType?: EventType) {
    const { icon, details } = this.extractTypeDetails(logEntry, eventType);
    return `${icon}${icon ? " " : ""}${this.logEntry.type} ${details ?? ""}`;
  }

  render() {
    const identifiedType = identifyLogType(this.logEntry.type, this.plantDb);
    return [
      html`<sl-card>
        ${this.headerVisible && this.plant
          ? html`<div
              slot="header"
              @click=${() => {
                retrieveStoreUi()?.navigatePath(`/plant/${this.plant?.id ?? "PID-0"}`);
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
                ?.logEntryOldest === this.logEntry
                ? "🌟"
                : ""}</small
            >
          </div>
          <sl-divider vertical></sl-divider>
          <div>
            <strong>${this.augmentType(this.logEntry, identifiedType)}</strong>
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
      output.push(html`<a href="plant/${match[0]}">${match[0]}</a>`);
      lastIndex = match.index + match[0].length;
    }
    output.push(html`${text.substring(lastIndex)}`);
    return output;
  }
}
