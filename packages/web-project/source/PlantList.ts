import { Plant } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
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

  @property()
  filter = "";

  render() {
    return [
      html`<sl-input
        placeholder="Type filter here"
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
      ></sl-input>`,
      this.plants
        .filter(plant => plant.indexableText.indexOf(this.filter.toLocaleLowerCase()) !== -1)
        .sort((a, b) => a.logEntryOldest.timestamp.valueOf() - b.logEntryOldest.timestamp.valueOf())
        .map(
          plant =>
            html`<plant-card
              plantId="${plant.id}"
              name="${plant.name}"
              kind="${plant.kind}"
              dateCreated="${plant.logEntryOldest.timestamp}"
              lastUpdated="${plant.logEntryLatest.timestamp}"
            ></plant-card>`
        ),
    ];
  }
}
