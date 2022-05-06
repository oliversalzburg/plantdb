import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import { parse } from "csv-parse/browser/esm/sync";
import { DateTime } from "luxon";

console.log("Application ready. Using ...");

document.addEventListener("DOMContentLoaded", () => {
  const plantData = document.querySelector("#plant-data") as HTMLTextAreaElement;
  const plantLogData = document.querySelector("#log-data") as HTMLTextAreaElement;

  const processButton = document.querySelector("#process") as HTMLButtonElement;
  processButton.addEventListener("click", (event: MouseEvent) => {
    event.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = plantData.value;
    const plantLogDataRaw = plantLogData.value;
    const plantDbConfig = new DatabaseFormat();
    processData(plantDataRaw, plantLogDataRaw, plantDbConfig);
  });
});

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
  for (const plant of plantDb.plants.values()) {
    const plantElement = document.createElement("article");
    plantElement.textContent = plant.name ?? "";
    plantContainer.appendChild(plantElement);
  }
};

export {};
