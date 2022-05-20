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
      :host {
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
            .plantDb=${this.plantStore?.plantDb}
            .proposedMapping=${this.proposedMapping}
            @plant-config-changed=${() => this.plantStoreUi?.alert(t("log.entryUpdated"))}
          ></plant-type-map>`
        : html`<plant-empty-state class="empty">${t("typeMap.empty")}</plant-empty-state>`,
    ];
  }
}
