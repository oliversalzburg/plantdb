import { Plant } from "@plantdb/libplantdb";
import { SlCheckbox, SlInput, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
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
        gap: 1rem;
      }
      .row * {
        flex: 1;
        min-width: 0;
      }
      .row sl-checkbox {
        margin-top: 1.75rem;
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
  private _plantKind: string | undefined;
  @state()
  private _plantSubstrate: string | undefined;
  @state()
  private _plantPotShapeTop: string | undefined;
  @state()
  private _plantPotColor: string | undefined;
  @state()
  private _plantOnSaucer: boolean | undefined;
  @state()
  private _plantLocation: string | undefined;
  @state()
  private _plantPhIdeal: number | undefined;
  @state()
  private _plantEcIdeal: number | undefined;
  @state()
  private _plantTempIdeal: number | undefined;
  @state()
  private _plantNotes: string | undefined;

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

  asPlant() {}

  render() {
    if (!this.plant) {
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
          id="input-id"
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

        <sl-input
          id="input-name"
          label=${t("plantEditor.nameLabel")}
          placeholder=${t("plantEditor.namePlaceholder")}
          clearable
          value=${this._plantName}
          @sl-input=${(event: InputEvent) => (this._plantName = (event.target as SlInput).value)}
        ></sl-input>

        <sl-input
          id="input-kind"
          label=${t("plantEditor.kindLabel")}
          placeholder=${t("plantEditor.kindPlaceholder")}
          clearable
          value=${this._plantKind}
          @sl-input=${(event: InputEvent) => (this._plantKind = (event.target as SlInput).value)}
        ></sl-input>

        <sl-input
          id="input-substrate"
          label=${t("plantEditor.substrateLabel")}
          placeholder=${t("plantEditor.substratePlaceholder")}
          clearable
          value=${this._plantSubstrate}
          @sl-input=${(event: InputEvent) =>
            (this._plantSubstrate = (event.target as SlInput).value)}
        ></sl-input>

        <div class="row">
          <sl-input
            id="input-pot-shape-top"
            label=${t("plantEditor.potShapeTopLabel")}
            placeholder=${t("plantEditor.potShapeTopPlaceholder")}
            clearable
            value=${this._plantPotShapeTop}
            @sl-input=${(event: InputEvent) =>
              (this._plantPotShapeTop = (event.target as SlInput).value)}
          ></sl-input>

          <sl-input
            id="input-pot-color"
            label=${t("plantEditor.potColorLabel")}
            placeholder=${t("plantEditor.potColorPlaceholder")}
            clearable
            value=${this._plantPotColor}
            @sl-input=${(event: InputEvent) =>
              (this._plantPotColor = (event.target as SlInput).value)}
          ></sl-input>

          <sl-checkbox
            id="input-on-saucer"
            clearable
            value=${this._plantOnSaucer}
            @sl-input=${(event: InputEvent) =>
              (this._plantOnSaucer = (event.target as SlCheckbox).checked)}
            >${t("plantEditor.onSaucerLabel")}</sl-checkbox
          >
        </div>

        <sl-input
          id="input-location"
          label=${t("plantEditor.locationLabel")}
          placeholder=${t("plantEditor.locationPlaceholder")}
          clearable
          value=${this._plantLocation}
          @sl-input=${(event: InputEvent) =>
            (this._plantLocation = (event.target as SlInput).value)}
        ></sl-input>

        <div class="row">
          <sl-input
            id="input-ph-ideal"
            label=${t("plantEditor.phIdealLabel")}
            placeholder=${t("plantEditor.phIdealPlaceholder")}
            clearable
            value=${this._plantPhIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantPhIdeal = (event.target as SlInput).value)}
          ></sl-input>

          <sl-input
            id="input-ec-ideal"
            label=${t("plantEditor.ecIdealLabel")}
            placeholder=${t("plantEditor.ecIdealPlaceholder")}
            clearable
            value=${this._plantEcIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantEcIdeal = (event.target as SlInput).value)}
          ></sl-input>

          <sl-input
            id="input-temp-ideal"
            label=${t("plantEditor.tempIdealLabel")}
            placeholder=${t("plantEditor.tempIdealPlaceholder")}
            clearable
            value=${this._plantTempIdeal}
            @sl-input=${(event: InputEvent) =>
              (this._plantTempIdeal = (event.target as SlInput).value)}
          ></sl-input>
        </div>

        <sl-textarea
          id="input-notes"
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
