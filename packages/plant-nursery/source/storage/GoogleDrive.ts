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
  UserDictionarySerialized,
} from "@plantdb/libplantdb";
import { isNil, mustExist } from "../tools/Maybe";
import { NurseryConfiguration, StorageDriver } from "./StorageDriver";

export class GoogleDrive implements StorageDriver {
  private static _googleDriveConnected = false;

  async prepare() {
    return Promise.all([this._loadGoogleIdentityServices(), this._loadGoogleApi()]);
  }

  async connect() {
    return this._connectGoogleDrive();
  }

  get connected() {
    return GoogleDrive._googleDriveConnected;
  }

  async lastModified() {
    const config = await this._readFile("config.json");
    if (config === null) {
      return null;
    }

    return config.modifiedTime;
  }

  async getApplicationConfiguration() {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    const config = await this._readFile("config.json");
    if (isNil(config)) {
      return {
        databaseFormat: DatabaseFormat.DefaultInterchange(),
        typeMap: new UserDictionary<EventType>(DictionaryClassifiers.LogEntryEventType, {}),
      };
    }

    const databaseFormat = DatabaseFormat.fromJSON(config.body);
    return {
      databaseFormat,
      typeMap: (await this.getUserDictionaries()).get(
        DictionaryClassifiers.LogEntryEventType
      ) as UserDictionary<EventType>,
    };
  }

  async getUserDictionaries() {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    const dictionaries = await this.getRawDictionaries();
    if (isNil(dictionaries)) {
      return new Map<DictionaryClassifier, UserDictionary>();
    }

    const userDictionaries = dictionaries.reduce((map, entry) => {
      map.set(
        entry.classifier as DictionaryClassifier,
        new UserDictionary(entry.classifier as DictionaryClassifier, entry.dictionary)
      );
      return map;
    }, new Map<DictionaryClassifier, UserDictionary>());
    return Promise.resolve(userDictionaries);
  }

  async updateApplicationConfiguration(configuration: NurseryConfiguration): Promise<void> {
    const databaseFormat = configuration.databaseFormat.toJSObject();
    const dicts = [configuration.typeMap];

    await this._storeFile("config.json", JSON.stringify(databaseFormat), "application/json");
    await this._storeFile("dicts.json", JSON.stringify(dicts), "application/json");
  }

  async getRawDictionaries() {
    const storedDictionaries = await this._readFile("dicts.json");
    if (isNil(storedDictionaries)) {
      return Promise.resolve(null);
    }
    const dictionaries = JSON.parse(storedDictionaries.body) as Array<UserDictionarySerialized>;
    return Promise.resolve(dictionaries);
  }
  /** @inheritDoc */
  async getRawLog() {
    const dataString = await this._readFile("plantlog.json");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString.body) as Array<LogEntrySerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  async getRawPlants() {
    const dataString = await this._readFile("plants.json");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString.body) as Array<PlantSerialized>;
    return Promise.resolve(rawData);
  }
  /** @inheritDoc */
  async getRawTasks() {
    const dataString = await this._readFile("tasks.json");
    if (isNil(dataString)) {
      return Promise.resolve(null);
    }
    const rawData = JSON.parse(dataString.body) as Array<TaskSerialized>;
    return Promise.resolve(rawData);
  }

  async retrievePlantDb() {
    const config = await this.getApplicationConfiguration();
    const dicts = await this.getRawDictionaries();
    const log = await this.getRawLog();
    const plants = await this.getRawPlants();
    const tasks = await this.getRawTasks();

    if (isNil(config) || isNil(dicts) || isNil(log) || isNil(plants) || isNil(tasks)) {
      throw new Error("Incomplete data.");
    }

    return Promise.resolve(PlantDB.fromJSObjects(config.databaseFormat, dicts, plants, log, tasks));
  }

  async persistPlantDb(plantDb: PlantDB) {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    const config = JSON.stringify(plantDb.databaseFormat);
    const dicts = JSON.stringify([...plantDb.dictionaries.values()]);
    const log = JSON.stringify(plantDb.log);
    const plants = JSON.stringify([...plantDb.plants.values()]);
    const tasks = JSON.stringify(plantDb.tasks);

    await this._storeFile("config.json", config, "application/json");
    await this._storeFile("dicts.json", dicts, "application/json");
    await this._storeFile("plantlog.json", log, "application/json");
    await this._storeFile("plants.json", plants, "application/json");
    await this._storeFile("tasks.json", tasks, "application/json");
  }

  private async _readFile(filename: string) {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    console.debug(`Reading '${filename}' from Google Drive...`);

    const listResponse = await gapi.client.drive.files.list({
      q: `name='${filename}'`,
      fields: "files(id, name, modifiedTime)",
      spaces: "appDataFolder",
    });
    if (Array.isArray(listResponse.result.files) && 0 < listResponse.result.files.length) {
      const fileData = await gapi.client.drive.files.get({
        fileId: mustExist(listResponse.result.files[0].id),
        alt: "media",
      });
      return {
        body: fileData.body,
        modifiedTime: new Date(listResponse.result.files[0].modifiedTime ?? ""),
      };
    }
    return null;
  }

  private async _storeFile(filename: string, fileContent: string, mimeType: string) {
    const file = new Blob([fileContent], { type: mimeType });
    const metadata = {
      name: filename,
      mimeType: mimeType,
      parents: ["appDataFolder"],
    };

    const accessToken = gapi.auth.getToken().access_token;
    const form = new FormData();
    form.append("metadata", new Blob([JSON.stringify(metadata)], { type: "application/json" }));
    form.append("file", file);

    console.debug(`Persisting '${filename}' to Google Drive...`);

    return fetch(
      "https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&supportsAllDrives=true",
      {
        method: "POST",
        headers: new Headers({ Authorization: "Bearer " + accessToken }),
        body: form,
      }
    );
  }

  private _tokenClient: google.accounts.oauth2.TokenClient | undefined;
  private async _connectGoogleDrive() {
    if (GoogleDrive._googleDriveConnected) {
      return;
    }

    const CLIENT_ID = "621528596325-b01c3qtllvnrl2gk8hmfctn7s8s7s4q8.apps.googleusercontent.com";
    const API_KEY = "AIzaSyBeBF_z_jai2SzHHaFXEAatLeYReL_OObE";
    const SCOPES = [
      // Full read-write on all data in Drive
      //"https://www.googleapis.com/auth/drive",
      // Access to application-specific data folder.
      "https://www.googleapis.com/auth/drive.appdata",
    ];

    await this._loadGoogleIdentityServices();
    await this._loadGoogleApi();

    await new Promise((resolve, reject) => {
      gapi.load("client", { callback: resolve, onerror: reject });
    });
    await gapi.client.init({
      apiKey: API_KEY,
      discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
    });

    await new Promise((resolve, reject) => {
      if (this._tokenClient) {
        resolve(true);
        return;
      }

      try {
        this._tokenClient = window.google.accounts.oauth2.initTokenClient({
          client_id: CLIENT_ID,
          scope: SCOPES.join(" "),
          prompt: "consent",
          callback: response => {
            if (response.error !== undefined) {
              reject(response);
            }

            GoogleDrive._googleDriveConnected = true;
            resolve(response);
          },
        });

        this._tokenClient.requestAccessToken();
      } catch (error) {
        reject(error);
      }
    });
  }

  private static _scriptGoogleIdentityServices: HTMLScriptElement | undefined;
  private async _loadGoogleIdentityServices(domTarget: HTMLElement = document.body) {
    return new Promise(resolve => {
      if (GoogleDrive._scriptGoogleIdentityServices) {
        resolve(null);
        return;
      }

      GoogleDrive._scriptGoogleIdentityServices = Object.assign(document.createElement("script"), {
        async: true,
        defer: true,
        src: "https://accounts.google.com/gsi/client",
        onload: () => resolve(null),
      });
      domTarget.appendChild(GoogleDrive._scriptGoogleIdentityServices);
    });
  }
  private static _scriptGoogleDriveApi: HTMLScriptElement | undefined;
  private async _loadGoogleApi() {
    return new Promise(resolve => {
      if (GoogleDrive._scriptGoogleDriveApi) {
        resolve(window.gapi);
        return;
      }

      GoogleDrive._scriptGoogleDriveApi = Object.assign(document.createElement("script"), {
        async: true,
        defer: true,
        src: "https://apis.google.com/js/api.js",
        onload: () => resolve(window.gapi),
      });
      document.body.appendChild(GoogleDrive._scriptGoogleDriveApi);
    });
  }
}
