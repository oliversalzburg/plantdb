import { PlantDB } from "packages/libplantdb/typings";

/**
 * Describes an interface to a storage strategy.
 */
export interface StorageDriver {
  prepare(): Promise<unknown>;
  connect(): Promise<unknown>;

  get connected(): boolean;

  retrievePlantDb(): Promise<PlantDB>;
  persistPlantDb(plantDb: PlantDB): Promise<unknown>;
}
