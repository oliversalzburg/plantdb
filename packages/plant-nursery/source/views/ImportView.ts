import {
  DatabaseFormat,
  DatabaseFormatSerialized,
  logFromCSV,
  makePlantMap,
  PlantDB,
  plantsFromCSV,
} from "@plantdb/libplantdb";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { DateTime } from "luxon";
import { assertExists, mustExist } from "../Maybe";
import { View } from "./View";

@customElement("pn-import-view")
export class ImportView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      @media (min-width: 1000px) {
        #import {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #import {
          padding: 0 25vw;
        }
      }

      :host {
        overflow: auto;
        padding: 1rem;
      }

      #import-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .clipboard {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .filesystem {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .filesystem .actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .google-drive {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      #google-drive-actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1rem;
      }

      .help-text {
        display: none;
      }
      .help-text.data-loaded {
        display: block;
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
  private _googleDriveConnected = false;
  @state()
  private _googleDriveHasDb = false;
  @state()
  private _googleDriveDbLastModified: Date | null | undefined = null;
  @state()
  private _googleDriveHelpText = "";
  @query("#google-drive-actions")
  private _googleDriveActions: HTMLDivElement | null | undefined;
  @query("#google-drive-busy")
  private _googleDriveBusy: HTMLDivElement | null | undefined;

  @property()
  config = new DatabaseFormat();

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(storedConfig);
    }

    mustExist(this._googleDriveBusy).style.display = "none";
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

  async processImportRequest() {
    if (!(await this.plantStoreUi?.confirm(t("import.importWarn")))) {
      return;
    }

    console.info("Processing data...");

    assertExists(this.plantStore);

    const plantDataRaw = this.plantData;
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.fromJSObject({
      columnSeparator: this.config.columnSeparator,
      dateFormat: this.config.dateFormat,
      decimalSeparator: this.config.decimalSeparator,
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
      typeMap: Object.fromEntries(this.plantStore.plantDb.config.typeMap),
    } as DatabaseFormatSerialized);

    // Temporary DB to hold constructed data.
    let plantDb = PlantDB.fromJSObjects(plantDbConfig);

    const plants = plantDataRaw
      ? plantsFromCSV(plantDb, plantDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.plants.values()];

    const log = plantLogDataRaw
      ? logFromCSV(plantDb, plantLogDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.log];

    plantDb = PlantDB.fromPlantDB(plantDb, {
      plants: makePlantMap(plants),
      log,
      config: plantDbConfig,
    });

    for (const logRecord of plantDb.log) {
      const plant = plantDb.plants.get(logRecord.plantId);
      if (!plant) {
        continue;
      }
      console.info(
        `${plant.name ?? "?"} (${plant.id}) ${DateTime.fromJSDate(
          logRecord.timestamp
        ).toLocaleString(DateTime.DATETIME_SHORT)} ${logRecord.type}`
      );
    }

    console.info(
      `Database has ${plantDb.plants.size} plants and ${plantDb.log.length} log entries with ${plantDb.entryTypes.size} different types.`
    );

    this.plantStore?.updatePlantDb(plantDb);
    this.plantStoreUi?.navigatePath("/log");
  }

  export() {
    const { log, plants } = mustExist(this.plantStore).plantDb.toCSV(this.config);
    this.plantLogData = log;
    this.plantData = plants;
  }

  private async _openCsvFromFileSystem() {
    const pickerOpts = {
      types: [
        {
          description: "CSV Files",
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
      this.plantStoreUi
        ?.alert(t("import.fsUnsupported"), "danger", "x-circle")
        .catch(console.error);
      throw error;
    }
  }

  private async _connectGoogleDrive() {
    mustExist(this._googleDriveActions).style.display = "none";
    mustExist(this._googleDriveBusy).style.display = "";

    try {
      await this.plantStore?.googleDriveConnect();

      this._googleDriveConnected = true;
      this.plantStoreUi?.alert(t("import.googleDriveConnected")).catch(console.error);

      const lastModified = await this.plantStore?.googleDrive.lastModified();
      this._googleDriveHasDb = lastModified !== null;
      this._googleDriveDbLastModified = lastModified;

      if (this._googleDriveHasDb) {
        this._googleDriveHelpText = `${t("import.googleDriveHasDb")} ${
          this._googleDriveDbLastModified
            ? t("import.googleDriveDbModified", {
                relative: DateTime.fromJSDate(
                  new Date(this._googleDriveDbLastModified)
                ).toRelative(),
                when: DateTime.fromJSDate(new Date(this._googleDriveDbLastModified)).toFormat("f"),
              })
            : ""
        }`;
      }
    } catch (error) {
      this.plantStoreUi?.alert((error as Error).message, "danger", "x-circle").catch(console.error);
    } finally {
      mustExist(this._googleDriveActions).style.display = "";
      mustExist(this._googleDriveBusy).style.display = "none";
    }
  }

  private async _importFromGoogleDrive() {
    if (!(await this.plantStoreUi?.confirm(t("import.importWarn")))) {
      return;
    }

    mustExist(this._googleDriveActions).style.display = "none";
    mustExist(this._googleDriveBusy).style.display = "";

    try {
      this._googleDriveHelpText = "";

      await this.plantStore?.googleDrivePull();

      this._googleDriveDbLastModified = new Date();
      this._googleDriveHelpText = t("import.googleDriveImportedHelp");
      this.plantStoreUi?.alert(t("import.googleDriveImported")).catch(console.error);
      this.requestUpdate();
    } catch (error) {
      this.plantStoreUi?.alert((error as Error).message, "danger", "x-circle").catch(console.error);
    } finally {
      mustExist(this._googleDriveActions).style.display = "";
      mustExist(this._googleDriveBusy).style.display = "none";
    }
  }

  private async _syncToGoogleDrive() {
    if (!(await this.plantStoreUi?.confirm(t("import.googleDriveSyncWarn")))) {
      return;
    }

    mustExist(this._googleDriveActions).style.display = "none";
    mustExist(this._googleDriveBusy).style.display = "";

    try {
      this._googleDriveHelpText = "";

      await this.plantStore?.googleDrivePush();

      this._googleDriveDbLastModified = new Date();
      this._googleDriveHelpText = t("import.googleDriveSynchronizedHelp");
      this.plantStoreUi?.alert(t("import.googleDriveSynchronized")).catch(console.error);
      this.requestUpdate();
    } catch (error) {
      this.plantStoreUi?.alert((error as Error).message, "danger", "x-circle").catch(console.error);
    } finally {
      mustExist(this._googleDriveActions).style.display = "";
      mustExist(this._googleDriveBusy).style.display = "none";
    }
  }

  private _cancelGoogleDrive() {
    mustExist(this._googleDriveActions).style.display = "";
    mustExist(this._googleDriveBusy).style.display = "none";
  }

  render() {
    if (!this.config) {
      return;
    }

    return [
      html`<div id="import">
        <pn-db-config
          .plantData=${this.plantData}
          .plantLogData=${this.plantLogData}
          .hasHeaderRow=${this.config.hasHeaderRow}
          .columnSeparator=${this.config.columnSeparator}
          .decimalSeparator=${this.config.decimalSeparator}
          .dateFormat=${this.config.dateFormat}
          .timezone=${this.config.timezone}
          @pn-config-changed=${(event: CustomEvent<DatabaseFormat>) => (this.config = event.detail)}
        ></pn-db-config>

        <h3>${t("import.title")}</h3>

        <div id="import-section">
          <sl-tab-group>
            <sl-tab slot="nav" panel="clipboard">${t("import.text")}</sl-tab>
            <sl-tab slot="nav" panel="filesystem">${t("import.filesystem")}</sl-tab>
            <sl-tab slot="nav" panel="google-drive">${t("import.googleDrive")}</sl-tab>

            <sl-tab-panel name="google-drive"
              ><div class="google-drive">
                <div id="google-drive-busy">
                  <sl-spinner></sl-spinner> ${t("import.googleDriveBusy")}
                  <sl-button size="small" @click=${() => this._cancelGoogleDrive()}
                    >${t("cancel", { ns: "common" })}</sl-button
                  >
                </div>
                <div id="google-drive-actions">
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
                        ><sl-button @click=${() => this._syncToGoogleDrive()}
                          ><sl-icon slot="prefix" name="cloud-upload"></sl-icon>${t(
                            "import.googleDriveSync"
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
                >

                <sl-textarea
                  id="plant-data"
                  rows="10"
                  placeholder=${t("import.pastePlants")}
                  label=${t("import.plantData")}
                  .value=${this.plantData}
                  @sl-change="${(event: InputEvent) => {
                    this.plantData = (event.target as SlTextarea).value;
                  }}"
                ></sl-textarea>

                <sl-button id="export" @click="${() => this.export()}"
                  >${t("import.export")}</sl-button
                >
              </div>
            </sl-tab-panel>

            <sl-tab-panel name="filesystem"
              ><div class="filesystem">
                <div class="actions">
                  <sl-button
                    variant=${this.plantLogData !== "" ? "success" : "default"}
                    @click=${async () => {
                      this.plantLogData = await this._openCsvFromFileSystem();
                      this._checkInputData();
                      this.requestUpdate();
                    }}
                    >${t("import.openPlantLogCsv")}</sl-button
                  ><sl-button
                    variant=${this.plantData !== "" ? "success" : "default"}
                    @click=${async () => {
                      this.plantData = await this._openCsvFromFileSystem();
                      this.requestUpdate();
                    }}
                    >${t("import.openPlantsCsv")}</sl-button
                  >
                </div>
                <small class="help-text ${this.plantLogData || this.plantData ? "data-loaded" : ""}"
                  >${t("import.dataLoadedHelp")}</small
                >
              </div></sl-tab-panel
            >
          </sl-tab-group>

          <sl-divider></sl-divider>

          <sl-button
            id="process"
            variant="primary"
            @click="${() => this.processImportRequest()}"
            ?disabled=${!this.plantLogData && !this.plantData}
            >${t("import.import")}</sl-button
          >
        </div>
      </div>`,
    ];
  }
}
