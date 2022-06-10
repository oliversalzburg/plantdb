import { DatabaseFormat } from "@plantdb/libplantdb";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
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
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
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
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
            );
          }}
        >
          <sl-menu-item value=",">${t("dbConfig.comma")}</sl-menu-item>
          <sl-menu-item value=";">${t("dbConfig.semicolon")}</sl-menu-item>
          <sl-menu-item value="&#9;">${t("dbConfig.tab")}</sl-menu-item></sl-select
        >

        <sl-select
          id="decimal-separator"
          label=${t("dbConfig.decimalSeparator")}
          value=${this.decimalSeparator}
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.decimalSeparator = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
            );
          }}
        >
          <sl-menu-item value=",">${t("dbConfig.comma")}</sl-menu-item>
          <sl-menu-item value=".">${t("dbConfig.period")}</sl-menu-item>
        </sl-select>

        <sl-select
          id="date-format"
          label=${t("dbConfig.dateTimeFormat")}
          value="${this.dateFormat}"
          hoist
          @sl-change=${(event: MouseEvent) => {
            this.dateFormat = (event.target as SlSelect).value as string;
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
            );
          }}
        >
          <sl-menu-label>${t("dbConfig.withoutSeconds")}</sl-menu-label>
          ${dateFormats.map(
            dateFormat => html`<sl-menu-item value=${dateFormat}
              >${dateFormat}<small slot="suffix"
                >${DateTime.fromJSDate(now).toFormat(dateFormat)}</small
              ></sl-menu-item
            >`
          )}
          <sl-divider></sl-divider
          ><sl-menu-label>${t("dbConfig.withSeconds")}</sl-menu-label>${dateFormatsSeconds.map(
            dateFormat => html`<sl-menu-item value=${dateFormat}
              >${dateFormat}<small slot="suffix"
                >${DateTime.fromJSDate(now).toFormat(dateFormat)}</small
              ></sl-menu-item
            >`
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
              new CustomEvent("pn-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
            );
          }}
        >
          <sl-menu-item value="Asia/Jerusalem">Asia/Jerusalem</sl-menu-item>
          <sl-menu-item value="Europe/Berlin">Europe/Berlin</sl-menu-item>
          <sl-menu-item value="utc">UTC</sl-menu-item>
        </sl-select>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-db-config": DbConfig;
  }
}
