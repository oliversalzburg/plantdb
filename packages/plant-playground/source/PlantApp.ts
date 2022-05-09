import {
  DatabaseFormat,
  DatabaseFormatSerialized,
  EventType,
  LogEntry,
  LogEntrySerialized,
  Plant,
  PlantDB,
  PlantSerialized,
} from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { installRouter } from "pwa-helpers/router.js";
import { DarkModeController } from "./DarkModeController";
import { PlantDbStorage } from "./PlantDbStorage";

@customElement("plant-app")
export class PlantApp extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }

      .view {
        display: none;
      }

      .view[active] {
        display: block;
      }
    `,
  ];

  @property({ type: Boolean })
  drawerOpen = false;

  @property({ type: Boolean })
  darkMode = false;
  private darkModeController = new DarkModeController();

  @property()
  plants = new Array<Plant>();

  plantDb = PlantDB.Empty();

  @state()
  private page = "list";
  private pageParams = new Array<string>();

  firstUpdated() {
    installRouter(location => this.navigate(decodeURIComponent(location.pathname)));

    this.darkModeController.install();

    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      const storedLog = localStorage.getItem("plantdb.log");
      const storedPlants = localStorage.getItem("plantdb.plants");

      if (storedLog && storedPlants) {
        const config = DatabaseFormat.fromJSON(
          JSON.parse(storedConfig) as DatabaseFormatSerialized
        );
        const logData = JSON.parse(storedLog) as Array<LogEntrySerialized>;
        const log = logData.map(logEntry => LogEntry.fromJSON(logEntry));

        const plants = JSON.parse(storedPlants) as Array<PlantSerialized>;
        this.plants = plants.map(plant => Plant.fromJSON(plant, log));
        this.plantDb = PlantDB.fromJSON(config, plants, logData);
      }
    }
  }

  navigateInvoke(path: string) {
    history.pushState(null, "", path);
    return this.navigate(path);
  }

  navigate(path: string) {
    // Extract the page name from path.
    const pathString = path === "/" ? "log" : path.slice(1);

    if (pathString.includes("/")) {
      const pathParts = pathString.split("/");
      return this.loadPage(pathParts[0], pathParts.slice(1));
    }

    // Any other info you might want to extract from the path (like page type),
    // you can do here
    this.loadPage(pathString);

    // Close the drawer - in case the *path* change came from a link in the drawer.
    //dispatch(updateDrawerState(false));
    this.drawerOpen = false;
  }

  loadPage(page: string, pageParams = new Array<string>()) {
    switch (page) {
      case "log":
        import("./views/PlantLogView");
        break;
      case "list":
        import("./PlantList");
        break;
      case "plant":
        import("./views/PlantDetailsView");
        break;
      case "types":
        import("./PlantTypeMap");
        break;
      case "import":
        import("./PlantImport");
        break;
      default:
        page = "view404";
        import("./Plant404");
    }

    this.page = page;
    this.pageParams = pageParams;
  }

  render() {
    return [
      html`<sl-drawer
          label="Plant App"
          placement="start"
          class="drawer-placement-start"
          ?open=${this.drawerOpen}
          @sl-after-hide=${() => (this.drawerOpen = false)}
        >
          <sl-menu-item @click=${() => this.navigateInvoke("/")}>Log</sl-menu-item>
          <sl-menu-item @click=${() => this.navigateInvoke("/list")}>Plants</sl-menu-item>
          <sl-divider></sl-divider>
          <sl-menu-item @click=${() => this.navigateInvoke("/types")}>Type mappings</sl-menu-item>
          <sl-menu-item @click=${() => this.navigateInvoke("/import")}>Import</sl-menu-item>
          <sl-button
            slot="footer"
            variant="primary"
            @click=${() => {
              this.drawerOpen = false;
            }}
            >Close</sl-button
          >
        </sl-drawer>
        <sl-icon-button
          name="list"
          label="Drawer"
          @click=${() => {
            this.drawerOpen = true;
          }}
        ></sl-icon-button>
        ${this.darkModeController.darkMode
          ? html`<sl-icon-button
              name="sun"
              @click=${() => this.darkModeController.darkModeLeave()}
            ></sl-icon-button>`
          : html`<sl-icon-button
              name="moon"
              @click=${() => this.darkModeController.darkModeEnter()}
            ></sl-icon-button>`}

        <plant-404 class="view" ?active=${this.page === "view404"}></plant-404>
        <plant-type-map
          class="view"
          ?active=${this.page === "types"}
          .plantDb=${this.plantDb}
          .proposedMapping=${new Map(
            [...this.plantDb.entryTypes.values()]
              .map(entryType =>
                this.plantDb.config.typeMap.has(entryType)
                  ? [entryType, this.plantDb.config.typeMap.get(entryType)]
                  : undefined
              )
              .filter(Boolean) as Array<[string, EventType]>
          )}
          @config-changed=${(event: CustomEvent<DatabaseFormat>) => {
            this.plantDb = PlantDB.fromPlantDB(this.plantDb, { config: event.detail });
            PlantDbStorage.persistPlantDb(this.plantDb);
          }}
        ></plant-type-map>
        <plant-import
          class="view"
          ?active=${this.page === "import"}
          .plants="${this.plants}"
        ></plant-import>
        <plant-log-view
          class="view"
          ?active=${this.page === "log"}
          .plantDb=${this.plantDb}
        ></plant-log-view>
        <plant-list
          class="view"
          ?active=${this.page === "list"}
          .plants=${this.plants}
          .plantDb=${this.plantDb}
        ></plant-list>
        <plant-details-view
          class="view"
          ?active=${this.page === "plant"}
          .plant=${this.plants.find(plant => plant.id === this.pageParams[0])}
          .plantDb=${this.plantDb}
        ></plant-details-view>`,
    ];
  }
}
