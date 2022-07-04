import {
  DatabaseFormat,
  DictionaryClassifier,
  DictionaryClassifiers,
  EventType,
  LogEntrySerialized,
  PlantDB,
  PlantSerialized,
  TaskSerialized,
  UserDictionary,
} from "@plantdb/libplantdb";

export type NurseryConfiguration = {
  databaseFormat: DatabaseFormat;
  typeMap: UserDictionary<EventType>;
};

export const getConfigurationFromPlantDB = (plantDb: PlantDB) => {
  return {
    databaseFormat: plantDb.databaseFormat,
    typeMap: plantDb.getDictionary<EventType>(DictionaryClassifiers.LogEntryEventType),
  };
};

/**
 * Describes an interface to a storage strategy.
 */
export interface StorageDriver {
  /**
   * Invoked very early in the application startup process to allow resource
   * initialization at the earliest possible moment.
   * Resource loads that could leak user private information should be delayed
   * to the later `connect()` call.
   * An example of that is loading resources from a Google CDN.
   */
  prepare(): Promise<unknown>;
  /**
   * Ensure the driver can be used.
   */
  connect(): Promise<unknown>;

  /**
   * Is this driver ready to be used?
   */
  get connected(): boolean;

  /**
   * Retrieve the configuration for the entire application.
   */
  getApplicationConfiguration(): Promise<NurseryConfiguration>;
  /**
   * Retrieve the user-defined dictionaries.
   */
  getUserDictionaries(): Promise<Map<DictionaryClassifier, UserDictionary>>;

  /**
   * Persists a new configuration state to the storage backend.
   *
   * @param configuration The new configuration to persist.
   */
  updateApplicationConfiguration(configuration: NurseryConfiguration): Promise<void>;

  /**
   * Retrieves the log in its serialized form.
   */
  getRawLog(): Promise<Array<LogEntrySerialized> | null>;
  /**
   * Retrieves the plants in their serialized form.
   */
  getRawPlants(): Promise<Array<PlantSerialized> | null>;
  /**
   * Retrieves the tasks in their serialized form.
   */
  getRawTasks(): Promise<Array<TaskSerialized> | null>;

  retrievePlantDb(): Promise<PlantDB | null>;
  persistPlantDb(plantDb: PlantDB): Promise<unknown>;
}
