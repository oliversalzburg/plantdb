import { PlantDB } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("plant-log-view")
export class PlantLogView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .empty {
        min-width: 100%;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  render() {
    return [
      0 < this.plantDb.log.length
        ? html`<plant-log .plantDb=${this.plantDb} .log=${this.plantDb.log}></plant-log>`
        : html`<plant-empty-state class="empty"
            ><p>It seems like you have no log entries 😔</p>

            <sl-button href="import" variant="primary">Import now</sl-button></plant-empty-state
          >`,
    ];
  }
}
