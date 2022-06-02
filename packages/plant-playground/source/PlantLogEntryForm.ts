import { LogEntry, Plant } from "@plantdb/libplantdb";
import {
  SlButton,
  SlCheckbox,
  SlDropdown,
  SlInput,
  SlSelect,
  SlTextarea,
} from "@shoelace-style/shoelace";
import { t } from "i18next";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { assertExists, isNil, mustExist } from "./Maybe";
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
      }

      form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 50vh;
      }

      #submit {
        display: none;
      }

      .spacer {
        display: block;
        margin-bottom: 1rem;
      }

      .row {
        display: flex;
        flex-direction: row;
        column-gap: 1rem;
        align-items: center;
      }
      .row * {
        flex: 1;
        min-width: 0;
      }
      .row sl-icon-button {
        flex: 0.1;
        margin-top: 1.25rem;
      }

      .warning {
        color: var(--sl-color-warning-500);
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: LogEntry })
  logEntry: LogEntry | undefined;

  @property({ type: Plant })
  plant: Plant | null = null;

  @state()
  private _plantName = "";
  @state()
  private _entryType = "";
  @state()
  private _date = new Date().toISOString().slice(0, 10);
  @state()
  private _time = new Date().toISOString().slice(11, 19);
  @state()
  private _note: string | undefined;
  @state()
  private _productUsed: string | undefined;
  @state()
  private _ec: number | undefined;
  @state()
  private _ph: number | undefined;

  @query("#form")
  form: HTMLFormElement | null | undefined;

  @query("#submit")
  submitButton: SlButton | null | undefined;

  @query("#plant-dropdown")
  private _plantDrowndown: SlDropdown | null | undefined;

  @query("#type-dropdown")
  private _typeDrowndown: SlDropdown | null | undefined;

  @query("#product-dropdown")
  private _productDrowndown: SlDropdown | null | undefined;

  protected updated(
    _changedProperties: PropertyValueMap<PlantLogEntryForm> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("logEntry")) {
      this._plantName = this.logEntry?.plantId ?? "";
      this._entryType = this.logEntry?.type ?? "";
      this._date =
        this.logEntry?.timestamp.toISOString().slice(0, 10) ??
        new Date().toISOString().slice(0, 10);
      this._time =
        this.logEntry?.timestamp.toISOString().slice(11, 19) ??
        new Date().toISOString().slice(11, 19);
      this._note = this.logEntry?.note ?? "";
      this._productUsed = this.logEntry?.productUsed ?? "";
      this._ec = this.logEntry?.ec ?? undefined;
      this._ph = this.logEntry?.ph ?? undefined;
    }
  }

  private _setCurrentDateTime() {
    this._date = new Date().toISOString().slice(0, 10);
    this._time = new Date().toISOString().slice(11, 19);
  }

  reportValidity() {
    assertExists(this.form);

    const controls: NodeListOf<SlInput | SlSelect | SlTextarea | SlCheckbox> =
      this.form.querySelectorAll("sl-input, sl-select, sl-textarea, sl-checkbox");
    let valid = true;

    for (const control of controls) {
      if (!control.reportValidity()) {
        valid = false;
        break;
      }
    }

    return valid;
  }

  asLogEntry() {
    // Initiate new record into log.
    const entry = mustExist(this.plantStore).plantDb.makeNewLogEntry(
      this._plantName,
      new Date(`${this._date} ${this._time}`),
      this._entryType
    );
    // Augment record.
    return LogEntry.fromLogEntry(entry, {
      note: this._note,
      productUsed: this._productUsed,
      ec: this._ec,
      ph: this._ph,
    });
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    const foundPlants = [...this.plantStore.searchPlants(this._plantName)];
    const foundEntryTypes = [...this.plantStore.plantDb.entryTypes]
      .sort()
      .filter(type => type.toLocaleLowerCase().includes(this._entryType.toLocaleLowerCase()));
    const foundProducts = [...this.plantStore.plantDb.usedProducts]
      .sort()
      .filter(
        type =>
          !this._productUsed ||
          type.toLocaleLowerCase().includes(this._productUsed.toLocaleLowerCase())
      );

    return [
      html`<form id="form">
        <button id="submit" type="submit" @click=${() => console.warn("button submit")}></button>
        <sl-input
          id="plant-input"
          label=${t("entryEditor.plantLabel")}
          placeholder=${t("entryEditor.plantPlaceholder")}
          clearable
          value=${this._plantName}
          @sl-focus=${() => this._plantDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._plantName = (event.target as SlInput).value)}
          required
          pattern="PID-\\d{1,6}"
          >${!this.logEntry
            ? html`<small slot="help-text">${t("entryEditor.plantHelp")}</small>`
            : this._plantName === ""
            ? html`<small slot="help-text" class="warning"
                >${t("entryEditor.plantHelpDeleteWarn")}</small
              >`
            : html`<small slot="help-text">${t("entryEditor.plantHelpDelete")}</small>`}</sl-input
        >${foundPlants.length
          ? html`<sl-dropdown id="plant-dropdown" hoist>
              <sl-menu>
                ${foundPlants.slice(0, 8).map(
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
            </sl-dropdown>`
          : undefined}
        <div class="spacer"></div>

        <sl-input
          label=${t("entryEditor.typeLabel")}
          placeholder=${t("entryEditor.typePlaceholder")}
          clearable
          value=${this._entryType}
          @sl-focus=${() => this._typeDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._entryType = (event.target as SlInput).value)}
          required
          >${!this.logEntry
            ? html`<small slot="help-text">${t("entryEditor.typeHelp")}</small>`
            : this._entryType === ""
            ? html`<small slot="help-text" class="warning"
                >${t("entryEditor.typeHelpDeleteWarn")}</small
              >`
            : undefined}</sl-input
        >${foundEntryTypes.length
          ? html`<sl-dropdown id="type-dropdown" hoist>
              <sl-menu>
                ${foundEntryTypes.map(
                  entry =>
                    html`<sl-menu-item
                      @click=${() => {
                        this._entryType = entry;
                      }}
                      >${entry}</sl-menu-item
                    >`
                )}
              </sl-menu></sl-dropdown
            >`
          : undefined}
        <div class="spacer"></div>

        <div class="date-time row">
          <sl-input
            type="date"
            label=${t("entryEditor.dateLabel")}
            value=${this._date}
            @sl-change=${(event: MouseEvent) => {
              this._date = (event.target as SlInput).value;
            }}
            required
          ></sl-input
          ><sl-input
            type="time"
            label=${t("entryEditor.timeLabel")}
            value=${this._time}
            step="1"
            @sl-change=${(event: MouseEvent) => {
              this._time = (event.target as SlInput).value;
            }}
            required
          ></sl-input>
          <sl-tooltip content=${t("entryEditor.setCurrentDateTime")}>
            <sl-icon-button
              name="clock"
              label=${t("entryEditor.setCurrentDateTime")}
              @click=${() => this._setCurrentDateTime()}
            ></sl-icon-button
          ></sl-tooltip>
        </div>
        <div class="spacer"></div>

        <sl-textarea
          label=${t("entryEditor.noteLabel")}
          placeholder=${t("entryEditor.notePlaceholder")}
          value=${this._note}
          @sl-change=${(event: MouseEvent) => (this._note = (event.target as SlTextarea).value)}
        ></sl-textarea>
        <div class="spacer"></div>

        <h4>Details</h4>
        <sl-input
          label=${t("entryEditor.productLabel")}
          placeholder=${t("entryEditor.productPlaceholder")}
          clearable
          value=${this._productUsed}
          @sl-focus=${() => this._productDrowndown?.show()}
          @sl-input=${(event: MouseEvent) => (this._productUsed = (event.target as SlInput).value)}
        ></sl-input
        >${foundProducts.length
          ? html`<sl-dropdown id="product-dropdown" hoist>
              <sl-menu>
                ${[...this.plantStore.plantDb.usedProducts]
                  .sort()
                  .filter(
                    type =>
                      !this._productUsed ||
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
            >`
          : undefined}
        <div class="spacer"></div>

        <div class="row">
          <sl-input
            type="number"
            label=${t("entryEditor.ecLabel")}
            placeholder=${t("entryEditor.ecPlaceholder")}
            clearable
            value=${this._ec}
            @sl-change=${(event: MouseEvent) =>
              (this._ec = (event.target as SlInput).valueAsNumber)}
            min="0"
            step="10"
          ></sl-input
          ><sl-input
            type="number"
            label=${t("entryEditor.phLabel")}
            placeholder=${t("entryEditor.phPlaceholder")}
            clearable
            value=${this._ph}
            @sl-change=${(event: MouseEvent) =>
              (this._ph = (event.target as SlInput).valueAsNumber)}
            min="0"
            max="14"
            step="0.1"
          ></sl-input>
        </div>
      </form>`,
    ];
  }
}
