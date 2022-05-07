import { DatabaseFormat, Plant, PlantDB } from "@plantdb/libplantdb";
import { parse } from "csv-parse/browser/esm/sync";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("plant-app")
export class PlantApp extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property()
  plantData = "";

  @property()
  plantLogData = "";

  @property()
  columnSeparator = "\t";

  @property()
  dateFormat = "yyyy-MM-dd hh:mm:ss";

  @property({ type: Boolean })
  hasHeaderRow = false;

  @property()
  timezone = "utc";

  @property()
  plants = new Array<Plant>();

  process(event?: MouseEvent) {
    event?.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = this.plantData;
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.deserialize({
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
    } as DatabaseFormat);
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

    const plantDb = PlantDB.deserialize(plantDbConfig, plantData, plantLogData);

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
  }

  render() {
    return [
      html`<details>
          <summary>Configuration</summary>
          <plant-db-config
            .plantData="${this.plantData}"
            .plantLogData="${this.plantLogData}"
            .hasHeaderRow="${this.hasHeaderRow}"
            .columnSeparator="${this.columnSeparator}"
            .dateFormat="${this.dateFormat}"
            .timezone="${this.timezone}"
          ></plant-db-config>
        </details>
        <sl-button id="process" @click="${(event: MouseEvent) => this.process(event)}"
          >Process</sl-button
        >
        <plant-list .plants="${this.plants}"></plant-list>`,
    ];
  }
}
