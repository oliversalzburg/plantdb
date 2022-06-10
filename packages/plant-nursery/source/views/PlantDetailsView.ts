import { Plant } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("pn-plant-details-view")
export class PlantDetailsView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      @media (min-width: 1400px) {
        #details {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #details {
          padding: 0 20vw;
        }
      }
      @media (min-width: 2400px) {
        #details {
          padding: 0 25vw;
        }
      }

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
        ? html`<pn-plant-details
            id="details"
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .plant=${this.plant}
          ></pn-plant-details>`
        : html`<pn-empty-state class="empty"
            ><p>${t("empty.plant")}</p>

            <sl-button href="list" variant="primary"
              >${t("empty.backToPlants")}</sl-button
            ></pn-empty-state
          >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-details-view": PlantDetailsView;
  }
}
