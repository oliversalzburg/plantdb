import { renderKind } from "./Tools.js";

export const MATCH_PID = /PID-\n{1,6}/;

export type PotShapeTop = "Round" | "Square";
export type PotColor = "Grey" | "LightGrey" | "White";

export class Plant {
  #plantId: string;
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

  get id() {
    return this.#plantId;
  }

  get name() {
    return this.#name;
  }

  get substrate() {
    return this.#substrate;
  }

  get potShapeTop() {
    return this.#potShapeTop;
  }

  get potColor() {
    return this.#potColor;
  }

  get onSaucer() {
    return this.#onSaucer;
  }

  get location() {
    return this.#location;
  }

  get phIdeal() {
    return this.#phIdeal;
  }

  get ecIdeal() {
    return this.#ecIdeal;
  }

  get tempIdeal() {
    return this.#tempIdeal;
  }

  get notes() {
    return this.#notes;
  }

  constructor(plantId: string) {
    this.#plantId = plantId;
  }

  identify() {
    return `Plant ${this.#name ?? "<unnamed>"} (${this.id}) ${renderKind(this.#kind)}`;
  }

  toString() {
    return this.identify();
  }

  static deserialize(dataRow: Array<string>): Plant {
    const plant = new Plant(dataRow[0]);
    plant.#name = String(dataRow[1]);
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
