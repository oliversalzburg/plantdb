import { assertExists } from "@oliversalzburg/js-utils/nil.js";
import { Plant } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("pn-plant-list-view")
export class PlantListView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      #list {
        flex: 1;
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
      }

      .empty {
        flex: 1;
      }

      .or {
        margin: 1rem;
      }
    `,
  ];

  @property({ attribute: false })
  plants = new Array<Plant>();

  async createNewPlant() {
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);

    const plant = await this.plantStoreUi.showPlantEditor();
    if (!plant) {
      return Promise.resolve(undefined);
    }

    console.debug(plant);
    const newDb = this.plantStore.plantDb.withNewPlant(plant);
    return this.plantStore.updatePlantDb(newDb);
  }

  render() {
    return [
      0 < (this.plantStore?.plantDb.plants.size ?? 0)
        ? html`<pn-plant-list
              id="list"
              .plantStore=${this.plantStore}
              .plantStoreUi=${this.plantStoreUi}
              .plants=${this.plants}
            ></pn-plant-list>
            <section class="footer">
              <sl-button variant="primary" @click=${() => this.createNewPlant()}
                >${t("plant.add")}</sl-button
              >
            </section>`
        : html`<pn-empty-state class="empty"
            ><p>${t("empty.plants")}</p>

            <sl-button href="import" variant="primary">${t("empty.importNow")}</sl-button
            ><span class="or">${t("empty.or")}</span>
            <sl-button @click=${() => this.createNewPlant()}
              >${t("plant.add")}</sl-button
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
