import { PlantDB } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-log-view")
export class PlantLogView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
      }

      .empty {
        flex: 1;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  render() {
    return [
      0 < this.plantDb.log.length
        ? html`<plant-log .plantDb=${this.plantDb} .log=${this.plantDb.log}></plant-log>
            <section class="footer">
              <sl-button variant="primary" disabled>Add log entry</sl-button>
            </section>`
        : html`<plant-empty-state class="empty"
            ><p>${t("logEmpty")}</p>

            <sl-button href="import" variant="primary">Import now</sl-button></plant-empty-state
          >`,
    ];
  }
}
