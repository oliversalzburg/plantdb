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
import { customElement, property, state } from "lit/decorators.js";
import { DateTime } from "luxon";
import { assertExists, mustExist } from "../Maybe";
import { View } from "./View";

@customElement("plant-import-view")
export class PlantImportView extends View {
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
      .google-drive .actions {
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

  @property()
  config = new DatabaseFormat();

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
    this._logAnalysis = `Data contains: comma ${counts["comma"]} time(s), semicolon ${counts["semicolon"]} time(s), tab ${counts["tab"]} time(s). Most likely column separator: ${likelySeparator}`;
  }

  processImportRequest(event?: MouseEvent) {
    event?.preventDefault();
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

  private _tokenClient: google.accounts.oauth2.TokenClient | undefined;
  private async _testGoogleDrive() {
    const CLIENT_ID = "621528596325-b01c3qtllvnrl2gk8hmfctn7s8s7s4q8.apps.googleusercontent.com";
    const API_KEY = "AIzaSyBeBF_z_jai2SzHHaFXEAatLeYReL_OObE";
    const SCOPES = "https://www.googleapis.com/auth/drive.readonly";

    if (!this._tokenClient) {
      await this._loadGoogleAuthApi();
      this._tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: resp => {
          if (resp.error !== undefined) {
            throw resp;
          }

          this._googleDriveConnected = true;
          this.plantStoreUi?.alert("Success").catch(console.error);
          this._listFiles().catch(console.error);
        },
      });

      await this._loadGoogleDriveApi();
      const onClientLoaded = async () => {
        await gapi.client.init({
          apiKey: API_KEY,
          discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
        });

        if (gapi.client.getToken() === null) {
          // Prompt the user to select a Google Account and ask for consent to share their data
          // when establishing a new session.
          mustExist(this._tokenClient).requestAccessToken({ prompt: "consent" });
        } else {
          // Skip display of account chooser and consent dialog for an existing session.
          mustExist(this._tokenClient).requestAccessToken({ prompt: "" });
        }
      };
      gapi.load("client", () => {
        onClientLoaded().catch(console.error);
      });
    } else {
      return this._listFiles();
    }
  }

  private async _listFiles() {
    let response;
    try {
      response = await gapi.client.drive.files.list({
        fields: "files(id, name)",
        pageSize: 10,
        q: "mimeType='text/csv'",
        spaces: "drive",
      });
    } catch (err) {
      console.error(err);
      return;
    }
    const files = response.result.files;
    if (!files || files.length == 0) {
      console.log("No files found.");
      return;
    }

    for (const file of files) {
      if (file.name === "plantlog.csv" && file.id) {
        this._plantLogFileId = file.id;
      }
      if (file.name === "plants.csv" && file.id) {
        this._plantsFileId = file.id;
      }
    }
  }

  private _scriptGoogleAuthApi: HTMLScriptElement | undefined;
  private async _loadGoogleAuthApi() {
    return new Promise(resolve => {
      if (this._scriptGoogleAuthApi) {
        resolve(null);
        return;
      }

      this._scriptGoogleAuthApi = Object.assign(document.createElement("script"), {
        async: true,
        defer: true,
        src: "https://accounts.google.com/gsi/client",
        onload: () => resolve(null),
      });
      document.body.appendChild(this._scriptGoogleAuthApi);
    });
  }
  private _scriptGoogleDriveApi: HTMLScriptElement | undefined;
  private async _loadGoogleDriveApi() {
    return new Promise(resolve => {
      if (this._scriptGoogleDriveApi) {
        resolve(window.gapi);
        return;
      }

      this._scriptGoogleDriveApi = Object.assign(document.createElement("script"), {
        async: true,
        defer: true,
        src: "https://apis.google.com/js/api.js",
        onload: () => resolve(window.gapi),
      });
      document.body.appendChild(this._scriptGoogleDriveApi);
    });
  }
  @state()
  private _plantLogFileId: string | undefined;
  private async _loadPlantLogFromGoogleDrive() {
    if (!this._plantLogFileId) {
      return;
    }
    const fileData = await gapi.client.drive.files.get({
      fileId: this._plantLogFileId,
      alt: "media",
    });
    this.plantLogData = fileData.body;
    this._checkInputData();
  }
  @state()
  private _plantsFileId: string | undefined;
  private async _loadPlantsFromGoogleDrive() {
    if (!this._plantsFileId) {
      return;
    }
    const fileData = await gapi.client.drive.files.get({
      fileId: this._plantsFileId,
      alt: "media",
    });
    this.plantData = fileData.body;
  }

  render() {
    if (!this.config) {
      return;
    }
    return [
      html`<div id="import">
        <plant-db-config
          .plantData=${this.plantData}
          .plantLogData=${this.plantLogData}
          .hasHeaderRow=${this.config.hasHeaderRow}
          .columnSeparator=${this.config.columnSeparator}
          .decimalSeparator=${this.config.decimalSeparator}
          .dateFormat=${this.config.dateFormat}
          .timezone=${this.config.timezone}
          @plant-config-changed=${(event: CustomEvent<DatabaseFormat>) =>
            (this.config = event.detail)}
        ></plant-db-config>

        <h3>${t("import.title")}</h3>

        <div id="import-section">
          <sl-tab-group>
            <sl-tab slot="nav" panel="clipboard">${t("import.text")}</sl-tab>
            <sl-tab slot="nav" panel="filesystem">${t("import.filesystem")}</sl-tab>
            <sl-tab slot="nav" panel="google-drive">${t("import.googleDrive")}</sl-tab>

            <sl-tab-panel name="google-drive"
              ><div class="google-drive">
                <div class="actions">
                  <sl-button
                    @click=${() => this._testGoogleDrive()}
                    variant=${this._googleDriveConnected ? "success" : "default"}
                    ><sl-icon slot="prefix" name="google"></sl-icon>${t(
                      "import.connectGoogleDrive"
                    )}</sl-button
                  ><sl-button
                    ?disabled=${this._plantLogFileId === undefined}
                    variant=${this.plantLogData !== "" ? "success" : "default"}
                    @click=${() => this._loadPlantLogFromGoogleDrive()}
                    >Load plantlog.csv</sl-button
                  ><sl-button
                    ?disabled=${this._plantsFileId === undefined}
                    variant=${this.plantData !== "" ? "success" : "default"}
                    @click=${() => this._loadPlantsFromGoogleDrive()}
                    >Load plants.csv</sl-button
                  >
                </div>
                <small class="help-text ${this.plantLogData || this.plantData ? "data-loaded" : ""}"
                  >Check the "Text" panel to see your loaded data.</small
                >
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
                  >Check the "Text" panel to see your loaded data.</small
                >
              </div></sl-tab-panel
            >
          </sl-tab-group>

          <sl-divider></sl-divider>

          <sl-button
            id="process"
            variant="primary"
            @click="${(event: MouseEvent) => this.processImportRequest(event)}"
            >${t("import.import")}</sl-button
          >
        </div>
      </div>`,
    ];
  }
}
