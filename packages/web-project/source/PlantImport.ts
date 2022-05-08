import { DatabaseFormat, DatabaseFormatSerialized, Plant, PlantDB } from "@plantdb/libplantdb";
import SlTextarea from "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { parse } from "csv-parse/browser/esm/sync";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { PlantDbStorage } from "./PlantDbStorage";

@customElement("plant-import")
export class PlantImport extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: Boolean })
  active = false;

  protected shouldUpdate(): boolean {
    return this.active;
  }

  @property()
  plantData = "";

  @property()
  plantLogData = "";

  @property()
  config = new DatabaseFormat();

  @property()
  plants = new Array<Plant>();

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(JSON.parse(storedConfig) as DatabaseFormatSerialized);
    }
  }

  process(event?: MouseEvent) {
    event?.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = this.plantData;
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.fromJSON({
      columnSeparator: this.config.columnSeparator,
      dateFormat: this.config.dateFormat,
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
    } as DatabaseFormatSerialized);
    this.processData(plantDataRaw, plantLogDataRaw, plantDbConfig);
  }

  processData(plantDataRaw: string, plantLogDataRaw: string, plantDbConfig: DatabaseFormat) {
    const plantData = parse(plantDataRaw, {
      columns: false,
      delimiter: plantDbConfig.columnSeparator,
      from: plantDbConfig.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: plantDbConfig.columnSeparator,
      from: plantDbConfig.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;

    const plantDb = PlantDB.fromCSV(plantDbConfig, plantData, plantLogData);

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

    this.plants = [...plantDb.plants.values()];

    PlantDbStorage.persistPlantDb(plantDb);
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
          @config-changed=${(event: CustomEvent<DatabaseFormat>) => (this.config = event.detail)}
        ></plant-db-config>
        <fieldset class="import-container">
          <legend>Import Data</legend>
          <sl-textarea
            id="plant-data"
            rows="10"
            placeholder="paste plants.csv here"
            label="Plant data"
            .value=${this.plantData}
            @sl-blur="${(event: InputEvent) => {
              this.plantData = (event.target as SlTextarea).value;
            }}"
          ></sl-textarea>

          <sl-textarea
            id="log-data"
            rows="10"
            placeholder="paste plantlog.csv here"
            label="Plant log"
            .value=${this.plantLogData}
            @sl-blur="${(event: InputEvent) => {
              this.plantLogData = (event.target as SlTextarea).value;
            }}"
          ></sl-textarea>
        </fieldset>
        <sl-button id="process" @click="${(event: MouseEvent) => this.process(event)}"
          >Import</sl-button
        >`,
    ];
  }
}
