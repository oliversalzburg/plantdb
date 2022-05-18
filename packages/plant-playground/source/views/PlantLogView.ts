import { SlDialog } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, query } from "lit/decorators.js";
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

  render() {
    return [
      0 < (this.plantStore?.plantDb.log.length ?? 0)
        ? [
            html`<sl-dialog id="new-entry-dialog" label="Currently being prototyped"
              ><plant-log-entry-form .plantDb=${this.plantStore?.plantDb}></plant-log-entry-form>
              <sl-button
                slot="footer"
                variant="primary"
                @click=${() => this._newEntryDialog?.hide()}
                >${t("close", { ns: "common" })}</sl-button
              ></sl-dialog
            >`,
            html`<plant-log
                .plantStore=${this.plantStore}
                .plantStoreUi=${this.plantStoreUi}
                .log=${this.plantStore?.plantDb.log}
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
