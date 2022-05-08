import { PlantDB } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-log")
export class PlantLog extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: [PlantDB] })
  plantDb = PlantDB.Empty();

  @property()
  filter = "";

  @property({ type: Boolean, reflect: true })
  active = false;

  protected shouldUpdate(): boolean {
    return this.active;
  }

  render() {
    return [
      html`<sl-input
        placeholder="Type filter here"
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
      ></sl-input>`,
      this.plantDb.log
        .filter(entry => entry.note?.indexOf(this.filter.toLocaleLowerCase()) !== -1)
        .reverse()
        .map(
          entry =>
            html`<plant-log-entry
              .plant=${this.plantDb.plants.get(entry.plantId)}
              .log=${entry}
            ></plant-log-entry>`
        ),
    ];
  }
}
