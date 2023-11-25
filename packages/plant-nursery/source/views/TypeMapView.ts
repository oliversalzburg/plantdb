import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import { EventType } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("pn-type-map-view")
export class TypeMapView extends View {
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

  @property({ attribute: false })
  proposedMapping = new Map<string, EventType>();

  render() {
    return [
      0 < mustExist(this.plantStore).plantDb.entryTypes.size
        ? html`<pn-type-map
            id="type-map"
            .plantDb=${this.plantStore?.plantDb}
            .proposedMapping=${this.proposedMapping}
          ></pn-type-map>`
        : html`<pn-empty-state class="empty">${t("typeMap.empty")}</pn-empty-state>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-type-map-view": TypeMapView;
  }
}
