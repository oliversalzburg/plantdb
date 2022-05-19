import { EventType } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-type-map-view")
export class PlantTypeMapView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      :host {
        padding: 1rem;
      }
    `,
  ];

  @property({ type: Map })
  proposedMapping = new Map<string, EventType>();

  render() {
    return [
      html`<plant-type-map
        .plantDb=${this.plantStore?.plantDb}
        .proposedMapping=${this.proposedMapping}
        @plant-config-changed=${() => this.plantStoreUi?.alert("Updated!")}
      ></plant-type-map>`,
    ];
  }
}
