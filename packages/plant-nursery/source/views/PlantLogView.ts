import { t } from "i18next";
import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { LogEntry } from "packages/libplantdb/typings";
import { assertExists, isNil, mustExist } from "../tools/Maybe";
import { View } from "./View";

@customElement("pn-plant-log-view")
export class PlantLogView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      @media (min-width: 1000px) {
        #log {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #log {
          padding: 0 25vw;
        }
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
      }

      .empty {
        flex: 1;
      }

      .or {
        margin: 1rem;
      }
    `,
  ];

  connectedCallback(): void {
    super.connectedCallback();
    mustExist(this.plantStore).addEventListener("pn-config-changed", () => this.requestUpdate());
  }

  async createNewLogEntry() {
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);

    const logEntry = await this.plantStoreUi.showEntryEditor();
    if (!logEntry) {
      return;
    }

    console.debug(logEntry);
    const newDb = this.plantStore.plantDb.withNewLogEntry(logEntry);
    return this.plantStore.updatePlantDb(newDb);
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      0 < (this.plantStore?.plantDb.log.length ?? 0)
        ? [
            html`<pn-plant-log
                id="log"
                .plantStore=${this.plantStore}
                .plantStoreUi=${this.plantStoreUi}
                .log=${this.plantStore.plantDb.log}
                @pn-edit-entry=${(event: CustomEvent<LogEntry>) =>
                  this.plantStoreUi?.editLogEntry(event.detail)}
              ></pn-plant-log>
              <section class="footer">
                <sl-button variant="primary" @click=${() => this.createNewLogEntry()}
                  >${t("log.add")}</sl-button
                >
              </section>`,
          ]
        : html`<pn-empty-state class="empty"
            ><p>${t("empty.log")}</p>

            <sl-button href="import" variant="primary">${t("empty.importNow")}</sl-button>
            <span class="or">${t("empty.or")}</span>
            <sl-button @click=${() => this.createNewLogEntry()}
              >${t("log.add")}</sl-button
            ></pn-empty-state
          >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-log-view": PlantLogView;
  }
}
