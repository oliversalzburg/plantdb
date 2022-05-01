import { renderKind } from "./Tools";

export type PotShapeTop = "Round" | "Square";
export type PotColor = "Grey" | "LightGrey" | "White";

export class Plant {
  #plantId: string | undefined;
  #name: string | undefined;
  #kind: string | Array<string> | undefined;
  #substrate: string | undefined;
  #potShapeTop: PotShapeTop | string | undefined;
  #potColor: PotColor | string | undefined;
  #onSaucer: boolean | undefined;
  #location: string | undefined;
  #phIdeal: number | undefined;
  #ecIdeal: number | undefined;
  #tempIdeal: number | undefined;
  #notes = "";

  identify() {
    return `Plant ${this.#plantId ?? "<unidentified>"} ${this.#name ?? "<unnamed>"} ${renderKind(
      this.#kind
    )} `;
  }

  toString() {
    return this.identify();
  }

  static deserialize(dataRow: Array<string>): Plant {
    const plant = new Plant();
    plant.#plantId = dataRow[0];
    plant.#name = dataRow[1];
    plant.#kind = dataRow[2].includes("\n") ? dataRow[2].split("\n") : dataRow[2];
    plant.#substrate = dataRow[3];
    plant.#potShapeTop = dataRow[4];
    plant.#potColor = dataRow[5];
    plant.#onSaucer = dataRow[6] === "TRUE";
    plant.#location = dataRow[7];
    plant.#phIdeal = Number(dataRow[8]);
    plant.#ecIdeal = Number(dataRow[9]);
    plant.#tempIdeal = Number(dataRow[10]);
    plant.#notes = dataRow[11];
    return plant;
  }
}
