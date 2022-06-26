import { DatabaseFormat, DatabaseFormatSerialized } from "./DatabaseFormat";
import { EventType } from "./LogEntry";
import { PlantDBEntity } from "./PlantDBEntity";

export type ApplicationConfigurationSerialized = {
  databaseFormat: DatabaseFormatSerialized;
  typeMap: Record<string, EventType>;
};

export class ApplicationConfiguration extends PlantDBEntity {
  #databaseFormat = DatabaseFormat.DefaultInterchange();
  #typeMap = new Map<string, EventType>();

  /** @inheritDoc {PlantDB.databaseFormat} */
  get databaseFormat() {
    return this.#databaseFormat;
  }

  /**
   * A map of strings that appear as event identifiers in the document and the Plant-DB event types
   * they correlate to.
   */
  get typeMap() {
    return this.#typeMap;
  }

  /**
   * Creates a new `ApplicationConfiguration`, based on this one, but with a new type map.
   *
   * @param typeMap The type map to use in the new `ApplicationConfiguration`.
   * @returns The new `ApplicationConfiguration`.
   */
  withNewTypeMap(typeMap: Map<string, EventType>) {
    const copy = ApplicationConfiguration.fromApplicationConfiguration(this);
    copy.#typeMap = typeMap;
    return copy;
  }

  /**
   * Creates a new `ApplicationConfiguration`, with the values of another `ApplicationConfiguration`.
   *
   * @param other The `ApplicationConfiguration` to copy values from.
   * @returns The new `ApplicationConfiguration`.
   */
  static fromApplicationConfiguration(other: ApplicationConfiguration) {
    const format = new ApplicationConfiguration();
    format.#databaseFormat = other.#databaseFormat;
    format.#typeMap = new Map(other.#typeMap);
    return format;
  }

  /**
   * Parse a JS object and construct a new `ApplicationConfiguration` from it.
   *
   * @param data The serialized `ApplicationConfiguration`.
   * @returns The new `ApplicationConfiguration`.
   */
  static fromJSObject(data: Partial<ApplicationConfigurationSerialized>) {
    const configuration = new ApplicationConfiguration();
    configuration.#databaseFormat = data.databaseFormat
      ? DatabaseFormat.fromJSObject(data.databaseFormat)
      : configuration.#databaseFormat;

    configuration.#typeMap = new Map(Object.entries(data.typeMap ?? {}));
    return configuration;
  }

  /**
   * Parse a JSON string and construct a new `ApplicationConfiguration` from it.
   *
   * @param dataString The JSON-serialized application configuration.
   * @returns The new `ApplicationConfiguration`.
   */
  static fromJSON(dataString: string) {
    const data = JSON.parse(dataString) as Partial<ApplicationConfigurationSerialized>;
    return ApplicationConfiguration.fromJSObject(data);
  }

  /**
   * Convert the `ApplicationConfiguration` into a plain JS object.
   *
   * @returns The `ApplicationConfiguration` as a plain JS object.
   */
  toJSObject(): ApplicationConfigurationSerialized {
    return {
      databaseFormat: this.databaseFormat,
      typeMap: Object.fromEntries(this.typeMap),
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
