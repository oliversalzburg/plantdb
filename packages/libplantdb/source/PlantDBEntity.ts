export class PlantDBEntity {
  /**
   * Turn this object into something that can be serialized to JSON.
   *
   * @returns A serializable representation of this object.
   */
  toJSON(): unknown {
    return this;
  }
}
