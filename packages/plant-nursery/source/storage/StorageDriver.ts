import { DatabaseFormat, PlantDB } from "packages/libplantdb/typings";

/**
 * Describes an interface to a storage strategy.
 */
export interface StorageDriver {
  prepare(): Promise<unknown>;
  connect(): Promise<unknown>;

  get connected(): boolean;

  getConfiguration(): Promise<DatabaseFormat>;
  retrievePlantDb(): Promise<PlantDB | null>;
  persistPlantDb(plantDb: PlantDB): Promise<unknown>;
}
