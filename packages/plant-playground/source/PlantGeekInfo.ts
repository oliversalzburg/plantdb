import { kindFlatten, Plant } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";

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

  @state()
  private _plantgeekInfo = "";

  protected updated(
    _changedProperties: PropertyValueMap<PlantGeekInfo> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("plant")) {
      this._updateInfo();
    }
  }

  private async _updateInfo() {
    if (!this.plant || !this.plant.plantGeekId) {
      return;
    }

    const plantgeekId = Array.isArray(this.plant.plantGeekId)
      ? this.plant.plantGeekId[0]
      : this.plant.plantGeekId;

    const geekInfoResponse = await fetch(
      `https://www.plantgeek.co/plantgeek-api/v1/plant/${plantgeekId}`,
      {
        credentials: "omit",
        headers: {
          "User-Agent": "plantdb Playground",
          Accept: "application/json",
        },
        method: "GET",
      }
    );

    this._plantgeekInfo = (await geekInfoResponse.json()) as string;
  }

  render() {
    return html`<sl-textarea .value=${
      this._plantgeekInfo
    }></sl-textarea><a href="https://www.plantgeek.co/plant/${
      this.plant.plantGeekId
    }" class="plantgeek-info" target="_blank">Visit ${kindFlatten(
      this.plant.kind
    )} on Plantgeek</div>`;
  }
}
