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
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { assertExists, mustExist } from "../Maybe";
import { View } from "./View";

@customElement("plant-import-view")
export class PlantImportView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      :host {
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

  @property()
  config = new DatabaseFormat();

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(storedConfig);
    }
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
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
    } as DatabaseFormatSerialized);

    // Temporary DB to hold constructed data.
    let plantDb = new PlantDB();

    const plants = plantDataRaw
      ? plantsFromCSV(plantDb, plantDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.plants.values()];

    const log = plantLogDataRaw
      ? logFromCSV(plantDb, plantDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.log];

    plantDb = PlantDB.fromPlantDB(plantDb, { plants: makePlantMap(plants), log });

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

  render() {
    if (!this.config) {
      return;
    }
    return [
      html` <plant-db-config
          .plantData=${this.plantData}
          .plantLogData=${this.plantLogData}
          .hasHeaderRow=${this.config.hasHeaderRow}
          .columnSeparator=${this.config.columnSeparator}
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
            @sl-blur="${(event: InputEvent) => {
              this.plantLogData = (event.target as SlTextarea).value;
            }}"
          ></sl-textarea>

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
            id="process"
            variant="primary"
            @click="${(event: MouseEvent) => this.processImportRequest(event)}"
            >${t("import.import")}</sl-button
          ><sl-button id="export" @click="${() => this.export()}">${t("import.export")}</sl-button>
        </div>`,
    ];
  }
}
