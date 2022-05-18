import { Plant } from "@plantdb/libplantdb";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-details-view")
export class PlantDetailsView extends View {
  static readonly styles = [...View.styles];

  @property()
  plant: Plant | undefined;

  render() {
    return [
      html`<plant-details
        .plantStore=${this.plantStore}
        .plantStoreUi=${this.plantStoreUi}
        .plant=${this.plant}
      ></plant-details>`,
    ];
  }
}
