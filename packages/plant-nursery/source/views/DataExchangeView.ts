import { unknownToError } from "@oliversalzburg/js-utils/lib/error-serializer";
import { assertExists } from "@oliversalzburg/js-utils/lib/nil";
import {
  DatabaseFormat,
  DatabaseFormatSerialized,
  DictionaryClassifiers,
  logFromCSV,
  makePlantMap,
  PlantDB,
  plantsFromCSV,
} from "@plantdb/libplantdb";
import { t } from "i18next";
import { css } from "lit";
import { property, state } from "lit/decorators.js";
import { DateTime } from "luxon";
import { View } from "./View";

export abstract class DataExchangeView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      @media (min-width: 1000px) {
        #import {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #import {
          padding: 0 25vw;
        }
      }

      :host {
        overflow: auto;
        padding: 1rem;
      }

      #export-section,
      #import-section {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .clipboard {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
      .google-drive {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .google-drive-actions {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        gap: 1rem;
      }
      .google-drive-busy {
        display: none;
      }

      .import.import--google-busy .google-drive-busy {
        display: unset;
      }
      .import.import--google-busy .google-drive-actions {
        display: none;
      }

      .help-text {
        display: none;
      }
      .help-text.data-loaded {
        display: block;
      }
    `,
  ];

  @state()
  protected _googleDriveBusy = false;
  @state()
  protected _googleDriveConnected = false;
  @state()
  protected _googleDriveHasDb = false;
  @state()
  protected _googleDriveDbLastModified: Date | null | undefined = null;
  @state()
  protected _googleDriveHelpText = "";

  @property({ attribute: false })
  config = DatabaseFormat.DefaultInterchange();

  firstUpdated() {
    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      this.config = DatabaseFormat.fromJSON(storedConfig);
    }
  }

  async processImportRequest(plantDataRaw: string, plantLogDataRaw: string) {
    if (!(await this.plantStoreUi?.confirm(t("import.importWarn")))) {
      return;
    }

    console.info("Processing data...");

    assertExists(this.plantStore);

    const plantDbConfig = DatabaseFormat.fromJSObject({
      columnSeparator: this.config.columnSeparator,
      dateFormat: this.config.dateFormat,
      decimalSeparator: this.config.decimalSeparator,
      hasHeaderRow: this.config.hasHeaderRow,
      timezone: this.config.timezone,
      typeMap: this.plantStore.plantDb
        .getDictionary(DictionaryClassifiers.LogEntryEventType)
        .asRecord(),
    } as DatabaseFormatSerialized);

    // Temporary DB to hold constructed data.
    let plantDb = PlantDB.fromJSObjects(plantDbConfig);

    const plants = plantDataRaw
      ? plantsFromCSV(plantDb, plantDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.plants.values()];

    const log = plantLogDataRaw
      ? logFromCSV(plantDb, plantLogDataRaw, plantDbConfig)
      : [...this.plantStore.plantDb.log];

    plantDb = PlantDB.fromPlantDB(plantDb, {
      databaseFormat: plantDbConfig,
      log,
      plants: makePlantMap(plants),
    });

    for (const logRecord of plantDb.log) {
      const plant = plantDb.plants.get(logRecord.plantId);
      if (!plant) {
        continue;
      }
      console.info(
        `${plant.name ?? "?"} (${plant.id}) ${DateTime.fromJSDate(
          logRecord.timestamp,
        ).toLocaleString(DateTime.DATETIME_SHORT)} ${logRecord.type}`,
      );
    }

    console.info(
      `Database has ${plantDb.plants.size} plants and ${plantDb.log.length} log entries with ${plantDb.entryTypes.size} different types.`,
    );

    await this.plantStore.updatePlantDb(plantDb);
    this.plantStoreUi?.navigatePath("/log");
  }

  protected async _connectGoogleDrive() {
    this._googleDriveBusy = true;

    try {
      await this.plantStore?.googleDriveConnect();

      this._googleDriveConnected = true;
      this.plantStoreUi?.alert(t("import.googleDriveConnected")).catch(console.error);

      const lastModified = await this.plantStore?.googleDrive.lastModified();
      this._googleDriveHasDb = lastModified !== null;
      this._googleDriveDbLastModified = lastModified;

      if (this._googleDriveHasDb) {
        this._googleDriveHelpText = `${t("import.googleDriveHasDb")} ${
          this._googleDriveDbLastModified
            ? t("import.googleDriveDbModified", {
                relative: DateTime.fromJSDate(
                  new Date(this._googleDriveDbLastModified),
                ).toRelative(),
                when: DateTime.fromJSDate(new Date(this._googleDriveDbLastModified)).toFormat("f"),
              })
            : ""
        }`;
      }
    } catch (error) {
      console.error(error);
      this.plantStoreUi
        ?.alert(unknownToError(error).message, "danger", "x-circle")
        .catch(console.error);
    } finally {
      this._googleDriveBusy = false;
    }
  }

  protected async _importFromGoogleDrive() {
    if (!(await this.plantStoreUi?.confirm(t("import.importWarn")))) {
      return;
    }

    this._googleDriveBusy = true;

    try {
      this._googleDriveHelpText = "";

      await this.plantStore?.googleDrivePull();

      this._googleDriveDbLastModified = new Date();
      this._googleDriveHelpText = t("import.googleDriveImportedHelp");
      this.plantStoreUi?.alert(t("import.googleDriveImported")).catch(console.error);
      this.requestUpdate();
    } catch (error) {
      console.error(error);
      this.plantStoreUi
        ?.alert("Unable to use Google Drive data!", "danger", "x-circle")
        .catch(console.error);
    } finally {
      this._googleDriveBusy = false;
    }
  }

  protected async _syncToGoogleDrive() {
    if (!(await this.plantStoreUi?.confirm(t("import.googleDriveSyncWarn")))) {
      return;
    }

    this._googleDriveBusy = true;

    try {
      this._googleDriveHelpText = "";

      await this.plantStore?.googleDrivePush();

      this._googleDriveDbLastModified = new Date();
      this._googleDriveHelpText = t("import.googleDriveSynchronizedHelp");
      this.plantStoreUi?.alert(t("import.googleDriveSynchronized")).catch(console.error);
      this.requestUpdate();
    } catch (error) {
      console.error(error);
      this.plantStoreUi
        ?.alert(unknownToError(error).message, "danger", "x-circle")
        .catch(console.error);
    } finally {
      this._googleDriveBusy = false;
    }
  }

  protected _cancelGoogleDrive() {
    this._googleDriveBusy = false;
  }
}
