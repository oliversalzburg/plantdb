import { DatabaseFormat, LogEntry, Plant } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { installRouter } from "pwa-helpers/router.js";

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

  @state()
  private page = "list";
  private pageParams = new Array<string>();

  firstUpdated() {
    installRouter(location => this.navigate(decodeURIComponent(location.pathname)));

    const storedConfig = localStorage.getItem("plantdb.config");
    if (storedConfig) {
      const storedLog = localStorage.getItem("plantdb.log");
      const storedPlants = localStorage.getItem("plantdb.plants");

      if (storedLog && storedPlants) {
        const config = DatabaseFormat.deserialize(JSON.parse(storedConfig) as DatabaseFormat);
        const logData = JSON.parse(storedLog) as Array<LogEntry>;
        const log = logData.map(logEntry => LogEntry.fromJSON(logEntry));

        const plants = JSON.parse(storedPlants) as Array<Plant>;
        this.plants = plants.map(plant => Plant.fromJSON(plant, log));
      }
    }
  }

  navigateInvoke(path: string) {
    history.pushState(null, "", path);
    return this.navigate(path);
  }

  navigate(path: string) {
    // Extract the page name from path.
    const pathString = path === "/" ? "list" : path.slice(1);

    if (pathString.includes("/")) {
      const pathParts = pathString.split("/");
      return this.loadPage(pathParts[0], pathParts.slice(1));
    }

    // Any other info you might want to extract from the path (like page type),
    // you can do here
    this.loadPage(pathString);

    // Close the drawer - in case the *path* change came from a link in the drawer.
    //dispatch(updateDrawerState(false));
  }

  loadPage(page: string, pageParams = new Array<string>()) {
    switch (page) {
      case "list":
        import("./PlantList.js");
        break;
      case "plant":
        import("./PlantDetails");
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
          <sl-menu-item @click=${() => this.navigateInvoke("/")}>Plant list</sl-menu-item>
          <sl-divider></sl-divider>
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

        <plant-404 class="view" ?active=${this.page === "view404"}></plant-404>
        <plant-import
          class="view"
          ?active=${this.page === "import"}
          .plants="${this.plants}"
        ></plant-import>
        <plant-list
          class="view"
          ?active=${this.page === "list"}
          .plants=${this.plants}
        ></plant-list>
        <plant-details
          class="view"
          ?active=${this.page === "plant"}
          .plant=${this.plants.find(plant => plant.id === this.pageParams[0])}
        ></plant-details>`,
    ];
  }
}
