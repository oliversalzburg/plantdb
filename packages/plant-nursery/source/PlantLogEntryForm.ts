import { assertExists, isNil, mustExist } from "@oliversalzburg/js-utils/lib/nil";
import { LogEntry, Plant } from "@plantdb/libplantdb";
import { SlCheckbox, SlDropdown, SlInput, SlSelect, SlTextarea } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { Typography } from "./ComponentStyles";
import { MultiValueEditor } from "./MultiValueEditor";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("pn-plant-log-entry-form")
export class PlantLogEntryForm extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        display: inline-block;
      }

      #form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 50vh;
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

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
  logEntry: LogEntry | undefined;

  @property()
  logEntryTemplate: Record<string, string> | undefined;

  @property({ attribute: false })
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
  private _notes: string | undefined;
  @state()
  private _productUsed: string | Array<string> | undefined;
  @state()
  private _ec: number | undefined;
  @state()
  private _ph: number | undefined;

  @query("#form")
  private _form: HTMLFormElement | null | undefined;

  @query("#plant-dropdown")
  private _plantDrowndown: SlDropdown | null | undefined;

  @query("#type-dropdown")
  private _typeDrowndown: SlDropdown | null | undefined;

  override connectedCallback(): void {
    super.connectedCallback();

    this._refreshValues();
  }

  protected updated(
    _changedProperties: PropertyValueMap<PlantLogEntryForm> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("logEntry") || _changedProperties.has("logEntryTemplate")) {
      this._refreshValues();
    }
  }

  private _refreshValues() {
    this._plantName = this.logEntry?.plantId ?? this.logEntryTemplate?.plantId ?? "";
    this._entryType = this.logEntry?.type ?? this.logEntryTemplate?.type ?? "";
    this._date =
      this.logEntry?.timestamp.toISOString().slice(0, 10) ??
      this.logEntryTemplate?.x ??
      new Date().toISOString().slice(0, 10);
    this._time =
      this.logEntry?.timestamp.toISOString().slice(11, 19) ??
      this.logEntryTemplate?.x ??
      new Date().toISOString().slice(11, 19);
    this._notes = this.logEntry?.notes ?? this.logEntryTemplate?.notes ?? "";
    this._productUsed = this.logEntry?.productUsed ?? this.logEntryTemplate?.productUsed ?? "";
    this._ec = this.logEntry?.ec ?? undefined;
    this._ph = this.logEntry?.ph ?? undefined;
  }

  private _setCurrentDateTime() {
    this._date = new Date().toISOString().slice(0, 10);
    this._time = new Date().toISOString().slice(11, 19);
  }

  reportValidity() {
    assertExists(this._form);

    const controls: NodeListOf<SlInput | SlSelect | SlTextarea | SlCheckbox> =
      this._form.querySelectorAll("sl-input, sl-select, sl-textarea, sl-checkbox");
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
      this._entryType,
    );
    // Augment record.
    return LogEntry.fromLogEntry(entry, {
      id: this.logEntry?.id,
      notes: this._notes,
      productUsed: this._productUsed,
      ec: this._ec,
      ph: this._ph,
    });
  }

  shouldDelete() {
    return this._plantName === "" || this._entryType === "";
  }

  render() {
    if (isNil(this.plantStore)) {
      return undefined;
    }

    const foundPlants = [...this.plantStore.searchPlants(this._plantName)];
    const foundEntryTypes = [...this.plantStore.plantDb.entryTypes]
      .sort()
      .filter(type => type.toLocaleLowerCase().includes(this._entryType.toLocaleLowerCase()));

    return [
      html`<form id="form">
        <sl-input
          id="plant-input"
          label=${t("entryEditor.plantLabel")}
          placeholder=${t("entryEditor.plantPlaceholder")}
          clearable
          autocapitalize="characters"
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
                    >`,
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
                    >`,
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
              @click=${() => {
                this._setCurrentDateTime();
              }}
            ></sl-icon-button
          ></sl-tooltip>
        </div>
        <div class="spacer"></div>

        <sl-textarea
          label=${t("entryEditor.noteLabel")}
          placeholder=${t("entryEditor.notePlaceholder")}
          value=${ifDefined(this._notes)}
          @sl-change=${(event: MouseEvent) => (this._notes = (event.target as SlTextarea).value)}
        ></sl-textarea>
        <div class="spacer"></div>

        <h4>Details</h4>
        <pn-multi-value-editor
          label=${t("entryEditor.productLabel")}
          placeholder=${t("entryEditor.productPlaceholder")}
          .suggestions=${[...this.plantStore.plantDb.usedProducts]}
          .value=${this._productUsed}
          @pn-changed=${(event: CustomEvent) =>
            (this._productUsed = (event.target as MultiValueEditor).value)}
        ></pn-multi-value-editor>
        <div class="spacer"></div>

        <div class="row">
          <sl-input
            type="number"
            label=${t("entryEditor.ecLabel")}
            placeholder=${t("entryEditor.ecPlaceholder")}
            clearable
            value=${ifDefined(this._ec)}
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
            value=${ifDefined(this._ph)}
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

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-log-entry-form": PlantLogEntryForm;
  }
}
