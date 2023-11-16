import { DatabaseFormat, PlantDB } from "@plantdb/libplantdb";
import { DateTime } from "luxon";
import minimist from "minimist";
import fs from "node:fs/promises";
import path from "node:path";

const argv = minimist(process.argv.slice(2));

const cwd: string = (argv.cwd as string | undefined) ?? process.cwd();

const main = async () => {
  const plantDbConfigRaw = await fs.readFile(path.resolve(cwd, "plantdb.json"), "utf-8");
  const plantDataRaw = await fs.readFile(path.resolve(cwd, "plants.csv"), "utf-8");
  const plantLogDataRaw = await fs.readFile(path.resolve(cwd, "plantlog.csv"), "utf-8");

  const plantDbConfig = DatabaseFormat.fromJSON(plantDbConfigRaw);

  const plantDb = PlantDB.fromCSV(plantDbConfig, plantDataRaw, plantLogDataRaw);

  for (const logRecord of plantDb.log) {
    const plant = plantDb.plants.get(logRecord.plantId);
    if (!plant) {
      continue;
    }
    console.info(
      `${plant.name ?? "?"} (${plant.id}) ${DateTime.fromJSDate(logRecord.timestamp).toLocaleString(
        DateTime.DATETIME_SHORT,
      )} ${logRecord.type}`,
    );
  }

  console.info(
    `Database has ${plantDb.plants.size} plants and ${plantDb.log.length} log entries with ${plantDb.entryTypes.size} different types.`,
  );
};

main().catch(console.error);
