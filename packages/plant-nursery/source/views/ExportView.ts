import { mustExist } from "@oliversalzburg/js-utils/lib/nil";
import { DatabaseFormat } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { DataExchangeView } from "./DataExchangeView";

@customElement("pn-export-view")
export class ExportView extends DataExchangeView {
  static readonly styles = [
    ...DataExchangeView.styles,
    css`
      .clipboard sl-button {
        align-self: flex-start;
      }
      .clipboard sl-button:first-child {
        align-self: center;
      }
    `,
  ];

  @property()
  plantData = "";

  @property()
  plantLogData = "";

  @property({ attribute: false })
  config = DatabaseFormat.DefaultInterchange();

  @state()
  private _hasFsAccess = "showSaveFilePicker" in window;

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(storedConfig);
    }
  }

  export() {
    const { log, plants } = mustExist(this.plantStore).plantDb.toCSV(this.config);
    this.plantLogData = log;
    this.plantData = plants;
  }

  private async _saveCsvToFileSystem(data: string, filename: string) {
    const pickerOpts: SaveFilePickerOptions = {
      suggestedName: filename,
      types: [
        {
          description: t("import.csvFiles"),
          accept: {
            "text/csv": [".csv"],
          },
        },
      ],
    };
    const fileHandle = await window.showSaveFilePicker(pickerOpts);
    const writeable = await fileHandle.createWritable();
    return writeable.write(data);
  }

  render() {
    return [
      html`<div
        part="base"
        id="import"
        class=${classMap({
          import: true,
          "import--google-busy": this._googleDriveBusy,
        })}
      >
        <div id="export-section">
          <sl-tab-group>
            <sl-tab slot="nav" panel="clipboard">${t("export.text")}</sl-tab>
            <sl-tab slot="nav" panel="google-drive">${t("import.googleDrive")}</sl-tab>

            <sl-tab-panel name="google-drive"
              ><div class="google-drive">
                <div class="google-drive-busy">
                  <sl-spinner></sl-spinner> ${t("import.googleDriveBusy")}
                  <sl-button
                    size="small"
                    @click=${() => {
                      this._cancelGoogleDrive();
                    }}
                    >${t("cancel", { ns: "common" })}</sl-button
                  >
                </div>
                <div class="google-drive-actions">
                  <sl-button
                    @click=${() => this._connectGoogleDrive()}
                    variant=${this._googleDriveConnected ? "success" : "default"}
                    ><sl-icon slot="prefix" name="google"></sl-icon>${t(
                      "import.connectGoogleDrive",
                    )}</sl-button
                  >${this._googleDriveConnected
                    ? html`<sl-button @click=${() => this._syncToGoogleDrive()}
                        ><sl-icon slot="prefix" name="cloud-upload"></sl-icon>${t(
                          "import.googleDriveSync",
                        )}</sl-button
                      >`
                    : undefined}
                </div>
                ${this._googleDriveHasDb
                  ? html`<span>${this._googleDriveHelpText}</span>`
                  : undefined}
              </div></sl-tab-panel
            >

            <sl-tab-panel name="clipboard"
              ><div class="clipboard">
                <sl-button
                  id="export"
                  variant="primary"
                  @click="${() => {
                    this.export();
                  }}"
                  >${t("export.insert")}</sl-button
                ><sl-details summary=${t("dbConfig.title")}>
                  <pn-db-config
                    .plantData=${this.plantData}
                    .plantLogData=${this.plantLogData}
                    .hasHeaderRow=${this.config.hasHeaderRow}
                    .columnSeparator=${this.config.columnSeparator}
                    .decimalSeparator=${this.config.decimalSeparator}
                    .dateFormat=${this.config.dateFormat}
                    .timezone=${this.config.timezone}
                    @pn-config-changed=${(event: CustomEvent<DatabaseFormat>) =>
                      (this.config = event.detail)}
                  ></pn-db-config
                ></sl-details>
                <sl-textarea
                  id="log-data"
                  rows="10"
                  label=${t("import.plantLog")}
                  .value=${this.plantLogData}
                  readonly
                ></sl-textarea>
                ${this._hasFsAccess
                  ? html`<sl-button
                      ?disabled=${!this.plantLogData}
                      @click=${async () => {
                        await this._saveCsvToFileSystem(this.plantLogData, "plantlog.csv");
                        this.requestUpdate();
                      }}
                      >${t("import.savePlantLogCsv")}</sl-button
                    >`
                  : undefined}

                <sl-textarea
                  id="plant-data"
                  rows="10"
                  label=${t("import.plantData")}
                  .value=${this.plantData}
                  readonly
                ></sl-textarea>
                ${this._hasFsAccess
                  ? html`<sl-button
                      ?disabled=${!this.plantData}
                      @click=${async () => {
                        await this._saveCsvToFileSystem(this.plantData, "plants.csv");
                        this.requestUpdate();
                      }}
                      >${t("import.savePlantsCsv")}</sl-button
                    >`
                  : undefined}
              </div>
            </sl-tab-panel>
          </sl-tab-group>
        </div>
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-export-view": ExportView;
  }
}
