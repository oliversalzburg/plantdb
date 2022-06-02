import { Plant } from "@plantdb/libplantdb";
import { SlCheckbox, SlDropdown, SlInput, SlSelect, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { t } from "i18next";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { assertExists, isNil, mustExist } from "./Maybe";
import { PlantMultiValueEditor } from "./PlantMultiValueEditor";
import { PlantScanner } from "./PlantScanner";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-properties-form")
export class PlantPropertiesForm extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      #scanner {
        display: none;
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

      .button-attached {
        display: flex;
        flex-direction: row;
        align-items: flex-end;
        gap: 0.25rem;
      }
      .button-attached :first-child {
        flex: 1;
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
  private _plantPhMin: number | undefined;
  @state()
  private _plantPhMax: number | undefined;
  @state()
  private _plantEcMin: number | undefined;
  @state()
  private _plantEcMax: number | undefined;
  @state()
  private _plantTempMin: number | undefined;
  @state()
  private _plantTempMax: number | undefined;
  @state()
  private _plantNotes: string | undefined;
  @state()
  private _plantPlantgeekId: Array<string> | string | undefined;

  @query("#scanner")
  private _scanner: PlantScanner | null | undefined;

  @query("#form")
  private _form: HTMLFormElement | null | undefined;

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
    this._plantPhMin = this.plant?.phMin ?? this._plantPhMin;
    this._plantPhMax = this.plant?.phMax ?? this._plantPhMax;
    this._plantEcMin = this.plant?.ecMin ?? this._plantEcMin;
    this._plantEcMax = this.plant?.ecMax ?? this._plantEcMax;
    this._plantTempMin = this.plant?.tempMin ?? this._plantTempMin;
    this._plantTempMax = this.plant?.tempMax ?? this._plantTempMax;
    this._plantNotes = this.plant?.notes ?? this._plantNotes;
    this._plantPlantgeekId = this.plant?.plantGeekId ?? this._plantPlantgeekId;
  }

  protected updated(
    _changedProperties: PropertyValueMap<PlantPropertiesForm> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("plant")) {
      this._plantId = this.plant?.id ?? "";
      this._plantName = this.plant?.name ?? "";
      this._plantKind = this.plant?.kind ?? "";
      this._plantSubstrate = this.plant?.substrate ?? "";
      this._plantPotShapeTop = this.plant?.potShapeTop ?? "";
      this._plantPotColor = this.plant?.potColor ?? "";
      this._plantOnSaucer = this.plant?.onSaucer ?? undefined;
      this._plantLocation = this.plant?.location ?? "";
      this._plantPhMin = this.plant?.phMin ?? undefined;
      this._plantPhMax = this.plant?.phMax ?? undefined;
      this._plantEcMin = this.plant?.ecMin ?? undefined;
      this._plantEcMax = this.plant?.ecMax ?? undefined;
      this._plantTempMin = this.plant?.tempMin ?? undefined;
      this._plantTempMax = this.plant?.tempMax ?? undefined;
      this._plantNotes = this.plant?.notes ?? "";
      this._plantPlantgeekId = this.plant?.plantGeekId ?? "";
    }
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

  asPlant() {
    const plant = mustExist(this.plantStore).plantDb.makeNewPlant(this._plantId);
    return Plant.fromPlant(plant, {
      ecMax: this._plantEcMax,
      ecMin: this._plantEcMin,
      kind: this._plantKind,
      location: this._plantLocation,
      name: this._plantName,
      notes: this._plantNotes,
      onSaucer: this._plantOnSaucer,
      phMax: this._plantPhMax,
      phMin: this._plantPhMin,
      plantGeekId: this._plantPlantgeekId,
      potColor: this._plantPotColor,
      potShapeTop: this._plantPotShapeTop,
      substrate: this._plantSubstrate,
      tempMax: this._plantTempMax,
      tempMin: this._plantTempMin,
    });
  }

  private _scanPlant() {
    mustExist(this._form).style.display = "none";
    mustExist(this._scanner).style.display = "flex";
    mustExist(this._scanner).start();
  }

  private _plantScanned(dataUrl: string | null) {
    mustExist(this._form).style.display = "flex";
    mustExist(this._scanner).style.display = "none";
    mustExist(this._scanner).stop();
    if (dataUrl !== null) {
      console.log(dataUrl);
      this.plantStoreUi?.alert("Image captured").catch(console.error);
    }
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      html`<plant-scanner
          id="scanner"
          @plant-aborted=${() => this._plantScanned(null)}
          @plant-scanned=${(event: CustomEvent<string>) => this._plantScanned(event.detail)}
        ></plant-scanner>
        <form
          id="form"
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

          <div class="button-attached">
            <plant-multi-value-editor
              id="kind-input"
              label=${t("plantEditor.kindLabel")}
              placeholder=${t("plantEditor.kindPlaceholder")}
              .suggestions=${[...this.plantStore.plantDb.kinds]}
              .value=${this._plantKind}
              @plant-changed=${(event: CustomEvent) =>
                (this._plantKind = (event.target as PlantMultiValueEditor).value)}
            ></plant-multi-value-editor
            ><sl-button @click=${() => this._scanPlant()}>Scan</sl-button>
          </div>
          <div class="spacer"></div>

          <plant-multi-value-editor
            id="location-input"
            label=${t("plantEditor.locationLabel")}
            placeholder=${t("plantEditor.locationPlaceholder")}
            .suggestions=${[...this.plantStore.plantDb.locations]}
            .value=${this._plantLocation}
            @plant-changed=${(event: CustomEvent) =>
              (this._plantLocation = (event.target as PlantMultiValueEditor).value)}
          ></plant-multi-value-editor>
          <div class="spacer"></div>

          <sl-textarea
            id="notes-input"
            label=${t("plantEditor.notesLabel")}
            placeholder=${t("plantEditor.notesPlaceholder")}
            value=${this._plantNotes}
            @sl-change=${(event: InputEvent) =>
              (this._plantNotes = (event.target as SlTextarea).value)}
          ></sl-textarea>
          <div class="spacer"></div>

          <sl-details summary=${t("plantEditor.detailsPot")}>
            <plant-multi-value-editor
              id="substrate-input"
              label=${t("plantEditor.substrateLabel")}
              placeholder=${t("plantEditor.substratePlaceholder")}
              .suggestions=${[...this.plantStore.plantDb.substrates]}
              .value=${this._plantSubstrate}
              @plant-changed=${(event: CustomEvent) =>
                (this._plantSubstrate = (event.target as PlantMultiValueEditor).value)}
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
                ><sl-dropdown id="pot-shape-top-dropdown" hoist>
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
                ><sl-dropdown id="pot-color-dropdown" hoist>
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
          </sl-details>
          <div class="spacer"></div>

          <sl-details summary=${t("plantEditor.detailsDiagnostics")}>
            <div class="row">
              <sl-input
                type="number"
                id="ph-min-input"
                label=${t("plantEditor.phMinLabel")}
                placeholder=${t("plantEditor.phMinPlaceholder")}
                clearable
                value=${this._plantPhMin}
                @sl-input=${(event: InputEvent) =>
                  (this._plantPhMin = (event.target as SlInput).valueAsNumber)}
              ></sl-input>
              <sl-input
                type="number"
                id="ph-max-input"
                label=${t("plantEditor.phMaxLabel")}
                placeholder=${t("plantEditor.phMaxPlaceholder")}
                clearable
                value=${this._plantPhMax}
                @sl-input=${(event: InputEvent) =>
                  (this._plantPhMax = (event.target as SlInput).valueAsNumber)}
              ></sl-input>

              <sl-input
                type="number"
                id="ec-min-input"
                label=${t("plantEditor.ecMinLabel")}
                placeholder=${t("plantEditor.ecMinPlaceholder")}
                clearable
                value=${this._plantEcMin}
                @sl-input=${(event: InputEvent) =>
                  (this._plantEcMin = (event.target as SlInput).valueAsNumber)}
              ></sl-input>
              <sl-input
                type="number"
                id="ec-max-input"
                label=${t("plantEditor.ecMaxLabel")}
                placeholder=${t("plantEditor.ecMaxPlaceholder")}
                clearable
                value=${this._plantEcMax}
                @sl-input=${(event: InputEvent) =>
                  (this._plantEcMax = (event.target as SlInput).valueAsNumber)}
              ></sl-input>
            </div>
            <div class="spacer"></div>

            <div class="row">
              <sl-input
                type="number"
                id="temp-min-input"
                label=${t("plantEditor.tempMinLabel")}
                placeholder=${t("plantEditor.tempMinPlaceholder")}
                clearable
                value=${this._plantTempMin}
                @sl-input=${(event: InputEvent) =>
                  (this._plantTempMin = (event.target as SlInput).valueAsNumber)}
              ></sl-input
              ><sl-input
                type="number"
                id="temp-max-input"
                label=${t("plantEditor.tempMaxLabel")}
                placeholder=${t("plantEditor.tempMaxPlaceholder")}
                clearable
                value=${this._plantTempMax}
                @sl-input=${(event: InputEvent) =>
                  (this._plantTempMax = (event.target as SlInput).valueAsNumber)}
              ></sl-input></div
          ></sl-details>
          <div class="spacer"></div>

          <sl-details summary=${t("plantEditor.detailsExternals")}>
            <plant-multi-value-editor
              id="plantgeek-input"
              label=${t("plantEditor.plantgeekLabel")}
              placeholder="62060b1d6b98d32724f806ed"
              .value=${this._plantPlantgeekId}
              @plant-changed=${(event: CustomEvent) =>
                (this._plantPlantgeekId = (event.target as PlantMultiValueEditor).value)}
            ></plant-multi-value-editor>
          </sl-details>
        </form>`,
    ];
  }
}
