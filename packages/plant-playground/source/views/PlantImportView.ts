import { DatabaseFormat, DatabaseFormatSerialized, PlantDB } from "@plantdb/libplantdb";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { View } from "./View";

@customElement("plant-import-view")
export class PlantImportView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      :host {
        padding: 1rem;
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

  process(event?: MouseEvent) {
    event?.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = this.plantData;
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.fromJSObject({
      columnSeparator: this.config.columnSeparator,
      dateFormat: this.config.dateFormat,
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
    } as DatabaseFormatSerialized);
    this.processData(plantDataRaw, plantLogDataRaw, plantDbConfig);
  }

  processData(plantDataRaw: string, plantLogDataRaw: string, plantDbConfig: DatabaseFormat) {
    const plantDb = PlantDB.fromCSV(plantDbConfig, plantDataRaw, plantLogDataRaw);

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

  updateLog() {
    throw new Error("not implemented");
    /*
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.fromJSON({
      columnSeparator: this.config.columnSeparator,
      dateFormat: this.config.dateFormat,
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
    } as DatabaseFormatSerialized);
    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: plantDbConfig.columnSeparator,
      from: plantDbConfig.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    const plantLog = PlantLog.fromCSV(plantDbConfig, plantLogData);
    */
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

        <sl-button id="process" @click="${(event: MouseEvent) => this.process(event)}"
          >${t("import.import")}</sl-button
        ><sl-button id="process" @click="${() => this.updateLog()}" disabled
          >${t("import.updateLog")}</sl-button
        >`,
    ];
  }
}
