import { DatabaseFormat, LogEntrySerialized, PlantDB, PlantSerialized } from "@plantdb/libplantdb";
import { isNil, mustExist } from "../Maybe";
import { prepareAsyncContext } from "../UiTools";

export class GoogleDrive {
  private static _googleDriveConnected = false;

  get connected() {
    return GoogleDrive._googleDriveConnected;
  }

  async connect() {
    return this._connectGoogleDrive();
  }

  async lastModified() {
    const config = await this._readFile("config.json");
    if (config === null) {
      return null;
    }

    return config.modifiedTime;
  }

  async retrievePlantDb() {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    const config = await this._readFile("config.json");
    const log = await this._readFile("plantlog.csv");
    const plants = await this._readFile("plants.csv");

    if (isNil(config) || isNil(log) || isNil(plants)) {
      return null;
    }

    const databaseFormat = DatabaseFormat.fromJSON(config.body);
    const logData = JSON.parse(log.body) as Array<LogEntrySerialized>;
    const plantData = JSON.parse(plants.body) as Array<PlantSerialized>;
    return PlantDB.fromJSObjects(databaseFormat, plantData, logData);
  }

  async persistPlantDb(plantDb: PlantDB) {
    if (!GoogleDrive._googleDriveConnected) {
      throw new Error("Google Drive is not connected!");
    }

    const config = JSON.stringify(plantDb.config);
    const log = JSON.stringify(plantDb.log);
    const plants = JSON.stringify([...plantDb.plants.values()]);

    await this._storeFile("config.json", config, "application/json");
    await this._storeFile("plantlog.csv", log, "text/csv");
    await this._storeFile("plants.csv", plants, "text/csv");
  }

  private async _readFile(filename: string) {
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
      "https://www.googleapis.com/auth/drive",
      // Access to application-specific data folder.
      "https://www.googleapis.com/auth/drive.appdata",
    ];

    return new Promise<boolean>((resolve, reject) => {
      const init = async () => {
        if (!this._tokenClient) {
          await this._loadGoogleAuthApi();
          this._tokenClient = window.google.accounts.oauth2.initTokenClient({
            client_id: CLIENT_ID,
            scope: SCOPES.join(" "),
            callback: resp => {
              if (resp.error !== undefined) {
                throw resp;
              }

              GoogleDrive._googleDriveConnected = true;
              resolve(true);
            },
          });

          await this._loadGoogleDriveApi();
          const onClientLoaded = async () => {
            await gapi.client.init({
              apiKey: API_KEY,
              discoveryDocs: ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"],
            });

            if (gapi.client.getToken() === null) {
              // Prompt the user to select a Google Account and ask for consent to share their data
              // when establishing a new session.
              mustExist(this._tokenClient).requestAccessToken({ prompt: "consent" });
            } else {
              // Skip display of account chooser and consent dialog for an existing session.
              mustExist(this._tokenClient).requestAccessToken({ prompt: "" });
            }
          };
          gapi.load("client", prepareAsyncContext(onClientLoaded));
        } else {
          resolve(true);
        }
      };

      init().catch(reject);
    });
  }

  private static _scriptGoogleAuthApi: HTMLScriptElement | undefined;
  private async _loadGoogleAuthApi() {
    return new Promise(resolve => {
      if (GoogleDrive._scriptGoogleAuthApi) {
        resolve(null);
        return;
      }

      GoogleDrive._scriptGoogleAuthApi = Object.assign(document.createElement("script"), {
        async: true,
        defer: true,
        src: "https://accounts.google.com/gsi/client",
        onload: () => resolve(null),
      });
      document.body.appendChild(GoogleDrive._scriptGoogleAuthApi);
    });
  }
  private static _scriptGoogleDriveApi: HTMLScriptElement | undefined;
  private async _loadGoogleDriveApi() {
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
