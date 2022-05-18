import { Plant } from "@plantdb/libplantdb";
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

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  render() {
    return [
      0 < (this.plantStore?.plantDb.plants.size ?? 0)
        ? html`<plant-list
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .plants=${this.plants}
          ></plant-list>`
        : html`<plant-empty-state class="empty"
            ><p>It seems like you have no plants 😔</p>

            <sl-button href="import" variant="primary">Import now</sl-button></plant-empty-state
          >`,
    ];
  }
}
