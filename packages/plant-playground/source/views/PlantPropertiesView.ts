import { Plant } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { mustExist } from "../Maybe";
import { PlantPropertiesForm } from "../PlantPropertiesForm";
import { View } from "./View";

@customElement("plant-properties-view")
export class PlantPropertiesView extends View {
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
  plant: Plant | undefined;

  @query("#form")
  private _form: PlantPropertiesForm | null | undefined;

  save() {
    if (!mustExist(this._form).reportValidity()) {
      return;
    }

    const event = new CustomEvent("plant-properties-saved", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this._form?.asPlant(),
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
    const event = new CustomEvent("plant-properties-cancelled", {
      bubbles: true,
      cancelable: true,
      composed: true,
      detail: this._form?.asPlant(),
    });
    this.dispatchEvent(event);

    if (!event.defaultPrevented) {
      this.plantStoreUi?.navigateTo("log");
    }
  }

  render() {
    return [
      html`<plant-properties-form
          id="form"
          .plantStore=${this.plantStore}
          .plantStoreUi=${this.plantStoreUi}
          .plant=${this.plant}
        ></plant-properties-form>
        <section class="footer">
          <sl-button variant="primary" @click=${() => this.save()}
            >${t("save", { ns: "common" })}</sl-button
          ><sl-button @click=${() => this.cancel()}>${t("cancel", { ns: "common" })}</sl-button>
        </section>`,
    ];
  }
}
