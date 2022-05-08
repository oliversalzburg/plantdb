import { PlantDB } from "@plantdb/libplantdb";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-log-view")
export class PlantLogView extends View {
  static readonly styles = [...View.styles];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  render() {
    return [html`<plant-log .plantDb=${this.plantDb} .log=${this.plantDb.log}></plant-log>`];
  }
}
