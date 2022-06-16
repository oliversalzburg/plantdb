export class PlantDBEntity {
  /**
   * Turn this object into a subset of itself, which is JSON-compliant
   *
   * @returns A serializable representation of this object.
   */
  toJSON(): unknown {
    return this;
  }
}
