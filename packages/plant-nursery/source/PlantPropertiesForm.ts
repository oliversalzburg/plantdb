import { Plant } from "@plantdb/libplantdb";
import { SlCheckbox, SlDropdown, SlInput, SlSelect, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { t } from "i18next";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { MultiValueEditor } from "./MultiValueEditor";
import {
  PlantIdentificationPicker,
  PlantNetErrorResponse,
  PlantNetResponse,
  PlantNetResult,
} from "./PlantIdentificationPicker";
import { PlantScanner } from "./PlantScanner";
import { makeIdentificationRequest } from "./identification/Tools";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";
import { assertExists, isNil, mustExist } from "./tools/Maybe";

@customElement("pn-plant-properties-form")
export class PlantPropertiesForm extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
      }

      .properties {
        display: flex;
        flex-direction: column;
      }

      #scanner,
      #picker {
        display: none;
      }

      #form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 50vh;
      }

      .properties.properties--scanning #form {
        display: none;
      }
      .properties.properties--scanning #scanner {
        display: flex;
      }
      .properties.properties--scanning #picker {
        display: none;
      }

      .properties.properties--picking #form {
        display: none;
      }
      .properties.properties--picking #scanner {
        display: none;
      }
      .properties.properties--picking #picker {
        display: flex;
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
        min-width: 0;
        flex: 1;
      }
      .button-attached :last-child {
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

  @state()
  private _picking = false;
  @state()
  private _scanning = false;

  @query("#scanner")
  private _scanner: PlantScanner | null | undefined;
  @query("#picker")
  private _picker: PlantIdentificationPicker | null | undefined;

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

  @state()
  private _identificationResponse: PlantNetResponse | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    this._refreshValues();
  }

  protected updated(
    _changedProperties: PropertyValueMap<PlantPropertiesForm> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("plant")) {
      this._refreshValues();
    }
  }

  private _refreshValues() {
    this._plantId = this.plant?.id ?? "";
    this._plantName = this.plant?.name ?? undefined;
    this._plantKind = this.plant?.kind ?? undefined;
    this._plantSubstrate = this.plant?.substrate ?? undefined;
    this._plantPotShapeTop = this.plant?.potShapeTop ?? undefined;
    this._plantPotColor = this.plant?.potColor ?? undefined;
    this._plantOnSaucer = this.plant?.onSaucer ?? undefined;
    this._plantLocation = this.plant?.location ?? undefined;
    this._plantPhMin = this.plant?.phMin ?? undefined;
    this._plantPhMax = this.plant?.phMax ?? undefined;
    this._plantEcMin = this.plant?.ecMin ?? undefined;
    this._plantEcMax = this.plant?.ecMax ?? undefined;
    this._plantTempMin = this.plant?.tempMin ?? undefined;
    this._plantTempMax = this.plant?.tempMax ?? undefined;
    this._plantNotes = this.plant?.notes ?? undefined;
    this._plantPlantgeekId = this.plant?.plantgeekId ?? undefined;
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
      plantgeekId: this._plantPlantgeekId,
      potColor: this._plantPotColor,
      potShapeTop: this._plantPotShapeTop,
      substrate: this._plantSubstrate,
      tempMax: this._plantTempMax,
      tempMin: this._plantTempMin,
    });
  }

  shouldDelete() {
    return this._plantId === "";
  }

  private _scanPlant() {
    this._scanning = true;
    mustExist(this._scanner).start().catch(console.error);
    this.dispatchEvent(new CustomEvent("pn-scanning"));
  }

  private _plantScanned(dataUrl: string | null) {
    this._scanning = false;
    mustExist(this._scanner).stop();
    this.dispatchEvent(new CustomEvent("pn-scanned"));
    if (dataUrl !== null) {
      console.log(dataUrl);
      this.plantStoreUi?.alert(t("scanner.captured")).catch(console.error);
      this._identifyPlant(dataUrl).catch(console.error);
    } else {
      this._cancelPlantIdentify();
    }
  }

  private async _identifyPlant(dataUrl: string) {
    const response = await makeIdentificationRequest(
      dataUrl,
      mustExist(this.plantStoreUi).locale.slice(0, 2),
    );
    const json = (await response.json()) as PlantNetResponse | PlantNetErrorResponse;
    if ("error" in json) {
      this.plantStoreUi?.alert(json.message, "danger", "x-circle").catch(console.error);
      this._picking = false;
      return;
    }

    this._identificationResponse = json;
    console.debug(json);
    console.debug(JSON.stringify(json));

    this._picking = true;
  }

  private _cancelPlantIdentify() {
    this._picking = false;
  }

  private _identifyPlantPick(result: PlantNetResult) {
    this._plantKind = result.species.scientificName;
    this._cancelPlantIdentify();
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      html`<div
        part="base"
        id="properties"
        class=${classMap({
          properties: true,
          "properties--picking": this._picking,
          "properties--scanning": this._scanning,
        })}
      >
        <pn-plant-scanner
          id="scanner"
          @pn-aborted=${() => this._plantScanned(null)}
          @pn-scanned=${(event: CustomEvent<string>) => this._plantScanned(event.detail)}
        ></pn-plant-scanner>
        <pn-plant-identification-picker
          id="picker"
          .response=${this._identificationResponse}
          @pn-identification-cancelled=${() => this._cancelPlantIdentify()}
          @pn-identification-picked=${(event: Event) =>
            this._identifyPlantPick((event as CustomEvent<PlantNetResult>).detail)}
        ></pn-plant-identification-picker>
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
                : html`<small slot="help-text"
                    >${t("entryEditor.plantHelpDelete")}</small
                  >`}</sl-input
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
            <pn-multi-value-editor
              id="kind-input"
              label=${t("plantEditor.kindLabel")}
              placeholder=${t("plantEditor.kindPlaceholder")}
              .suggestions=${[...this.plantStore.plantDb.kinds]}
              .value=${this._plantKind}
              @pn-changed=${(event: CustomEvent) =>
                (this._plantKind = (event.target as MultiValueEditor).value)}
            ></pn-multi-value-editor
            ><sl-button @click=${() => this._scanPlant()}>${t("plantEditor.scan")}</sl-button>
          </div>
          <div class="spacer"></div>

          <pn-multi-value-editor
            id="location-input"
            label=${t("plantEditor.locationLabel")}
            placeholder=${t("plantEditor.locationPlaceholder")}
            .suggestions=${[...this.plantStore.plantDb.locations]}
            .value=${this._plantLocation}
            @pn-changed=${(event: CustomEvent) =>
              (this._plantLocation = (event.target as MultiValueEditor).value)}
          ></pn-multi-value-editor>
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
            <pn-multi-value-editor
              id="substrate-input"
              label=${t("plantEditor.substrateLabel")}
              placeholder=${t("plantEditor.substratePlaceholder")}
              .suggestions=${[...this.plantStore.plantDb.substrates]}
              .value=${this._plantSubstrate}
              @pn-changed=${(event: CustomEvent) =>
                (this._plantSubstrate = (event.target as MultiValueEditor).value)}
            ></pn-multi-value-editor>
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
                          .includes(this._plantPotShapeTop?.toLocaleLowerCase() ?? ""),
                      )
                      .map(
                        entry =>
                          html`<sl-menu-item
                            @click=${() => {
                              this._plantPotShapeTop = entry;
                            }}
                            >${entry}</sl-menu-item
                          >`,
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
                          .includes(this._plantPotColor?.toLocaleLowerCase() ?? ""),
                      )
                      .map(
                        entry =>
                          html`<sl-menu-item
                            @click=${() => {
                              this._plantPotColor = entry;
                            }}
                            >${entry}</sl-menu-item
                          >`,
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
            <pn-multi-value-editor
              id="plantgeek-input"
              label=${t("plantEditor.plantgeekLabel")}
              placeholder="62060b1d6b98d32724f806ed"
              .value=${this._plantPlantgeekId}
              @pn-changed=${(event: CustomEvent) =>
                (this._plantPlantgeekId = (event.target as MultiValueEditor).value)}
            ></pn-multi-value-editor>
          </sl-details>
        </form>
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-properties-form": PlantPropertiesForm;
  }
}
