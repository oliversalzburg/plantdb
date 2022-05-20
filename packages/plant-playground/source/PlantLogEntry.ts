import { EventType, identifyLogType, LogEntry, MATCH_PID_ALL, PlantDB } from "@plantdb/libplantdb";
import { t } from "i18next";
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
      :host([headervisible]) sl-card::part(header):hover {
        background-color: var(--sl-color-primary-400);
      }

      #infos {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.25rem;
      }

      .navigation-guide {
        color: var(--sl-panel-background-color);
      }

      sl-card section {
        display: flex;
        flex-direction: row;
        align-items: center;
        height: 2rem;
      }

      .first-entry {
        cursor: default;
      }

      .event-type {
        display: flex;
        flex-direction: row;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.25rem;
      }

      .unmapped-guide a {
        text-decoration: none;
      }
      .unmapped-guide {
        visibility: hidden;
      }
      sl-card section:hover .unmapped-guide {
        visibility: visible;
      }

      .note-container {
        flex: 1;
      }

      .edit-button {
        flex: 0;
        visibility: hidden;
      }
      sl-card section:hover .edit-button {
        visibility: visible;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: LogEntry })
  logEntry: LogEntry | undefined;

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
    return html`${icon ? html`<sl-icon name="${icon}"></sl-icon> ` : undefined}${logEntry.type}
    ${details ?? ""}`;
  }

  render() {
    if (!this.plantDb || !this.logEntry) {
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
                <a class="navigation-guide" href="/plant/${this.logEntry.plant.id}"
                  >${t("log.goToDetails")}</a
                ><span class="navigation-guide"> →</span>
                ${this.logEntry.plant.location
                  ? html`<sl-tooltip content=${this.logEntry.plant.location}
                      ><sl-icon name="geo-alt"></sl-icon
                    ></sl-tooltip>`
                  : undefined}
                <sl-badge
                  variant="neutral"
                  @click=${() => this.dispatchEvent(new CustomEvent("plant-badge-click"))}
                  >${this.logEntry.plant.id}</sl-badge
                >
              </div>
            </div>`
          : undefined}
        <section>
          <div>
            ${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toFormat("f")}<br />
            <small class="first-entry"
              >${DateTime.fromJSDate(new Date(this.logEntry.timestamp)).toRelative()}${this.logEntry
                .plant?.logEntryOldest === this.logEntry
                ? html`<sl-tooltip content=${t("log.firstEntry")}><span>🌟</span></sl-tooltip>`
                : undefined}</small
            >
          </div>

          <sl-divider vertical></sl-divider>

          <div class="note-container">
            <strong class="event-type"
              >${this.augmentType(this.logEntry, identifiedType)}${!identifiedType
                ? html`<sl-tooltip class="unmapped-guide" content=${t("log.unmappedEvent")}
                    ><a href="/types">?</a></sl-tooltip
                  >`
                : undefined}</strong
            >

            <cite>${this.linkify(this.logEntry.note)}</cite>
          </div>

          <sl-tooltip content=${t("log.openEntry")} placement="left">
            <sl-icon-button
              class="edit-button"
              name="pencil"
              @click=${() => this.dispatchEvent(new CustomEvent("plant-body-click"))}
            ></sl-icon-button
          ></sl-tooltip>
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
