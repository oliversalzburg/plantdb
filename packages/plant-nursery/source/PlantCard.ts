import { isNil } from "@oliversalzburg/js-utils/nil.js";
import { EventTypes, identifyLogType, Plant, PlantDB } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import { css, html, LitElement } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("pn-plant-card")
export class PlantCard extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
      }

      sl-card {
        width: 100%;
      }

      sl-card [slot="header"] {
        display: flex;
        justify-content: right;
        align-items: center;
      }

      sl-card [slot="header"] sl-icon {
        margin-right: 0.5rem;
      }

      sl-card [slot="footer"] {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      sl-card [slot="footer"] ul {
        padding: 0;
        list-style: none;
      }

      sl-card [slot="footer"] ul li {
        color: #777;
      }
    `,
  ];

  @property({ attribute: false })
  plant: Plant | null | undefined;

  @property({ attribute: false })
  plantDb = PlantDB.Empty();

  render() {
    if (isNil(this.plant)) {
      return undefined;
    }

    let hasPendingPestInfestation = false;
    let hasPendingPestControl = false;
    let lastPestInfestation;
    let lastPestControl;
    const logsPestInfestation = this.plant.log.filter(
      logEntry => identifyLogType(logEntry.type, this.plantDb) === EventTypes.PestInfestation,
    );
    if (0 < logsPestInfestation.length) {
      lastPestInfestation = logsPestInfestation[0];
      if (-30 < DateTime.fromJSDate(lastPestInfestation.timestamp).diffNow("days").days) {
        hasPendingPestInfestation = true;
      }
    }
    const logsPestControl = this.plant.log.filter(
      logEntry => identifyLogType(logEntry.type, this.plantDb) === EventTypes.PestControl,
    );
    if (0 < logsPestControl.length) {
      lastPestControl = logsPestControl[logsPestControl.length - 1];
      const previousPestControl = 1 < logsPestControl.length ? logsPestControl[1] : undefined;

      // Is the last pest control more than 14 days ago?
      if (DateTime.fromJSDate(lastPestControl.timestamp).diffNow("days").days < -14) {
        // If there was a prior pest control within 14 days before this one, then this one
        // was already the reapplication and there is no pest control pending.
        if (
          !previousPestControl ||
          DateTime.fromJSDate(lastPestControl.timestamp).diff(
            DateTime.fromJSDate(previousPestControl.timestamp),
            "days",
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
                ${t("plant.whenInfested", {
                  when: `${DateTime.fromJSDate(lastPestInfestation.timestamp).toFormat("f")} (${
                    DateTime.fromJSDate(lastPestInfestation.timestamp).toRelative() ?? ""
                  })`,
                })}
                <br />
                ${t("plant.whenPestControl", {
                  when: lastPestControl
                    ? `${DateTime.fromJSDate(lastPestControl.timestamp).toFormat("f")} (${
                        DateTime.fromJSDate(lastPestControl.timestamp).toRelative() ?? ""
                      })`
                    : t("never"),
                })}
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
          ${t("plant.whenAdded", {
            when: this.plant.logEntryOldest
              ? DateTime.fromJSDate(this.plant.logEntryOldest.timestamp).toRelative()
              : t("never"),
          })}
          <br />
          ${t("plant.whenUpdated", {
            when: this.plant.logEntryLatest
              ? DateTime.fromJSDate(this.plant.logEntryLatest.timestamp).toRelative()
              : t("never"),
          })}
        </small>
      </div>
    </sl-card>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-card": PlantCard;
  }
}
