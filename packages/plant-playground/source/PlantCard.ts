import { identifyLogType, Plant, PlantDB } from "@plantdb/libplantdb";
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
        display: flex;
        justify-content: right;
        align-items: center;
      }

      :host sl-card [slot="header"] sl-icon {
        margin-right: 0.5rem;
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

  @property({ type: Plant })
  plant = Plant.Empty();

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  render() {
    let hasPendingPestInfestation = false;
    let hasPendingPestControl = false;
    let lastPestInfestation;
    let lastPestControl;
    const logsPestInfestation = this.plant.log.filter(
      logEntry => identifyLogType(logEntry.type, this.plantDb) === "PestInfestation"
    );
    if (0 < logsPestInfestation.length) {
      lastPestInfestation = logsPestInfestation[0];
      if (-30 < DateTime.fromJSDate(lastPestInfestation.timestamp).diffNow("days").days) {
        hasPendingPestInfestation = true;
      }
    }
    const logsPestControl = this.plant.log.filter(
      logEntry => identifyLogType(logEntry.type, this.plantDb) === "PestControl"
    );
    if (0 < logsPestControl.length) {
      lastPestControl = logsPestControl[0];
      const previousPestControl = 1 < logsPestControl.length ? logsPestControl[1] : undefined;

      // Is the last pest control more than 14 days ago?
      if (DateTime.fromJSDate(lastPestControl.timestamp).diffNow("days").days < -14) {
        // If there was a prior pest control within 14 days before this one, then this one
        // was already the reapplication and there is no pest control pending.
        if (
          previousPestControl &&
          DateTime.fromJSDate(lastPestControl.timestamp).diff(
            DateTime.fromJSDate(previousPestControl.timestamp),
            "days"
          ).days < -14
        ) {
          hasPendingPestControl = true;
        }
      }
    }

    return html`<sl-card>
      <div slot="header">
        ${lastPestInfestation
          ? html`<sl-tooltip
              ><div slot="content">
                Infested since: ${DateTime.fromJSDate(lastPestInfestation.timestamp).toFormat("f")}
                (${DateTime.fromJSDate(lastPestInfestation.timestamp).toRelative()})<br />Last pest
                control:
                ${lastPestControl
                  ? `${DateTime.fromJSDate(lastPestControl.timestamp).toFormat("f")} (${
                      DateTime.fromJSDate(lastPestControl.timestamp).toRelative() ?? ""
                    })`
                  : "never"}
              </div>
              <sl-icon name="bug"></sl-icon
            ></sl-tooltip>`
          : ""}<sl-badge
          variant=${hasPendingPestControl
            ? "danger"
            : hasPendingPestInfestation
            ? "warning"
            : "neutral"}
          >${this.plant.id}</sl-badge
        >
      </div>
      ${this.plant.name}
      <br />
      <small><em>${this.plant.kind}</em></small>
      <div slot="footer">
        <small>
          <ul>
            <li>Added: ${DateTime.fromJSDate(this.plant.logEntryOldest.timestamp).toRelative()}</li>
            <li>
              Last updated: ${DateTime.fromJSDate(this.plant.logEntryLatest.timestamp).toRelative()}
            </li>
          </ul>
        </small>
        <sl-button href="/plant/${this.plant.id}" role="button">Details</sl-button>
      </div>
    </sl-card>`;
  }
}