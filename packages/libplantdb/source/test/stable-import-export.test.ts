import { expect } from "chai";
import { it } from "mocha";
import { DatabaseFormat } from "../DatabaseFormat.js";
import { PlantDB } from "../PlantDB.js";

describe("plant", () => {
  it("handles multi-value kind as expected", () => {
    const databaseFormat = DatabaseFormat.fromJSObject({
      columnSeparator: "\t",
      hasHeaderRow: false,
    });
    const plantDataRaw = `PID-34	Grünes Dschungel-Arrangement	"Chlorophytum comosum
Epipremnum
Monstera adansonii
Aloe"	Mischsubstrat	Oval	Grey	FALSE	Wohnzimmer				
`;
    const plantDb = PlantDB.fromCSV(databaseFormat, plantDataRaw, "");

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

    const exported = plantDb.toCSV(databaseFormat);
    expect(exported.plants).equals(plantDataRaw);
  });
});

describe("log", () => {
  it("handles sample #0 as expected", () => {
    const databaseFormat = DatabaseFormat.fromJSObject({
      columnSeparator: "\t",
      dateFormat: "dd/MM/yyyy HH:mm",
      hasHeaderRow: false,
      timezone: "Europe/Berlin",
    });
    const plantLogDataRaw = "PID-5	22/05/2022 10:48	Messung		950	5,4	";
    const plantDb = PlantDB.fromCSV(databaseFormat, "", plantLogDataRaw);

    expect(plantDb.plants.size).equals(1);
    expect(plantDb.log.length).equals(1);
    const logEntry = plantDb.log[0];
    expect(logEntry.plantId).equals("PID-5");
    expect(logEntry.timestamp).eqls(new Date("2022-05-22 10:48:00+02:00"));
    expect(logEntry.type).equals("Messung");
    expect(logEntry.note).equals(undefined);
    expect(logEntry.ec).equals(950);
    expect(logEntry.ph).equals(5.4);
    expect(logEntry.productUsed).equals(undefined);

    const exported = plantDb.toCSV(databaseFormat);
    expect(exported.log).equals(plantLogDataRaw);
  });
});
