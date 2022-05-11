import { Plant, PlantDB } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-list-view")
export class PlantListView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .empty {
        min-width: 100%;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  render() {
    return [
      0 < this.plantDb.plants.size
        ? html`<plant-list .plants=${this.plants} .plantDb=${this.plantDb}></plant-list>`
        : html`<plant-empty-state class="empty"
            ><p>It seems like you have no plants 😔</p>

            <sl-button href="import" variant="primary">Import now</sl-button></plant-empty-state
          >`,
    ];
  }
}
