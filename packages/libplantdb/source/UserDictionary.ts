import { PlantDBEntity } from "./PlantDBEntity";

export const DictionaryClassifiers = {
  LogEntryEventType: "plantdb.logEntry.type",
} as const;

export type DictionaryClassifier = typeof DictionaryClassifiers[keyof typeof DictionaryClassifiers];

export type UserDictionarySerialized = {
  classifier: DictionaryClassifier;
  dictionary: Record<string, string>;
};

export class UserDictionary<TResult extends string = string> extends PlantDBEntity {
  #dictionary: Map<string, TResult>;
  #classifier: DictionaryClassifier;

  get classifier() {
    return this.#classifier;
  }

  constructor(classifier: DictionaryClassifier, initializer: Record<string, TResult>) {
    super();

    this.#classifier = classifier;
    this.#dictionary = new Map(Object.entries(initializer));
  }

  translateUserTerm(term: string): TResult | undefined {
    if (!this.#dictionary.has(term)) {
      return undefined;
    }

    return this.#dictionary.get(term);
  }

  asMap(): Map<string, TResult> {
    return this.#dictionary;
  }

  asRecord(): Record<string, TResult> {
    return Object.fromEntries(this.#dictionary.entries());
  }

  /**
   * Constructs a `UserDictionary` from a plain hash with initialization values.
   *
   * @param dataObject The hash containing the initialization values for the `UserDictionary`.
   * @returns The constructed `UserDictionary`.
   */
  static fromJSObject(dataObject: UserDictionarySerialized) {
    const userDictionary = new UserDictionary(dataObject.classifier, dataObject.dictionary);

    return userDictionary;
  }

  /**
   * Parse a JSON object and construct a new `UserDictionary` from it.
   *
   * @param data The JSON-serialized user dictionary.
   * @returns The new `UserDictionary`.
   */
  static fromJSON(data: UserDictionarySerialized) {
    return UserDictionary.fromJSObject(data);
  }

  /**
   * Parse a JSON string and construct a new `UserDictionary` from it.
   *
   * @param dataString The JSON-serialized user dictionary as a string.
   * @returns The new `UserDictionary`.
   */
  static fromJSONString(dataString: string) {
    return UserDictionary.fromJSON(JSON.parse(dataString) as UserDictionarySerialized);
  }

  /**
   * Serialize this user dictionary into a plain JS hash.
   *
   * @returns A simple hash with all of this user dictionary's properties.
   */
  toJSObject(): UserDictionarySerialized {
    return {
      classifier: this.#classifier,
      dictionary: this.asRecord(),
    };
  }

  /** @inheritDoc */
  override toJSON() {
    return this.toJSObject();
  }
}
