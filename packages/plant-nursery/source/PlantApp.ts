import { DatabaseFormat, EventType, PlantDB } from "@plantdb/libplantdb";
import { getBasePath } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement } from "lit/decorators.js";
import { installRouter } from "pwa-helpers/router.js";
import { mustExist } from "./Maybe";
import { Typography } from "./PlantComponentStyles";
import { PlantStore } from "./stores/PlantStore";
import { KnownViews, PlantStoreUi } from "./stores/PlantStoreUi";

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

  private _plantStoreUi = new PlantStoreUi();
  private _plantStore = new PlantStore();

  connectedCallback(): void {
    super.connectedCallback();

    this._plantStoreUi.plantStore = this._plantStore;

    this._plantStoreUi.addEventListener("plant-navigate", (event: Event) => {
      const { page, pageParams } = (
        event as CustomEvent<{ page: KnownViews; pageParams: Array<string> }>
      ).detail;
      this.handleUserNavigationEvent(page, pageParams);
    });
    this._plantStoreUi.addEventListener("plant-drawer-open", () => this.requestUpdate());
    this._plantStoreUi.addEventListener("plant-theme-changed", () => this.requestUpdate());
    this._plantStoreUi.addEventListener(
      "plant-i18n-changed",
      // @ts-expect-error wtf?
      () => (window.location = getBasePath())
    );

    // We expect the store to load i18n, then signal ready.
    // Then we install the router and expect it to call back with the inital location.
    // We pass this info to the store and expect it invoke the `plant-navigate` event.
    // Then we are ready to handle the starting location like any later naviation event.
    this._plantStoreUi.addEventListener("plant-i18n-ready", () =>
      installRouter(location =>
        this._plantStoreUi?.handleUserNavigationEvent(decodeURIComponent(location.pathname))
      )
    );

    this._plantStore.addEventListener("plant-config-changed", () => this.requestUpdate());

    this.appendChild(this._plantStore);
    this.appendChild(this._plantStoreUi);
  }

  /**
   * Invoked when the user clicked on a link.
   *
   * @param page The path of the link the user clicked on.
   * @param pageParams The parameters for the page.
   */
  handleUserNavigationEvent(page: KnownViews, pageParams: Array<string>) {
    switch (page) {
      case "log":
        document.title = `${t("menu.log")} - PlantDB Nursery`;
        break;
      case "log-entry":
        document.title = `${t("menu.logEntry")} - PlantDB Nursery`;
        break;
      case "list":
        document.title = `${t("menu.plants")} - PlantDB Nursery`;
        break;
      case "plant":
        document.title = `${pageParams[0]} - PlantDB Nursery`;
        break;
      case "plant-properties":
        document.title = `${pageParams[0]} Properties - PlantDB Nursery`;
        break;
      case "types":
        document.title = `${t("menu.typeMap")} - PlantDB Nursery`;
        break;
      case "import":
        document.title = `${t("menu.import")} - PlantDB Nursery`;
        break;
      case "view404":
        document.title = "404 - PlantDB Nursery";
        break;
      default:
        document.title = "PlantDB Nursery";
        return this._plantStoreUi?.navigate("view404");
    }

    this.requestUpdate();
  }

  render() {
    return [
      this._plantStoreUi.i18nReady
        ? html`<div id="view-controls">
              <sl-drawer
                label="${t("app.title")}"
                placement="start"
                class="drawer-placement-start"
                ?open=${this._plantStoreUi.drawerIsOpen}
                @sl-after-hide=${() => mustExist(this._plantStoreUi).drawerClose()}
              >
                <sl-menu-item @click=${() => this._plantStoreUi.navigatePath("/")}
                  >${t("menu.log")}</sl-menu-item
                >
                <sl-menu-item @click=${() => this._plantStoreUi.navigatePath("/list")}
                  >${t("menu.plants")}</sl-menu-item
                >
                <sl-divider></sl-divider>
                <sl-menu-item @click=${() => this._plantStoreUi.navigatePath("/types")}
                  >${t("menu.typeMap")}</sl-menu-item
                >
                <sl-menu-item @click=${() => this._plantStoreUi.navigatePath("/import")}
                  >${t("menu.import")}</sl-menu-item
                >
                <sl-button
                  slot="footer"
                  variant="primary"
                  @click=${() => {
                    mustExist(this._plantStoreUi).drawerClose();
                  }}
                  >${t("menu.close")}</sl-button
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
                ${this._plantStoreUi.darkMode
                  ? html`<sl-icon-button
                      name="sun"
                      @click=${() => this._plantStoreUi.darkModeLeave()}
                    ></sl-icon-button>`
                  : html`<sl-icon-button
                      name="moon"
                      @click=${() => this._plantStoreUi.darkModeEnter()}
                    ></sl-icon-button>`}

                <sl-dropdown>
                  <sl-button slot="trigger" caret><sl-icon name="globe2"></sl-icon></sl-button>
                  <sl-menu>
                    <sl-menu-item
                      value="de-DE"
                      ?checked=${this._plantStoreUi.locale === "de-DE"}
                      @click=${() => this._plantStoreUi.changeLocale("de-DE")}
                      >DE</sl-menu-item
                    >
                    <sl-menu-item
                      value="en-US"
                      ?checked=${this._plantStoreUi.locale === "en-US"}
                      @click=${() => this._plantStoreUi.changeLocale("en-US")}
                      >EN</sl-menu-item
                    >
                    <sl-menu-item
                      value="he-IL"
                      ?checked=${this._plantStoreUi.locale === "he-IL"}
                      @click=${() => this._plantStoreUi.changeLocale("he-IL")}
                      >HE</sl-menu-item
                    >
                  </sl-menu>
                </sl-dropdown>
              </div>
            </div>

            <div class="view-container">
              <plant-404-view
                class="view"
                ?active=${this._plantStoreUi.page === "view404"}
              ></plant-404-view>

              <plant-log-view
                class="view"
                ?active=${this._plantStoreUi.page === "log"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
              ></plant-log-view>
              <plant-log-entry-view
                class="view"
                ?active=${this._plantStoreUi.page === "log-entry"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
                .logEntry=${this._plantStore.plantDb.log[
                  Number(this._plantStoreUi.pageParams[0] ?? -1)
                ]}
              ></plant-log-entry-view>

              <plant-list-view
                class="view"
                ?active=${this._plantStoreUi.page === "list"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
                .plants=${[...(this._plantStore.plantDb.plants.values() ?? [])]}
              ></plant-list-view>
              <plant-details-view
                class="view"
                ?active=${this._plantStoreUi.page === "plant"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
                .plant=${this._plantStore.plantDb.plants.get(
                  this._plantStoreUi.pageParams[0] ?? ""
                )}
              ></plant-details-view>
              <plant-properties-view
                class="view"
                ?active=${this._plantStoreUi.page === "plant-properties"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
                .plant=${this._plantStore.plantDb.plants.get(
                  this._plantStoreUi.pageParams[0] ?? ""
                )}
              ></plant-properties-view>

              <plant-type-map-view
                class="view"
                ?active=${this._plantStoreUi?.page === "types"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
                .proposedMapping=${new Map(
                  [...(this._plantStore.plantDb.entryTypes.values() ?? [])]
                    .map(entryType =>
                      this._plantStore.plantDb.config.typeMap.has(entryType)
                        ? [entryType, this._plantStore.plantDb.config.typeMap.get(entryType)]
                        : undefined
                    )
                    .filter(Boolean) as Array<[string, EventType]>
                )}
                @plant-config-changed=${(event: CustomEvent<DatabaseFormat>) => {
                  this._plantStoreUi.alert(t("typeMap.updated")).catch(console.error);
                  this._plantStore.updatePlantDb(
                    PlantDB.fromPlantDB(this._plantStore.plantDb, {
                      config: event.detail,
                    })
                  );
                  this._plantStoreUi.navigateTo("log");
                }}
              ></plant-type-map-view>
              <plant-import-view
                class="view"
                ?active=${this._plantStoreUi.page === "import"}
                .plantStore=${this._plantStore}
                .plantStoreUi=${this._plantStoreUi}
              ></plant-import-view>
            </div>`
        : undefined,
    ];
  }
}
