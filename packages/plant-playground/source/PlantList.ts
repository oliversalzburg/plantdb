import { Plant } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mustExist } from "./Maybe";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi, retrieveStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-list")
export class PlantList extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
        flex: 1;
        min-height: 0;
        overflow: auto;
      }

      #filter-input {
        padding: 1rem;
      }

      plant-card {
        cursor: pointer;
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  @property()
  filter = "";

  private _filterMatchesPlant(plant: Plant, filter: string) {
    const terms = filter.toLocaleLowerCase().split(" ");
    for (const term of terms) {
      if (!plant.indexableText.includes(term)) {
        return false;
      }
    }
    return true;
  }

  render() {
    // Initial state is plants sorted according to their oldest log entry (their "birth").
    let filteredPlants = this.plants.sort(
      (a, b) =>
        (a.logEntryOldest?.timestamp?.valueOf() ?? 0) -
        (b.logEntryOldest?.timestamp?.valueOf() ?? 0)
    );

    if (this.filter) {
      const index = mustExist(this.plantStore).indexFromPlants(this.plants);
      const filtered = mustExist(this.plantStore).searchPlants(this.filter, index);
      filteredPlants = filteredPlants.filter(entry => filtered.includes(entry));
    }

    return [
      html`<sl-input
        placeholder=${t("placeholder.filter")}
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
        id="filter-input"
      ></sl-input>`,
      filteredPlants.map(
        plant =>
          html`<plant-card
            .plant=${plant}
            .plantDb=${this.plantStore?.plantDb}
            @click=${() => {
              retrieveStoreUi()?.navigatePath(`/plant/${plant.id ?? "PID-0"}`);
            }}
          ></plant-card>`
      ),
    ];
  }
}
