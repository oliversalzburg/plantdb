import { DatabaseFormat, Plant, PlantDB } from "@plantdb/libplantdb";
import { parse } from "csv-parse/browser/esm/sync";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { DateTime } from "luxon";
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

  @property()
  plantData = "";

  @property()
  plantLogData = "";

  @property()
  columnSeparator = "\t";

  @property()
  dateFormat = "yyyy-MM-dd hh:mm:ss";

  @property({ type: Boolean })
  hasHeaderRow = false;

  @property()
  timezone = "utc";

  @property()
  plants = new Array<Plant>();

  @state()
  private page = "list";
  private pageParams = new Array<string>();

  firstUpdated() {
    installRouter(location => this.navigate(decodeURIComponent(location.pathname)));
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
      default:
        page = "view404";
        import("./InvalidRouteView");
    }

    this.page = page;
    this.pageParams = pageParams;
  }

  process(event?: MouseEvent) {
    event?.preventDefault();
    console.info("Processing data...");
    const plantDataRaw = this.plantData;
    const plantLogDataRaw = this.plantLogData;
    const plantDbConfig = DatabaseFormat.deserialize({
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
    } as DatabaseFormat);
    this.processData(plantDataRaw, plantLogDataRaw, plantDbConfig);
  }

  processData(plantDataRaw: string, plantLogDataRaw: string, plantDbConfig: DatabaseFormat) {
    const plantData = parse(plantDataRaw, {
      columns: false,
      delimiter: plantDbConfig.columnSeparator,
      from: plantDbConfig.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;
    const plantLogData = parse(plantLogDataRaw, {
      columns: false,
      delimiter: plantDbConfig.columnSeparator,
      from: plantDbConfig.hasHeaderRow ? 2 : 1,
    }) as Array<Array<string>>;

    const plantDb = PlantDB.deserialize(plantDbConfig, plantData, plantLogData);

    for (const logRecord of plantDb.log) {
      const plant = plantDb.plants.get(logRecord.plantId);
      if (!plant) {
        continue;
      }
      console.info(
        `${plant.name ?? "?"} (${plant.id}) ${DateTime.fromJSDate(
          logRecord.timestamp
        ).toLocaleString(DateTime.DATETIME_SHORT)} ${logRecord.type}`
      );
    }

    console.info(
      `Database has ${plantDb.plants.size} plants and ${plantDb.log.length} log entries with ${plantDb.entryTypes.size} different types.`
    );

    this.plants = [...plantDb.plants.values()];
  }

  render() {
    return [
      html`<details>
          <summary>Configuration</summary>
          <plant-db-config
            .plantData="${this.plantData}"
            .plantLogData="${this.plantLogData}"
            .hasHeaderRow="${this.hasHeaderRow}"
            .columnSeparator="${this.columnSeparator}"
            .dateFormat="${this.dateFormat}"
            .timezone="${this.timezone}"
          ></plant-db-config>
        </details>
        <sl-button id="process" @click="${(event: MouseEvent) => this.process(event)}"
          >Process</sl-button
        >
        <plant-404 class="view" ?active=${this.page === "view404"}></plant-404>
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
