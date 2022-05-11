import { DatabaseFormat, EventType, PlantDB } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { installRouter } from "pwa-helpers/router.js";
import { mustExist } from "./Maybe";
import { Typography } from "./PlantComponentStyles";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-app")
export class PlantApp extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        display: flex;
        flex-direction: column;
        align-items: stretch;
      }

      .view-container {
        display: flex;
        flex: 1;
      }

      .view {
        display: none;
        flex: 1;
      }

      .view[active] {
        display: flex;
      }
    `,
  ];

  @query("#plant-store-ui")
  private _plantStoreUi: PlantStoreUi | null | undefined;
  @query("#plant-store")
  private _plantStore: PlantStore | null | undefined;

  firstUpdated() {
    this._plantStore?.addEventListener("plant-theme-change", () => this.requestUpdate());

    this._plantStoreUi?.addEventListener("plant-navigate", (event: Event) => {
      const { page } = (event as CustomEvent<{ page: string; pageParams: Array<string> }>).detail;
      this.handleUserNavigationEvent(page);
    });
    this._plantStoreUi?.addEventListener("plant-drawer-open", () => this.requestUpdate());
    this._plantStoreUi?.addEventListener("plant-theme-change", () => this.requestUpdate());

    installRouter(location =>
      this._plantStoreUi?.handleUserNavigationEvent(decodeURIComponent(location.pathname))
    );
  }

  /**
   * Invoked when the user clicked on a link.
   * @param page The path of the link the user clicked on.
   */
  handleUserNavigationEvent(page: string) {
    if (!["view404", "log", "list", "plant", "types", "import"].includes(page)) {
      this._plantStoreUi?.navigate("view404");
    }

    this.requestUpdate();
  }

  render() {
    return [
      html`<plant-store-ui id="plant-store-ui"></plant-store-ui
        ><plant-store
          id="plant-store"
          @plant-config-changed=${() => this.requestUpdate()}
        ></plant-store>
        <div class="view-controls">
          <sl-drawer
            label="Plant App"
            placement="start"
            class="drawer-placement-start"
            ?open=${this._plantStoreUi?.drawerIsOpen}
            @sl-after-hide=${() => mustExist(this._plantStoreUi).drawerClose()}
          >
            <sl-menu-item @click=${() => this._plantStoreUi?.navigatePath("/")}>Log</sl-menu-item>
            <sl-menu-item @click=${() => this._plantStoreUi?.navigatePath("/list")}
              >Plants</sl-menu-item
            >
            <sl-divider></sl-divider>
            <sl-menu-item @click=${() => this._plantStoreUi?.navigatePath("/types")}
              >Type mappings</sl-menu-item
            >
            <sl-menu-item @click=${() => this._plantStoreUi?.navigatePath("/import")}
              >Import</sl-menu-item
            >
            <sl-button
              slot="footer"
              variant="primary"
              @click=${() => {
                mustExist(this._plantStoreUi).drawerClose();
              }}
              >Close</sl-button
            >
          </sl-drawer>
          <sl-icon-button
            name="list"
            label="Drawer"
            @click=${() => {
              mustExist(this._plantStoreUi).drawerOpen();
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
        </div>

        <div class="view-container">
          <plant-404-view
            class="view"
            ?active=${this._plantStoreUi?.page === "view404"}
          ></plant-404-view>

          <plant-log-view
            class="view"
            ?active=${this._plantStoreUi?.page === "log"}
            .plantDb=${this._plantStore?.plantDb}
          ></plant-log-view>
          <plant-list-view
            class="view"
            ?active=${this._plantStoreUi?.page === "list"}
            .plants=${[...(this._plantStore?.plantDb.plants.values() ?? [])]}
            .plantDb=${this._plantStore?.plantDb}
          ></plant-list-view>
          <plant-details-view
            class="view"
            ?active=${this._plantStoreUi?.page === "plant"}
            .plant=${this._plantStore?.plantDb.plants.get(this._plantStoreUi?.pageParams[0] ?? "")}
            .plantDb=${this._plantStore?.plantDb}
          ></plant-details-view>

          <plant-type-map-view
            class="view"
            ?active=${this._plantStoreUi?.page === "types"}
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
            @plant-config-changed=${(event: CustomEvent<DatabaseFormat>) => {
              this._plantStore?.updatePlantDb(
                PlantDB.fromPlantDB(mustExist(this._plantStore).plantDb, { config: event.detail })
              );
            }}
          ></plant-type-map-view>
          <plant-import-view
            class="view"
            ?active=${this._plantStoreUi?.page === "import"}
            .plantStore=${this._plantStore}
          ></plant-import-view>
        </div>`,
    ];
  }
}
