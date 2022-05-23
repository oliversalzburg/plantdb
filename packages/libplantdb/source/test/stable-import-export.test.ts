import { expect } from "chai";
import { it } from "mocha";
import { DatabaseFormat } from "../DatabaseFormat.js";
import { PlantDB } from "../PlantDB.js";

it("imports as expected", () => {
  const plantDb = PlantDB.fromCSV(
    DatabaseFormat.fromJSObject({
      columnSeparator: "\t",
      hasHeaderRow: false,
    }),
    `PID-34	Grünes Dschungel-Arrangement	"Chlorophytum comosum
Epipremnum
Monstera adansonii
Aloe"	Mischsubstrat	Oval	Grey	FALSE	Wohnzimmer				
`,
    ""
  );

  expect(plantDb.plants.size).equals(1);
  const plant = [...plantDb.plants.values()][0];
  expect(plant.id).equals("PID-34");
  expect(plant.name).equals("Grünes Dschungel-Arrangement");
  expect(plant.kind).instanceOf(Array);
  expect(plant.kind?.length).equals(4);
  expect(plant.substrate).equals("Mischsubstrat");
  expect(plant.potShapeTop).equals("Oval");
  expect(plant.potColor).equals("Grey");
  expect(plant.onSaucer).equals(false);
  expect(plant.location).equals("Wohnzimmer");
  expect(plant.phIdeal).equals(undefined);
  expect(plant.ecIdeal).equals(undefined);
  expect(plant.tempIdeal).equals(undefined);
  expect(plant.notes).equals(undefined);
});
