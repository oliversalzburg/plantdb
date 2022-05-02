import { DatabaseFormat, LogEntry, Plant } from "@plantdb/libplantdb";
import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";

const main = async () => {
  const plantDbConfigRaw = await fs.readFile(path.resolve("plantdb.json"), "utf-8");
  const plantDataRaw = await fs.readFile(path.resolve("plants.csv"), "utf-8");
  const plantLogDataRaw = await fs.readFile(path.resolve("plantlog.csv"), "utf-8");

  const plantDbConfigParsed = JSON.parse(plantDbConfigRaw) as DatabaseFormat;
  const plantDbConfig = DatabaseFormat.deserialize(plantDbConfigParsed);

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

  for (const plantRecord of plantData) {
    const plant = Plant.deserialize(plantRecord);
    console.debug(plant.identify());
  }
  for (const logRecord of plantLogData) {
    LogEntry.validate(logRecord);
    const logEntry = LogEntry.deserialize(logRecord, plantDbConfig);
    console.debug(logEntry.render());
  }
};

main().catch(console.error);
