import { DatabaseFormat } from "@plantdb/libplantdb";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox.js";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import { css, html, LitElement } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("pn-db-config")
export class DbConfig extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }
    `,
  ];

  @property()
  columnSeparator = ",";

  @property()
  dateFormat = "yyyy-MM-dd HH:mm";

  @property()
  decimalSeparator = ".";

  @property({ type: Boolean })
  hasHeaderRow = true;

  @property()
  timezone = "utc";

  toPlantDbConfig() {
    return DatabaseFormat.fromJSObject({
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      decimalSeparator: this.decimalSeparator,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
    });
  }

  render() {
    const dateFormats = [
      "yyyy-MM-dd HH:mm",
      "dd.MM.yyyy HH:mm",
      "dd/MM/yyyy HH:mm",
      "MM/dd/yyyy hh:mm a",
    ];
    const dateFormatsSeconds = [
      "yyyy-MM-dd HH:mm:ss",
      "dd.MM.yyyy HH:mm:ss",
      "dd/MM/yyyy HH:mm:ss",
      "MM/dd/yyyy hh:mm:ss a",
    ];
    const now = new Date();

    return [
      html`<sl-checkbox
          id="has-header-row"
          ?checked=${this.hasHeaderRow}
          @sl-change=${(event: MouseEvent) => {
            this.hasHeaderRow = (event.target as SlCheckbox).checked;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) }),
            );
          }}
          >${t("dbConfig.hasHeaderRow")}</sl-checkbox
        >

        <sl-select
          id="column-separator"
          label=${t("dbConfig.columnSeparator")}
          value=${this.columnSeparator}
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.columnSeparator = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) }),
            );
          }}
        >
          <sl-option value=",">${t("dbConfig.comma")}</sl-option>
          <sl-option value=";">${t("dbConfig.semicolon")}</sl-option>
          <sl-option value="&#9;">${t("dbConfig.tab")}</sl-option></sl-select
        >

        <sl-select
          id="decimal-separator"
          label=${t("dbConfig.decimalSeparator")}
          value=${this.decimalSeparator}
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.decimalSeparator = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) }),
            );
          }}
        >
          <sl-option value=",">${t("dbConfig.comma")}</sl-option>
          <sl-option value=".">${t("dbConfig.period")}</sl-option>
        </sl-select>

        <sl-select
          id="date-format"
          label=${t("dbConfig.dateTimeFormat")}
          value="${this.dateFormat}"
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.dateFormat = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) }),
            );
          }}
        >
          <small>${t("dbConfig.withoutSeconds")}</small>
          ${dateFormats.map(
            dateFormat =>
              html`<sl-option value=${dateFormat}
                >${dateFormat}<small slot="suffix"
                  >${DateTime.fromJSDate(now).toFormat(dateFormat)}</small
                ></sl-option
              >`,
          )}
          <sl-divider></sl-divider
          ><small>${t("dbConfig.withSeconds")}</small>${dateFormatsSeconds.map(
            dateFormat =>
              html`<sl-option value=${dateFormat}
                >${dateFormat}<small slot="suffix"
                  >${DateTime.fromJSDate(now).toFormat(dateFormat)}</small
                ></sl-option
              >`,
          )}</sl-select
        >

        <sl-select
          id="timezone"
          label=${t("dbConfig.timezone")}
          value="${this.timezone}"
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.timezone = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) }),
            );
          }}
        >
          <sl-option value="Asia/Jerusalem">Asia/Jerusalem</sl-option>
          <sl-option value="Europe/Berlin">Europe/Berlin</sl-option>
          <sl-option value="utc">UTC</sl-option>
        </sl-select>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-db-config": DbConfig;
  }
}
