import { JS_LIB_VERSION } from "@plantdb/libplantdb";
import { parse } from "csv-parse/sync";
import fs from "node:fs/promises";
import path from "node:path";

console.log(`Application ready. Using ${JS_LIB_VERSION}`);

const main = async () => {
  const plantDataRaw = await fs.readFile(path.resolve("../../plants.csv"));
  const plantData = parse(plantDataRaw, { delimiter: "\t" }) as Array<Array<string>>;
  console.dir(plantData);
};

main().catch(console.error);
