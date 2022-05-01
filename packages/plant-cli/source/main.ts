import { JS_LIB_VERSION, Plant } from "@plantdb/libplantdb";
import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";

console.log(`Application ready. Using ${JS_LIB_VERSION}`);

const main = async () => {
  const plantDataRaw = await fs.readFile(path.resolve("../../plants.csv"));
  const plantData = parse(plantDataRaw, { columns: false, delimiter: "\t", from: 2 }) as Array<
    Array<string>
  >;
  for (const plantRecord of plantData) {
    const plant = Plant.deserialize(plantRecord);
    console.debug(plant.identify());
  }
};

main().catch(console.error);
