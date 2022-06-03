import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { LogEntry } from "packages/libplantdb/typings";
import { assertExists } from "../Maybe";
import { PlantLogEntryForm } from "../PlantLogEntryForm";
import { View } from "./View";

@customElement("plant-log-entry-view")
export class PlantLogEntryView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      #form {
        padding: 0 5vw;
      }

      @media (min-width: 1000px) {
        #form {
          padding: 0 15vw;
        }
      }
      @media (min-width: 2000px) {
        #form {
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

  @query("#form")
  private _form: PlantLogEntryForm | null | undefined;

  save() {
    assertExists(this._form);

    // Check if the user wants to delete.
    if (!this._form.shouldDelete()) {
      // If they don't, then the form needs to be valid to proceed.
      if (!this._form.reportValidity()) {
        return;
      }
    }

    const event = new CustomEvent("plant-log-entry-saved", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this._form?.asLogEntry(),
    });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.plantStoreUi?.navigateTo("log");
    }
  }

  cancel() {
    const event = new CustomEvent("plant-log-entry-cancelled", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this._form?.asLogEntry(),
    });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.plantStoreUi?.navigateTo("log");
    }
  }

  render() {
    return [
      html`<plant-log-entry-form
          id="form"
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
