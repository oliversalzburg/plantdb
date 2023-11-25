import { assertExists } from "@oliversalzburg/js-utils/nil.js";
import { Plant } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { translate as t } from "lit-i18n";
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

  @property({ attribute: false })
  plant: Plant | undefined;

  async createNewLogEntry(): Promise<void> {
    assertExists(this.plant);
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);

    const logEntry = await this.plantStoreUi.showEntryEditor({
      plantId: this.plant.id,
    });
    if (!logEntry) {
      return Promise.resolve(undefined);
    }

    console.debug(logEntry);
    const newDb = this.plantStore.plantDb.withNewLogEntry(logEntry);
    return this.plantStore.updatePlantDb(newDb);
  }

  render() {
    return [
      this.plant
        ? html`<pn-plant-details
              id="details"
              .plantStore=${this.plantStore}
              .plantStoreUi=${this.plantStoreUi}
              .plant=${this.plant}
            ></pn-plant-details>
            <section class="footer">
              <sl-button variant="primary" @click=${() => this.createNewLogEntry()}
                >${t("log.add")}</sl-button
              >
            </section>`
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
