export type PotShapeTop = "Round" | "Square";
export type PotColor = "Grey" | "LightGrey" | "White";

export class Plant {
  #plantId: string | undefined;
  #name: string | undefined;
  #kind: string | undefined;
  #substrate: string | undefined;
  #potShapeTop: PotShapeTop | undefined;
  #potColor: PotColor | undefined;
  #onSaucer: boolean | undefined;
  #location: string | undefined;
  #phIdeal: number | undefined;
  #ecIdeal: number | undefined;
  #tempIdeal: number | undefined;
  #notes = "";

  identify() {
    return `Plant ${this.#plantId ?? "<unidentified>"}`;
  }

  toString() {
    return this.identify();
  }

  static deserialize(dataRow: Array<string>): Plant {
    const plant = new Plant();
    plant.#plantId = dataRow[0];
    return plant;
  }
}
