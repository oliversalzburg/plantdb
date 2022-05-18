import { LogEntry, Plant, PlantDB } from "@plantdb/libplantdb";
import { SlDropdown, SlSelect } from "@shoelace-style/shoelace";
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { Typography } from "./PlantComponentStyles";

@customElement("plant-log-entry-form")
export class PlantLogEntryForm extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
        min-height: 50vh;
      }

      details {
        display: flex;
        gap: 1rem;
      }

      .row {
        display: flex;
        flex-direction: row;
        gap: 1rem;
      }

      .row * {
        flex: 1;
        min-width: 0;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: LogEntry })
  logEntry = new LogEntry(0, "");

  @property({ type: Plant })
  plant: Plant | null = Plant.Empty();

  private _date = new Date().toISOString().slice(0, 10);
  private _time = new Date().toLocaleTimeString();

  @query("#plant-dropdown")
  private _plantDrowndown: SlDropdown | null | undefined;

  @query("#type-dropdown")
  private _typeDrowndown: SlDropdown | null | undefined;

  render() {
    return [
      html`<sl-input
          label="Plant *"
          placeholder="Select plant"
          @sl-focus=${() => this._plantDrowndown?.show()}
          required
        ></sl-input
        ><sl-dropdown id="plant-dropdown">
          <sl-menu>
            ${[...this.plantDb.plants.values()]
              .slice(0, 8)
              .map(
                plant =>
                  html`<sl-menu-item
                    >${plant.name}<sl-badge slot="suffix" variant="neutral"
                      >${plant.id}</sl-badge
                    ></sl-menu-item
                  >`
              )}
          </sl-menu>
        </sl-dropdown>

        <sl-input
          label="Event type *"
          placeholder="Select event type"
          @sl-focus=${() => this._typeDrowndown?.show()}
          required
        ></sl-input
        ><sl-dropdown id="type-dropdown">
          <sl-menu>
            ${[...this.plantDb.entryTypes].map(
              entry => html`<sl-menu-item>${entry}</sl-menu-item>`
            )}
          </sl-menu></sl-dropdown
        >

        <div class="row">
          <sl-input
            type="date"
            label="Date *"
            value=${this._date}
            @sl-change=${(event: MouseEvent) => {
              this._date = (event.target as SlSelect).value as string;
            }}
            required
          ></sl-input
          ><sl-input
            type="time"
            label="Time *"
            value=${this._time}
            @sl-change=${(event: MouseEvent) => {
              this._time = (event.target as SlSelect).value as string;
              console.log(this._time);
            }}
            required
          ></sl-input>
        </div>
        <sl-textarea label="Note" placeholder="Add your notes here"></sl-textarea>

        <h4>Details</h4>
        <sl-input label="Product used" placeholder="name of a product"></sl-input>
        <div class="row">
          <sl-input type="number" label="EC" placeholder="1200"></sl-input
          ><sl-input type="number" label="pH" placeholder="5.5"></sl-input>
        </div>`,
    ];
  }
}
