import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import { Plant } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { css, html, LitElement } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi, retrieveStoreUi } from "./stores/PlantStoreUi";

@customElement("pn-plant-list")
export class PlantList extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      #filter-input {
        padding: 1rem;
      }

      #cards {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        min-height: 0;
        overflow: auto;
        align-items: flex-start;
        gap: 1rem;
        justify-content: center;
        padding-top: 1rem;
      }

      pn-plant-card {
        cursor: pointer;
        width: 25rem;
      }

      pn-plant-card:hover {
        outline: 1px solid var(--sl-color-primary-100);
      }
    `,
  ];

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
  plants = new Array<Plant>();

  @property()
  filter = "";

  render() {
    // Initial state is plants sorted according to their oldest log entry (their "birth").
    let filteredPlants = this.plants.sort(
      (a, b) =>
        (a.logEntryOldest?.timestamp.valueOf() ?? 0) - (b.logEntryOldest?.timestamp.valueOf() ?? 0),
    );

    if (this.filter) {
      const index = mustExist(this.plantStore).indexFromPlants(this.plants);
      const filtered = mustExist(this.plantStore).searchPlants(this.filter, index);
      filteredPlants = filteredPlants.filter(entry => filtered.includes(entry));
    }

    return [
      html`<sl-input
        placeholder=${t("log.filterPlaceholder")}
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
        id="filter-input"
      ></sl-input>`,
      html`<div id="cards">
        ${filteredPlants.map(
          plant =>
            html`<pn-plant-card
              .plant=${plant}
              .plantDb=${this.plantStore?.plantDb}
              @click=${() => {
                retrieveStoreUi()?.navigatePath(`/plant/${plant.id}`);
              }}
            ></pn-plant-card>`,
        )}
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-list": PlantList;
  }
}
