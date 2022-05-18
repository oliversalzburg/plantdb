import { SlDialog } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { isNil } from "../Maybe";
import { PlantLogEntryForm } from "../PlantLogEntryForm";
import { View } from "./View";

@customElement("plant-log-view")
export class PlantLogView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
      }

      .empty {
        flex: 1;
      }

      #new-entry-dialog {
        --width: 80vw;
      }
    `,
  ];

  @query("#new-entry-dialog")
  private _newEntryDialog: SlDialog | null | undefined;

  @query("#entry-form")
  private _entryForm: PlantLogEntryForm | null | undefined;

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    return [
      0 < (this.plantStore?.plantDb.log.length ?? 0)
        ? [
            html`<sl-dialog id="new-entry-dialog" label=${t("log.add")}
              >
                <plant-log-entry-form id="entry-form"
                  .plantStore=${this.plantStore}
                  .plantStoreUi=${this.plantStoreUi}
                ></plant-log-entry-form>
              </form>
              <sl-button
                slot="footer"
                variant="primary"
                @click=${() => {
                  this._entryForm?.reportValidity();
                  const newEntry = this._entryForm?.asLogEntry();
                  console.debug(newEntry);
                  this.dispatchEvent(new CustomEvent("plant-new-entry"));
                }}
                >${t("save", { ns: "common" })}</sl-button
              ><sl-button slot="footer" @click=${() => this._newEntryDialog?.hide()}
                >${t("close", { ns: "common" })}</sl-button
              >
            </sl-dialog>`,
            html`<plant-log
                .plantStore=${this.plantStore}
                .plantStoreUi=${this.plantStoreUi}
                .log=${this.plantStore.plantDb.log}
              ></plant-log>
              <section class="footer">
                <sl-button variant="primary" @click=${() => this._newEntryDialog?.show()}
                  >${t("log.add")}</sl-button
                >
              </section>`,
          ]
        : html`<plant-empty-state class="empty"
            ><p>${t("empty.log")}</p>

            <sl-button href="import" variant="primary"
              >${t("empty.importNow")}</sl-button
            ></plant-empty-state
          >`,
    ];
  }
}
