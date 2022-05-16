import { DatabaseFormat, EventType, PlantDB } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/translations/de.js";
import "@shoelace-style/shoelace/dist/translations/en.js";
import "@shoelace-style/shoelace/dist/translations/fr.js";
import { css, html, LitElement } from "lit";
import { customElement, query } from "lit/decorators.js";
import { Settings } from "luxon";
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
      }

      #view-controls {
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
        padding: 1rem;
      }
      #quick-config {
        display: flex;
        flex-direction: row;
        align-items: center;
      }

      .view-container {
        display: flex;
        flex: 1;
        min-height: 0;
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
    this._plantStore?.addEventListener("plant-config-changed", () => this.requestUpdate());

    this._plantStoreUi?.addEventListener("plant-navigate", (event: Event) => {
      const { page } = (event as CustomEvent<{ page: string; pageParams: Array<string> }>).detail;
      this.handleUserNavigationEvent(page);
    });
    this._plantStoreUi?.addEventListener("plant-drawer-open", () => this.requestUpdate());
    this._plantStoreUi?.addEventListener("plant-theme-changed", () => this.requestUpdate());
    this._plantStoreUi?.addEventListener("plant-i18n-changed", (event: Event) => {
      const activeLocale = (event as CustomEvent<string>).detail;
      document.documentElement.lang = activeLocale;
      Settings.defaultLocale = activeLocale;
      this.requestUpdate();
    });

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
        ></plant-store>`,

      this._plantStoreUi && this._plantStoreUi.i18nReady
        ? html`<div id="view-controls">
              <sl-drawer
                label="PlantDB Playground"
                placement="start"
                class="drawer-placement-start"
                ?open=${this._plantStoreUi?.drawerIsOpen}
                @sl-after-hide=${() => mustExist(this._plantStoreUi).drawerClose()}
              >
                <sl-menu-item @click=${() => this._plantStoreUi?.navigatePath("/")}
                  >Log</sl-menu-item
                >
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

              <div id="quick-config">
                ${this._plantStoreUi?.darkMode
                  ? html`<sl-icon-button
                      name="sun"
                      @click=${() => this._plantStoreUi?.darkModeLeave()}
                    ></sl-icon-button>`
                  : html`<sl-icon-button
                      name="moon"
                      @click=${() => this._plantStoreUi?.darkModeEnter()}
                    ></sl-icon-button>`}

                <sl-dropdown>
                  <sl-button slot="trigger" caret><sl-icon name="globe2"></sl-icon></sl-button>
                  <sl-menu>
                    <sl-menu-item
                      value="de-DE"
                      ?checked=${this._plantStoreUi.locale === "de-DE"}
                      @click=${() => this._plantStoreUi?.changeLocale("de-DE")}
                      >DE</sl-menu-item
                    >
                    <sl-menu-item
                      value="en-US"
                      ?checked=${this._plantStoreUi.locale === "en-US"}
                      @click=${() => this._plantStoreUi?.changeLocale("en-US")}
                      >EN</sl-menu-item
                    >
                    <sl-menu-item
                      value="fr-FR"
                      ?checked=${this._plantStoreUi.locale === "fr-FR"}
                      @click=${() => this._plantStoreUi?.changeLocale("fr-FR")}
                      >FR</sl-menu-item
                    >
                  </sl-menu>
                </sl-dropdown>
              </div>
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
                .plant=${this._plantStore?.plantDb.plants.get(
                  this._plantStoreUi?.pageParams[0] ?? ""
                )}
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
                    PlantDB.fromPlantDB(mustExist(this._plantStore).plantDb, {
                      config: event.detail,
                    })
                  );
                }}
              ></plant-type-map-view>
              <plant-import-view
                class="view"
                ?active=${this._plantStoreUi?.page === "import"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
              ></plant-import-view>
            </div>`
        : undefined,
    ];
  }
}
