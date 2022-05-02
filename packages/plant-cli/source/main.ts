import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import { parse } from "csv-parse/sync";
import minimist from "minimist";
import fs from "node:fs/promises";
import path from "node:path";

const argv = minimist(process.argv.slice(2));

const cwd: string = (argv.cwd as string) ?? process.cwd();

const main = async () => {
  const plantDbConfigRaw = await fs.readFile(path.resolve(cwd, "plantdb.json"), "utf-8");
  const plantDataRaw = await fs.readFile(path.resolve(cwd, "plants.csv"), "utf-8");
  const plantLogDataRaw = await fs.readFile(path.resolve(cwd, "plantlog.csv"), "utf-8");

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

  const plantDb = PlantDB.deserialize(plantDbConfig, plantData, plantLogData);

  for (const logRecord of plantDb.log) {
    console.debug(plantDb.plants.get(logRecord.plantId)?.identify(), logRecord.render());
  }
};

main().catch(console.error);
