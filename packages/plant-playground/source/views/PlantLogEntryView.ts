import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LogEntry } from "packages/libplantdb/typings";
import { mustExist } from "../Maybe";
import { PlantLogEntryForm } from "../PlantLogEntryForm";
import { View } from "./View";

@customElement("plant-log-entry-view")
export class PlantLogEntryView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      #entry-form {
        padding: 0 5vw;
      }

      @media (min-width: 1000px) {
        #entry-form {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #entry-form {
          padding: 0 25vw;
        }
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        gap: 0.5rem;
        padding: 1rem;
      }
    `,
  ];

  @property()
  logEntry: LogEntry | undefined;

  @query("#entry-form")
  entryForm: PlantLogEntryForm | null | undefined;

  save() {
    if (!mustExist(this.entryForm).reportValidity()) {
      return;
    }

    const event = new CustomEvent("plant-log-entry-saved", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this.entryForm?.asLogEntry(),
    });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.plantStoreUi?.navigateTo("log");
    }
  }

  cancel() {
    /*
    this.plantStoreUi?.alert("Cancelled").catch(console.error);
    history.back();
    */
    const event = new CustomEvent("plant-log-entry-cancelled", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this.entryForm?.asLogEntry(),
    });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.plantStoreUi?.navigateTo("log");
    }
  }

  render() {
    return [
      html`<plant-log-entry-form
          id="entry-form"
          .plantStore=${this.plantStore}
          .plantStoreUi=${this.plantStoreUi}
          .logEntry=${this.logEntry}
        ></plant-log-entry-form>
        <section class="footer">
          <sl-button variant="primary" @click=${() => this.save()}
            >${t("save", { ns: "common" })}</sl-button
          ><sl-button @click=${() => this.cancel()}>${t("cancel", { ns: "common" })}</sl-button>
        </section>`,
    ];
  }
}
