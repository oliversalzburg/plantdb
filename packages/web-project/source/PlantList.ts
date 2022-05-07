import { Plant } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-list")
export class PlantList extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  render() {
    return this.plants.map(
      plant =>
        html`<plant-card
          plantId="${plant.id}"
          name="${plant.name}"
          kind="${plant.kind}"
        ></plant-card>`
    );
  }
}
