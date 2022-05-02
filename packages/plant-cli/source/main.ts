import { LogEntry, Plant } from "@plantdb/libplantdb";
import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";

const main = async () => {
  const plantDataRaw = await fs.readFile(path.resolve("plants.csv"));
  const plantLogDataRaw = await fs.readFile(path.resolve("plantlog.csv"));
  const plantData = parse(plantDataRaw, { columns: false, delimiter: "\t", from: 2 }) as Array<
    Array<string>
  >;
  const plantLogData = parse(plantLogDataRaw, {
    columns: false,
    delimiter: "\t",
    from: 2,
  }) as Array<Array<string>>;
  for (const plantRecord of plantData) {
    const plant = Plant.deserialize(plantRecord);
    console.debug(plant.identify());
  }
  for (const logRecord of plantLogData) {
    LogEntry.validate(logRecord);
    const logEntry = LogEntry.deserialize(logRecord);
    console.debug(logEntry.render());
  }
};

main().catch(console.error);
