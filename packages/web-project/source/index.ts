import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import "@shoelace-style/shoelace/dist/components/input/input.js";
import "@shoelace-style/shoelace/dist/components/menu-item/menu-item";
import "@shoelace-style/shoelace/dist/components/select/select.js";
import "@shoelace-style/shoelace/dist/components/textarea/textarea";
import { parse } from "csv-parse/browser/esm/sync";
import { DateTime } from "luxon";
import "./PlantCard";
import "./PlantDbConfig";
import { PlantDbConfig } from "./PlantDbConfig";
import "./PlantList";
import { PlantList } from "./PlantList";

document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});

const init = async () => {
  const { default: plantsData } = await import("../../../plants.csv?raw");
  const { default: plantsLogData } = await import("../../../plantlog.csv?raw");
  const { default: plantsDbData } = await import("../../../plantdb.json?raw");

  const plantDbConfig = JSON.parse(plantsDbData) as DatabaseFormat;

  const dbConfig = document.querySelector("#db-config") as PlantDbConfig;
  dbConfig.plantData = plantsData;
  dbConfig.plantLogData = plantsLogData;
  dbConfig.hasHeaderRow = plantDbConfig.hasHeaderRow;
  dbConfig.columnSeparator = plantDbConfig.columnSeparator;
  dbConfig.dateFormat = plantDbConfig.dateFormat;
  dbConfig.timezone = plantDbConfig.timezone;

  const processButton = document.querySelector("#process") as HTMLButtonElement;
  processButton.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = dbConfig.plantData;
    const plantLogDataRaw = dbConfig.plantLogData;
    const plantDbConfig = DatabaseFormat.deserialize({
      columnSeparator: dbConfig.columnSeparator,
      dateFormat: dbConfig.dateFormat,
      hasHeaderRow: dbConfig.hasHeaderRow,
      timezone: dbConfig.timezone,
    } as DatabaseFormat);
    processData(plantDataRaw, plantLogDataRaw, plantDbConfig);
  });
};

const processData = (
  plantDataRaw: string,
  plantLogDataRaw: string,
  plantDbConfig: DatabaseFormat
) => {
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
      `${plant.name ?? "?"} (${plant.id}) ${DateTime.fromJSDate(logRecord.timestamp).toLocaleString(
        DateTime.DATETIME_SHORT
      )} ${logRecord.type}`
    );
  }

  console.info(
    `Database has ${plantDb.plants.size} plants and ${plantDb.log.length} log entries with ${plantDb.entryTypes.size} different types.`
  );

  const plantContainer = document.querySelector("#plant-container") as PlantList;
  plantContainer.plants = [...plantDb.plants.values()];
};

export {};
