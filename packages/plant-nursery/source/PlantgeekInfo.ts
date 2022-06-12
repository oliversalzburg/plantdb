import { kindFlatten, Plant } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isNil } from "./tools/Maybe";

@customElement("pn-plantgeek-info")
export class PlantgeekInfo extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }

      a {
        color: var(--sl-color-primary-600);
      }
    `,
  ];

  @property({ type: Plant })
  plant: Plant | undefined;

  render() {
    if (isNil(this.plant)) {
      return;
    }
    return Array.isArray(this.plant.plantgeekId)
      ? this.plant.plantgeekId.map(
          (plantgeekId, index) =>
            html`<a
              href="https://www.plantgeek.co/plant/${plantgeekId}"
              class="plantgeek-info"
              target="_blank"
              >Visit entry ${index + 1} on Plantgeek</a
            >`
        )
      : html`<a
          href="https://www.plantgeek.co/plant/${this.plant.plantgeekId}"
          class="plantgeek-info"
          target="_blank"
          >Visit ${kindFlatten(this.plant.kind)} on Plantgeek</a
        >`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plantgeek-info": PlantgeekInfo;
  }
}
