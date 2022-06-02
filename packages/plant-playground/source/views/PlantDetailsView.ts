import { Plant } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-details-view")
export class PlantDetailsView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .empty {
        flex: 1;
      }
    `,
  ];

  @property()
  plant: Plant | undefined;

  render() {
    return [
      this.plant
        ? html`<plant-details
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .plant=${this.plant}
          ></plant-details>`
        : html`<plant-empty-state class="empty"
            ><p>${t("empty.plant")}</p>

            <sl-button href="list" variant="primary"
              >${t("empty.backToPlants")}</sl-button
            ></plant-empty-state
          >`,
    ];
  }
}
