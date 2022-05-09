import { Plant, PlantDB } from "@plantdb/libplantdb";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-list-view")
export class PlantListView extends View {
  static readonly styles = [...View.styles];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  render() {
    return [html`<plant-list .plants=${this.plants} .plantDb=${this.plantDb}></plant-list>`];
  }
}
