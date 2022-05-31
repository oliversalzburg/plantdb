import { kindFlatten, Plant } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-geek-info")
export class PlantGeekInfo extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
    `,
  ];

  @property({ type: Plant })
  plant: Plant | undefined;

  render() {
    if (!this.plant || !this.plant.plantGeekId) {
      return;
    }

    return html`<a href="https://www.plantgeek.co/plant/${
      this.plant.plantGeekId
    }" class="plantgeek-info" target="_blank">Visit ${kindFlatten(
      this.plant.kind
    )} on Plantgeek</div>`;
  }
}
