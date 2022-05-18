import { EventType, identifyLogType, LogEntry, MATCH_PID_ALL, PlantDB } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { Typography } from "./PlantComponentStyles";

@customElement("plant-log-entry")
export class PlantLogEntry extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        flex: 1;
      }

      sl-card {
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

      #infos {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
      }

      sl-card section {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 2rem;
      }

      .event-type {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 1rem;
        margin-bottom: 0.25rem;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [LogEntry] })
  logEntry = new LogEntry(0, "");

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

  static extractTypeDetails(logEntry?: LogEntry, eventType?: EventType) {
    switch (eventType) {
      case "Acquisition":
        return { icon: "stars" };
      case "Fertilization":
        return {
          icon: "moisture",
          details: `${logEntry?.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry?.ph ? `pH: ${logEntry?.ph}` : ""
          }`,
        };
      case "Measurement":
        return {
          icon: "rulers",
          details: `${logEntry?.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry?.ph ? `pH: ${logEntry.ph}` : ""
          }`,
        };
      case "Observation":
        return { icon: "eye" };
      case "PestControl":
        return {
          icon: "radioactive",
          details: `${logEntry?.productUsed ? logEntry.productUsed : ""}`,
        };
      case "PestInfestation":
        return { icon: "bug" };
      case "Pruning":
        return { icon: "scissors" };
      case "Relocation":
        return { icon: "arrows-move" };
      case "Repotting":
        return { icon: "trash2" };
      case "RootPruning":
        return { icon: "scissors" };
      case "Shaping":
        return { icon: "gem" };
      case "Watering":
        return {
          icon: "droplet-half",
          details: `${logEntry?.ec ? `EC: ${logEntry.ec}µS/cm` : ""} ${
            logEntry?.ph ? `pH: ${logEntry.ph}` : ""
          }`,
        };
      default:
        return { icon: "" };
    }
  }

  augmentType(logEntry: LogEntry, eventType?: EventType) {
    const { icon, details } = PlantLogEntry.extractTypeDetails(logEntry, eventType);
    return html`${icon ? html`<sl-icon name="${icon}"></sl-icon> ` : undefined}${this.logEntry.type}
    ${details ?? ""}`;
  }

  render() {
    if (!this.plantDb) {
      return;
    }
    const identifiedType = identifyLogType(this.logEntry.type, this.plantDb);
    return [
      html`<sl-card>
        ${this.headerVisible && this.logEntry.plant
          ? html`<div slot="header">
              <div>
                ${this.logEntry.plant.name}
                <br />
                <small><em>${this.logEntry.plant.kind}</em></small>
              </div>
              <div id="infos">
                ${this.logEntry.plant.location
                  ? html`<sl-tooltip content=${this.logEntry.plant.location}
                      ><sl-icon name="geo-alt"></sl-icon
                    ></sl-tooltip>`
                  : undefined}
                <sl-badge variant="neutral">${this.logEntry.plant.id}</sl-badge>
              </div>
            </div>`
          : html``}
        <section>
          <div>
            ${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toFormat("f")}<br />
            <small
              >${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toRelative()}${this.logEntry
                .plant?.logEntryOldest === this.logEntry
                ? "🌟"
                : ""}</small
            >
          </div>
          <sl-divider vertical></sl-divider>
          <div>
            <strong class="event-type">${this.augmentType(this.logEntry, identifiedType)}</strong>
            <cite>${this.linkify(this.logEntry.note)}</cite>
          </div>
        </section>
      </sl-card>`,
    ];
  }

  linkify(text = "") {
    const matches = text.matchAll(MATCH_PID_ALL);
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
