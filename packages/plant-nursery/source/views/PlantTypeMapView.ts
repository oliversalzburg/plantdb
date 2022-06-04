import { EventType } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { mustExist } from "../Maybe";
import { View } from "./View";

@customElement("plant-type-map-view")
export class PlantTypeMapView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      @media (min-width: 1000px) {
        #type-map {
          padding: 0 15vw;
        }
      }
      @media (min-width: 1600px) {
        #type-map {
          padding: 0 25vw;
        }
      }
      @media (min-width: 2200px) {
        #type-map {
          padding: 0 30vw;
        }
      }

      :host {
        overflow: auto;
        padding: 1rem;
      }

      .empty {
        flex: 1;
        text-align: center;
      }
    `,
  ];

  @property({ type: Map })
  proposedMapping = new Map<string, EventType>();

  render() {
    return [
      0 < mustExist(this.plantStore).plantDb.entryTypes.size
        ? html`<plant-type-map
            id="type-map"
            .plantDb=${this.plantStore?.plantDb}
            .proposedMapping=${this.proposedMapping}
          ></plant-type-map>`
        : html`<plant-empty-state class="empty">${t("typeMap.empty")}</plant-empty-state>`,
    ];
  }
}
