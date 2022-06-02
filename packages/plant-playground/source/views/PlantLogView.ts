import { t } from "i18next";
import { css, html } from "lit";
import { customElement } from "lit/decorators.js";
import { LogEntry } from "packages/libplantdb/typings";
import { assertExists, isNil, mustExist } from "../Maybe";
import { View } from "./View";

@customElement("plant-log-view")
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
    mustExist(this.plantStore).addEventListener("plant-config-changed", () => this.requestUpdate());
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
    this.plantStore.updatePlantDb(newDb);
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      0 < (this.plantStore?.plantDb.log.length ?? 0)
        ? [
            html`<plant-log
                id="log"
                .plantStore=${this.plantStore}
                .plantStoreUi=${this.plantStoreUi}
                .log=${this.plantStore.plantDb.log}
                @plant-edit-entry=${(event: CustomEvent<LogEntry>) =>
                  this.plantStoreUi?.editLogEntry(event.detail)}
              ></plant-log>
              <section class="footer">
                <sl-button variant="primary" @click=${() => this.createNewLogEntry()}
                  >${t("log.add")}</sl-button
                >
              </section>`,
          ]
        : html`<plant-empty-state class="empty"
            ><p>${t("empty.log")}</p>

            <sl-button href="import" variant="primary">${t("empty.importNow")}</sl-button>
            <span class="or">${t("empty.or")}</span>
            <sl-button @click=${() => this.createNewLogEntry()}
              >${t("log.add")}</sl-button
            ></plant-empty-state
          >`,
    ];
  }
}
