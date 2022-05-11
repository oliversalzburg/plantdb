import { Plant, PlantDB } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-list")
export class PlantList extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
        flex: 1;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [Plant] })
  plants = new Array<Plant>();

  @property()
  filter = "";

  private _filterMatchesPlant(plant: Plant, filter: string) {
    const terms = filter.toLocaleLowerCase().split(" ");
    for (const term of terms) {
      if (!plant.indexableText.includes(term)) {
        return false;
      }
    }
    return true;
  }

  render() {
    return [
      html`<sl-input
        placeholder="Type filter here"
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
      ></sl-input>`,
      this.plants
        .filter(plant => this._filterMatchesPlant(plant, this.filter))
        .sort(
          (a, b) =>
            (a.logEntryOldest?.timestamp?.valueOf() ?? 0) -
            (b.logEntryOldest?.timestamp?.valueOf() ?? 0)
        )
        .map(plant => html`<plant-card .plant=${plant} .plantDb=${this.plantDb}></plant-card>`),
    ];
  }
}
