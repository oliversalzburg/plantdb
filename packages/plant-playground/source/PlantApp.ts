import { DatabaseFormat, EventType, Plant, PlantDB } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { installRouter } from "pwa-helpers/router.js";
import { mustExist } from "./Maybe";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

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

  @property()
  plants = new Array<Plant>();

  //@state()
  //private _plantStoreUi= new PlantStoreUi();
  @query("#plant-store-ui")
  private _plantStoreUi: PlantStoreUi | null | undefined;
  @query("#plant-store")
  private _plantStore: PlantStore | null | undefined;

  @state()
  private page = "list";
  private pageParams = new Array<string>();

  firstUpdated() {
    installRouter(location => this.navigate(decodeURIComponent(location.pathname)));
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
        import("./views/PlantTypeMapView");
        break;
      case "import":
        import("./views/PlantImportView");
        break;
      default:
        page = "view404";
        import("./views/Plant404View");
    }

    this.page = page;
    this.pageParams = pageParams;
  }

  render() {
    return [
      html`<plant-store-ui id="plant-store-ui"></plant-store-ui
        ><plant-store
          id="plant-store"
          @config-changed=${() =>
            (this.plants = [...(this._plantStore?.plantDb.plants.values() ?? [])])}
        ></plant-store
        ><sl-drawer
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
        ${this._plantStoreUi?.darkMode
          ? html`<sl-icon-button
              name="sun"
              @click=${() => this._plantStoreUi?.darkModeLeave()}
            ></sl-icon-button>`
          : html`<sl-icon-button
              name="moon"
              @click=${() => this._plantStoreUi?.darkModeEnter()}
            ></sl-icon-button>`}

        <plant-404-view class="view" ?active=${this.page === "view404"}></plant-404-view>

        <plant-log-view
          class="view"
          ?active=${this.page === "log"}
          .plantDb=${this._plantStore?.plantDb}
        ></plant-log-view>
        <plant-list
          class="view"
          ?active=${this.page === "list"}
          .plants=${this.plants}
          .plantDb=${this._plantStore?.plantDb}
        ></plant-list>
        <plant-details-view
          class="view"
          ?active=${this.page === "plant"}
          .plant=${this.plants.find(plant => plant.id === this.pageParams[0])}
          .plantDb=${this._plantStore?.plantDb}
        ></plant-details-view>

        <plant-type-map-view
          class="view"
          ?active=${this.page === "types"}
          .plantDb=${this._plantStore?.plantDb}
          .proposedMapping=${new Map(
            [...(this._plantStore?.plantDb?.entryTypes.values() ?? [])]
              .map(entryType =>
                this._plantStore?.plantDb.config.typeMap.has(entryType)
                  ? [entryType, this._plantStore.plantDb.config.typeMap.get(entryType)]
                  : undefined
              )
              .filter(Boolean) as Array<[string, EventType]>
          )}
          @config-changed=${(event: CustomEvent<DatabaseFormat>) => {
            this._plantStore?.updatePlantDb(
              PlantDB.fromPlantDB(mustExist(this._plantStore).plantDb, { config: event.detail })
            );
          }}
        ></plant-type-map-view>
        <plant-import-view
          class="view"
          ?active=${this.page === "import"}
          .plants="${this.plants}"
        ></plant-import-view>`,
    ];
  }
}
