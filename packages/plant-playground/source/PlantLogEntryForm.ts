import { LogEntry, Plant } from "@plantdb/libplantdb";
import { SlDropdown, SlInput, SlSelect } from "@shoelace-style/shoelace";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { isNil } from "./Maybe";
import { Typography } from "./PlantComponentStyles";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

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

      .date-time {
        display: flex;
        flex-direction: row;
        gap: 1rem;
        align-items: center;
      }
      .date-time sl-input {
        flex: 1;
        min-width: 0;
      }
      .date-time sl-icon-button {
        margin-top: 1.25rem;
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: LogEntry })
  logEntry = new LogEntry(0, "");

  @property({ type: Plant })
  plant: Plant | null = Plant.Empty();

  @state()
  private _plantName = "";
  @state()
  private _entryType = "";
  @state()
  private _date = new Date().toISOString().slice(0, 10);
  @state()
  private _time = new Date().toLocaleTimeString();
  @state()
  private _productUsed = "";

  @query("#entry-form")
  private _entryForm: HTMLFormElement | null | undefined;

  @query("#plant-input")
  private _plantInput: SlInput | null | undefined;
  @query("#plant-dropdown")
  private _plantDrowndown: SlDropdown | null | undefined;

  @query("#type-dropdown")
  private _typeDrowndown: SlDropdown | null | undefined;

  @query("#product-dropdown")
  private _productDrowndown: SlDropdown | null | undefined;

  private _setCurrentDateTime() {
    this._date = new Date().toISOString().slice(0, 10);
    this._time = new Date().toLocaleTimeString();
  }

  reportValidity() {
    this._entryForm?.reportValidity();
  }

  asLogEntry() {
    return this.plantStore?.plantDb.makeNewLogEntry(
      this._plantName,
      new Date(`${this._date} ${this._time}`),
      this._entryType
    );
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      html`<form
        id="entry-form"
        @submit=${(event: Event) => {
          event.preventDefault();
        }}
      >
        <sl-input
          id="plant-input"
          label="Plant *"
          placeholder="Select plant"
          value=${this._plantName}
          @sl-focus=${() => this._plantDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._plantName = (event.target as SlInput).value)}
          required
          pattern="PID-\\d{1,6}"
        ></sl-input
        ><sl-dropdown id="plant-dropdown">
          <sl-menu>
            ${[...this.plantStore.searchPlants(this._plantName)].slice(0, 8).map(
              plant =>
                html`<sl-menu-item
                  @click=${() => {
                    this._plantName = plant.id;
                  }}
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
          value=${this._entryType}
          @sl-focus=${() => this._typeDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._entryType = (event.target as SlInput).value)}
          required
        ></sl-input
        ><sl-dropdown id="type-dropdown">
          <sl-menu>
            ${[...this.plantStore.plantDb.entryTypes]
              .sort()
              .filter(type =>
                type.toLocaleLowerCase().includes(this._entryType.toLocaleLowerCase())
              )
              .map(
                entry =>
                  html`<sl-menu-item
                    @click=${() => {
                      this._entryType = entry;
                    }}
                    >${entry}</sl-menu-item
                  >`
              )}
          </sl-menu></sl-dropdown
        >

        <div class="date-time">
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
          <sl-tooltip content="Set to current date/time">
            <sl-icon-button
              name="clock"
              label="Set to current date/time"
              @click=${() => this._setCurrentDateTime()}
            ></sl-icon-button
          ></sl-tooltip>
        </div>
        <sl-textarea label="Note" placeholder="Add your notes here"></sl-textarea>

        <h4>Details</h4>
        <sl-input
          label="Product used"
          placeholder="name of a product"
          value=${this._productUsed}
          @sl-focus=${() => this._productDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._productUsed = (event.target as SlInput).value)}
        ></sl-input
        ><sl-dropdown id="product-dropdown">
          <sl-menu>
            ${[...this.plantStore.plantDb.usedProducts]
              .sort()
              .filter(type =>
                type.toLocaleLowerCase().includes(this._productUsed.toLocaleLowerCase())
              )
              .map(
                product =>
                  html`<sl-menu-item
                    @click=${() => {
                      this._productUsed = product;
                    }}
                    >${product}</sl-menu-item
                  >`
              )}
          </sl-menu></sl-dropdown
        >
        <div class="row">
          <sl-input type="number" label="EC" placeholder="1200"></sl-input
          ><sl-input type="number" label="pH" placeholder="5.5"></sl-input>
        </div>
      </form>`,
    ];
  }
}
