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
import { PlantCard } from "./PlantCard";

document.addEventListener("DOMContentLoaded", () => {
  init().catch(console.error);
});

const init = async () => {
  const { default: plantsData } = await import("../../../plants.csv?raw");
  const { default: plantsLogData } = await import("../../../plantlog.csv?raw");
  const { default: plantsDbData } = await import("../../../plantdb.json?raw");

  const plantData = document.querySelector("#plant-data") as HTMLTextAreaElement;
  const plantLogData = document.querySelector("#log-data") as HTMLTextAreaElement;

  plantData.value = plantsData;
  plantLogData.value = plantsLogData;

  const hasHeaderRow = document.querySelector("#has-header-row") as HTMLInputElement;
  const columnSeparator = document.querySelector("#column-separator") as HTMLSelectElement;
  const dateFormat = document.querySelector("#date-format") as HTMLSelectElement;
  const timezone = document.querySelector("#timezone") as HTMLSelectElement;

  const plantDbConfig = JSON.parse(plantsDbData) as DatabaseFormat;
  hasHeaderRow.checked = plantDbConfig.hasHeaderRow;
  columnSeparator.value = plantDbConfig.columnSeparator;
  dateFormat.value = plantDbConfig.dateFormat;
  timezone.value = plantDbConfig.timezone;

  const processButton = document.querySelector("#process") as HTMLButtonElement;
  processButton.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = plantData.value;
    const plantLogDataRaw = plantLogData.value;
    const plantDbConfig = DatabaseFormat.deserialize({
      columnSeparator: columnSeparator.value,
      dateFormat: dateFormat.value,
      hasHeaderRow: hasHeaderRow.checked,
      timezone: timezone.value,
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

  const plantContainer = document.querySelector("#plant-container") as HTMLDivElement;
  for (const plantElement of [...plantContainer.children]) {
    plantContainer.removeChild(plantElement);
  }
  for (const plant of plantDb.plants.values()) {
    const plantElement = document.createElement("plant-card") as PlantCard;
    plantElement.plantId = plant.id;
    plantElement.name = plant.name ?? "";
    plantElement.kind = plant.kind ?? "";
    plantElement.dateCreated = plant.log[0].timestamp.toString();
    plantElement.lastUpdated = plant.log[plant.log.length - 1].timestamp.toString();

    plantContainer.appendChild(plantElement);
  }
};

export {};
