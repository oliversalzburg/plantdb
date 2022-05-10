import { EventType, PlantDB } from "@plantdb/libplantdb";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-type-map-view")
export class PlantTypeMapView extends View {
  static readonly styles = [...View.styles];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: Map })
  proposedMapping = new Map<string, EventType>();

  render() {
    return [
      html`<plant-type-map
        .plantDb=${this.plantDb}
        .proposedMapping=${this.proposedMapping}
      ></plant-type-map>`,
    ];
  }
}