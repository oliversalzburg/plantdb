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
    `,
  ];

  @property()
  plantData = "";

  @property()
  plantLogData = "";
  @state()
  private _logAnalysis = "";

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
          <sl-textarea
            id="log-data"
            rows="10"
            placeholder=${t("import.pastePlantLog")}
            label=${t("import.plantLog")}
            .value=${this.plantLogData}
            @sl-change=${(event: InputEvent) => {
              this.plantLogData = (event.target as SlTextarea).value;
              this._checkInputData();
            }}"
          >
          <small slot="help-text" class="log-analysis">${this._logAnalysis}</small></sl-textarea
          ><sl-button
            @click=${async () => {
              this.plantLogData = await this._openCsvFromFileSystem();
              this.requestUpdate();
            }}
            >${t("import.openPlantLogCsv")}</sl-button>

          <sl-textarea
            id="plant-data"
            rows="10"
            placeholder=${t("import.pastePlants")}
            label=${t("import.plantData")}
            .value=${this.plantData}
            @sl-blur="${(event: InputEvent) => {
              this.plantData = (event.target as SlTextarea).value;
            }}"
          ></sl-textarea>
          <sl-button
            @click=${async () => {
              this.plantData = await this._openCsvFromFileSystem();
              this.requestUpdate();
            }}
            >${t("import.openPlantsCsv")}</sl-button
          >

          <sl-divider></sl-divider>

          <sl-button
            id="process"
            variant="primary"
            @click="${(event: MouseEvent) => this.processImportRequest(event)}"
            >${t("import.import")}</sl-button
          ><sl-button id="export" @click="${() => this.export()}">${t("import.export")}</sl-button>
        </div>
      </div>`,
    ];
  }
}
