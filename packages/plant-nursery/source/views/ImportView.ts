import { DatabaseFormat } from "@plantdb/libplantdb";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { DataExchangeView } from "./DataExchangeView";

@customElement("pn-import-view")
export class ImportView extends DataExchangeView {
  static readonly styles = [
    ...DataExchangeView.styles,
    css`
      .clipboard sl-button {
        align-self: flex-end;
      }
    `,
  ];

  @property()
  plantData = "";

  @property()
  plantLogData = "";
  @state()
  private _logAnalysis = "";
  @state()
  private _hasFsAccess = "showOpenFilePicker" in window;

  @property()
  config = DatabaseFormat.DefaultInterchange();

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(storedConfig);
    }
  }

  private _checkInputData() {
    const plantLogDataRaw = this.plantLogData;
    const counts = {
      comma: (plantLogDataRaw.match(/,/g) || []).length,
      semicolon: (plantLogDataRaw.match(/;/g) || []).length,
      tab: (plantLogDataRaw.match(/\t/g) || []).length,
    };
    const likelySeparator = (Object.keys(counts) as Array<keyof typeof counts>).reduce((a, b) =>
      counts[a] > counts[b] ? a : b
    );
    this._logAnalysis = t("import.logAnalysis", {
      counts,
      likelySeparator,
    });
  }

  private async _openCsvFromFileSystem() {
    const pickerOpts = {
      types: [
        {
          description: t("import.csvFiles"),
          accept: {
            "text/csv": [".csv"],
          },
        },
      ],
      excludeAcceptAllOption: true,
      multiple: false,
    };
    try {
      // open file picker
      const [fileHandle] = await window.showOpenFilePicker(pickerOpts);

      // get file contents

      const fileData = await fileHandle.getFile();

      return fileData.text();
    } catch (error) {
      console.error(error);
      this.plantStoreUi
        ?.alert(t("import.fsUnsupported"), "danger", "x-circle")
        .catch(console.error);
      throw error;
    }
  }

  render() {
    if (!this.config) {
      return;
    }

    return [
      html`<div
        part="base"
        id="import"
        class=${classMap({
          import: true,
          "import--google-busy": this._googleDriveBusy,
        })}
      >
        <div id="import-section">
          <sl-tab-group>
            <sl-tab slot="nav" panel="clipboard">${t("import.text")}</sl-tab>
            <sl-tab slot="nav" panel="google-drive">${t("import.googleDrive")}</sl-tab>

            <sl-tab-panel name="google-drive"
              ><div class="google-drive">
                <div class="google-drive-busy">
                  <sl-spinner></sl-spinner> ${t("import.googleDriveBusy")}
                  <sl-button size="small" @click=${() => this._cancelGoogleDrive()}
                    >${t("cancel", { ns: "common" })}</sl-button
                  >
                </div>
                <div class="google-drive-actions">
                  <sl-button
                    @click=${() => this._connectGoogleDrive()}
                    variant=${this._googleDriveConnected ? "success" : "default"}
                    ><sl-icon slot="prefix" name="google"></sl-icon>${t(
                      "import.connectGoogleDrive"
                    )}</sl-button
                  >${this._googleDriveConnected
                    ? html`<sl-button
                        ?disabled=${!this._googleDriveHasDb}
                        @click=${() => this._importFromGoogleDrive()}
                        ><sl-icon slot="prefix" name="cloud-download"></sl-icon>${t(
                          "import.googleDriveImport"
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
                <sl-details summary=${t("dbConfig.title")}>
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
                  placeholder=${t("import.pastePlantLog")}
                  label=${t("import.plantLog")}
                  .value=${this.plantLogData}
                  @sl-change=${(event: InputEvent) => {
                    this.plantLogData = (event.target as SlTextarea).value;
                    this._checkInputData();
                  }}
                >
                  <small slot="help-text" class="log-analysis"
                    >${this._logAnalysis}</small
                  ></sl-textarea
                >${this._hasFsAccess
                  ? html` <sl-button
                      @click=${async () => {
                        this.plantLogData = await this._openCsvFromFileSystem();
                        this._checkInputData();
                        this.requestUpdate();
                      }}
                      >${t("import.openPlantLogCsv")}</sl-button
                    >`
                  : undefined}

                <sl-textarea
                  id="plant-data"
                  rows="10"
                  placeholder=${t("import.pastePlants")}
                  label=${t("import.plantData")}
                  .value=${this.plantData}
                  @sl-change="${(event: InputEvent) => {
                    this.plantData = (event.target as SlTextarea).value;
                  }}"
                ></sl-textarea
                >${this._hasFsAccess
                  ? html`<sl-button
                      @click=${async () => {
                        this.plantData = await this._openCsvFromFileSystem();
                        this.requestUpdate();
                      }}
                      >${t("import.openPlantsCsv")}</sl-button
                    >`
                  : undefined}
                <sl-button
                  id="process"
                  variant="primary"
                  @click="${() => this.processImportRequest(this.plantData, this.plantLogData)}"
                  ?disabled=${!this.plantLogData && !this.plantData}
                  >${t("import.import")}</sl-button
                >
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
    "pn-import-view": ImportView;
  }
}
