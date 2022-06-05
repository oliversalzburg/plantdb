import { SlDialog } from "@shoelace-style/shoelace";
import { css, html, LitElement } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { mustExist } from "./Maybe";

@customElement("plant-confirm-dialog")
export class PlantConfirmDialog extends LitElement {
  static readonly styles = [
    css`
      .empty {
        flex: 1;
      }
    `,
  ];

  @property()
  message = "Are you sure?";

  @property()
  labelConfirm = "Confirm";
  @property()
  labelCancel = "Cancel";

  @query("#confirm")
  private _confirmDialog: SlDialog | null | undefined;
  private _resolver: ((result: boolean) => void) | undefined;

  show(message = this.message) {
    this.message = message;
    document.body.appendChild(this);
    return new Promise((resolve, reject) => {
      this._resolver = resolve;
      this._confirmDialog?.show().catch(reject);
    });
  }

  async hide(wasConfirmed = false) {
    await this._confirmDialog?.hide();
    this.parentElement?.removeChild(this);
    mustExist(this._resolver)(wasConfirmed);
  }

  render() {
    return [
      html`<sl-dialog
        open
        id="confirm"
        @sl-request-close=${(event: CustomEvent<{ source: string }>) => {
          if (event.detail.source === "overlay") {
            event.preventDefault();
          }
        }}
        >${this.message}<sl-button slot="footer" variant="primary" @click=${() => this.hide(true)}
          >${this.labelConfirm}</sl-button
        ><sl-button slot="footer" variant="default" @click=${() => this.hide(false)}
          >${this.labelCancel}</sl-button
        ></sl-dialog
      >`,
    ];
  }
}
