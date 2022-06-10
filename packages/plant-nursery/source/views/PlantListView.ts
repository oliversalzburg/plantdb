import { Plant } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("pn-plant-list-view")
export class PlantListView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .empty {
        flex: 1;
      }
    `,
  ];

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  render() {
    return [
      0 < (this.plantStore?.plantDb.plants.size ?? 0)
        ? html`<pn-plant-list
            id="list"
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .plants=${this.plants}
          ></pn-plant-list>`
        : html`<pn-empty-state class="empty"
            ><p>${t("empty.plants")}</p>

            <sl-button href="import" variant="primary"
              >${t("empty.importNow")}</sl-button
            ></pn-empty-state
          >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-list-view": PlantListView;
  }
}
