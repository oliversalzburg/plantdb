import { Plant } from "@plantdb/libplantdb";
import { SlCheckbox, SlDropdown, SlInput, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { isNil, mustExist } from "./Maybe";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-details-form")
export class PlantDetailsForm extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      :host form {
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
      .row .control {
        display: flex;
        flex-direction: column;
      }
      .row .control sl-checkbox {
        margin-top: 1rem;
      }
      .row .control sl-dropdown {
        flex: 0;
      }

      .warning {
        color: var(--sl-color-warning-500);
      }
    `,
  ];

  @property()
  plantStore: PlantStore | null = null;

  @property()
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: Plant })
  plant: Plant | undefined;

  @state()
  private _plantId = "";
  @state()
  private _plantName: string | undefined;
  @state()
  private _plantKind: Array<string> | string | undefined;
  @state()
  private _plantSubstrate: Array<string> | string | undefined;
  @state()
  private _plantPotShapeTop: string | undefined;
  @state()
  private _plantPotColor: string | undefined;
  @state()
  private _plantOnSaucer: boolean | undefined;
  @state()
  private _plantLocation: Array<string> | string | undefined;
  @state()
  private _plantPhIdeal: number | undefined;
  @state()
  private _plantEcIdeal: number | undefined;
  @state()
  private _plantTempIdeal: number | undefined;
  @state()
  private _plantNotes: string | undefined;

  @query("#substrate-dropdown")
  private _substrateDropdown: SlDropdown | null | undefined;
  @query("#pot-shape-top-dropdown")
  private _potShapeTopDropdown: SlDropdown | null | undefined;
  @query("#pot-color-dropdown")
  private _potColorDropdown: SlDropdown | null | undefined;
  @query("#location-dropdown")
  private _locationDropdown: SlDropdown | null | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    this._plantId = this.plant?.id ?? this._plantId;
    this._plantName = this.plant?.name ?? this._plantName;
    this._plantKind = this.plant?.kind ?? this._plantKind;
    this._plantSubstrate = this.plant?.substrate ?? this._plantSubstrate;
    this._plantPotShapeTop = this.plant?.potShapeTop ?? this._plantPotShapeTop;
    this._plantPotColor = this.plant?.potColor ?? this._plantPotColor;
    this._plantOnSaucer = this.plant?.onSaucer ?? this._plantOnSaucer;
    this._plantLocation = this.plant?.location ?? this._plantLocation;
    this._plantPhIdeal = this.plant?.phIdeal ?? this._plantPhIdeal;
    this._plantEcIdeal = this.plant?.ecIdeal ?? this._plantEcIdeal;
    this._plantTempIdeal = this.plant?.tempIdeal ?? this._plantTempIdeal;
    this._plantNotes = this.plant?.notes ?? this._plantNotes;
  }

  asPlant() {
    const plant = mustExist(this.plantStore).plantDb.makeNewPlant(this._plantId);
    return plant;
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
          id="id-input"
          label=${t("plantEditor.idLabel")}
          placeholder=${t("plantEditor.idPlaceholder")}
          clearable
          value=${this._plantId}
          @sl-input=${(event: InputEvent) => (this._plantId = (event.target as SlInput).value)}
          required
          pattern="PID-\\d{1,6}"
          >${!this.plant
            ? html`<small slot="help-text">${t("entryEditor.plantHelp")}</small>`
            : this._plantId === ""
            ? html`<small slot="help-text" class="warning"
                >${t("entryEditor.plantHelpDeleteWarn")}</small
              >`
            : html`<small slot="help-text">${t("entryEditor.plantHelpDelete")}</small>`}</sl-input
        >
        <div class="spacer"></div>

        <sl-input
          id="name-input"
          label=${t("plantEditor.nameLabel")}
          placeholder=${t("plantEditor.namePlaceholder")}
          clearable
          value=${this._plantName}
          @sl-input=${(event: InputEvent) => (this._plantName = (event.target as SlInput).value)}
        ></sl-input>
        <div class="spacer"></div>

        <plant-multi-value-editor
          id="kind-input"
          label=${t("plantEditor.kindLabel")}
          placeholder=${t("plantEditor.kindPlaceholder")}
          .suggestions=${[...this.plantStore.plantDb.kinds]}
          .value=${this._plantKind}
        ></plant-multi-value-editor>
        <div class="spacer"></div>

        <plant-multi-value-editor
          id="substrate-input"
          label=${t("plantEditor.substrateLabel")}
          placeholder=${t("plantEditor.substratePlaceholder")}
          .suggestions=${[...this.plantStore.plantDb.substrates]}
          .value=${this._plantSubstrate}
        ></plant-multi-value-editor>
        <div class="spacer"></div>

        <div class="row">
          <div class="control">
            <sl-input
              id="pot-shape-top-input"
              label=${t("plantEditor.potShapeTopLabel")}
              placeholder=${t("plantEditor.potShapeTopPlaceholder")}
              clearable
              value=${this._plantPotShapeTop}
              @sl-focus=${() => this._potShapeTopDropdown?.show()}
              @sl-input=${(event: InputEvent) =>
                (this._plantPotShapeTop = (event.target as SlInput).value)}
            ></sl-input
            ><sl-dropdown id="pot-shape-top-dropdown">
              <sl-menu>
                ${[...this.plantStore.plantDb.potShapesTop]
                  .sort()
                  .filter(type =>
                    type
                      .toLocaleLowerCase()
                      .includes(this._plantPotShapeTop?.toLocaleLowerCase() ?? "")
                  )
                  .map(
                    entry =>
                      html`<sl-menu-item
                        @click=${() => {
                          this._plantPotShapeTop = entry;
                        }}
                        >${entry}</sl-menu-item
                      >`
                  )}
              </sl-menu>
            </sl-dropdown>
          </div>

          <div class="control">
            <sl-input
              id="pot-color-input"
              label=${t("plantEditor.potColorLabel")}
              placeholder=${t("plantEditor.potColorPlaceholder")}
              clearable
              value=${this._plantPotColor}
              @sl-focus=${() => this._potColorDropdown?.show()}
              @sl-input=${(event: InputEvent) =>
                (this._plantPotColor = (event.target as SlInput).value)}
            ></sl-input
            ><sl-dropdown id="pot-color-dropdown">
              <sl-menu>
                ${[...this.plantStore.plantDb.potColors]
                  .sort()
                  .filter(type =>
                    type
                      .toLocaleLowerCase()
                      .includes(this._plantPotColor?.toLocaleLowerCase() ?? "")
                  )
                  .map(
                    entry =>
                      html`<sl-menu-item
                        @click=${() => {
                          this._plantPotColor = entry;
                        }}
                        >${entry}</sl-menu-item
                      >`
                  )}
              </sl-menu>
            </sl-dropdown>
          </div>

          <div class="control">
            <sl-checkbox
              id="on-saucer-input"
              clearable
              ?checked=${this._plantOnSaucer}
              ?indeterminate=${this._plantOnSaucer === undefined}
              @sl-input=${(event: InputEvent) =>
                (this._plantOnSaucer = (event.target as SlCheckbox).checked)}
              >${t("plantEditor.onSaucerLabel")}</sl-checkbox
            >
          </div>
        </div>
        <div class="spacer"></div>

        <plant-multi-value-editor
          id="location-input"
          label=${t("plantEditor.locationLabel")}
          placeholder=${t("plantEditor.locationPlaceholder")}
          .suggestions=${[...this.plantStore.plantDb.locations]}
          .value=${this._plantLocation}
        ></plant-multi-value-editor>
        <div class="spacer"></div>

        <div class="row">
          <sl-input
            type="number"
            id="ph-ideal-input"
            label=${t("plantEditor.phIdealLabel")}
            placeholder=${t("plantEditor.phIdealPlaceholder")}
            clearable
            value=${this._plantPhIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantPhIdeal = (event.target as SlInput).valueAsNumber)}
          ></sl-input>

          <sl-input
            type="number"
            id="ec-ideal-input"
            label=${t("plantEditor.ecIdealLabel")}
            placeholder=${t("plantEditor.ecIdealPlaceholder")}
            clearable
            value=${this._plantEcIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantEcIdeal = (event.target as SlInput).valueAsNumber)}
          ></sl-input>

          <sl-input
            type="number"
            id="temp-ideal-input"
            label=${t("plantEditor.tempIdealLabel")}
            placeholder=${t("plantEditor.tempIdealPlaceholder")}
            clearable
            value=${this._plantTempIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantTempIdeal = (event.target as SlInput).valueAsNumber)}
          ></sl-input>
        </div>
        <div class="spacer"></div>

        <sl-textarea
          id="notes-input"
          label=${t("plantEditor.notesLabel")}
          placeholder=${t("plantEditor.notesPlaceholder")}
          value=${this._plantNotes}
          @sl-change=${(event: InputEvent) =>
            (this._plantNotes = (event.target as SlTextarea).value)}
        ></sl-textarea>
      </form>`,
    ];
  }
}
