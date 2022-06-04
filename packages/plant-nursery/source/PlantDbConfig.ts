import { DatabaseFormat } from "@plantdb/libplantdb";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-db-config")
export class PlantDbConfig extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
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
    return html`<h3>${t("dbConfig.title")}</h3>
      <sl-checkbox
        id="has-header-row"
        ?checked=${this.hasHeaderRow}
        @sl-change=${(event: MouseEvent) => {
          this.hasHeaderRow = (event.target as SlCheckbox).checked;
          this.dispatchEvent(
            new CustomEvent("plant-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
          );
        }}
        >${t("dbConfig.hasHeaderRow")}</sl-checkbox
      ><br /><br />

      <sl-select
        id="column-separator"
        label=${t("dbConfig.columnSeparator")}
        value=${this.columnSeparator}
        @sl-change=${(event: MouseEvent) => {
          this.columnSeparator = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("plant-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
          );
        }}
      >
        <sl-menu-item value=",">${t("dbConfig.comma")}</sl-menu-item>
        <sl-menu-item value=";">${t("dbConfig.semicolon")}</sl-menu-item>
        <sl-menu-item value="&#9;">${t("dbConfig.tab")}</sl-menu-item></sl-select
      ><br />

      <sl-select
        id="decimal-separator"
        label=${t("dbConfig.decimalSeparator")}
        value=${this.decimalSeparator}
        @sl-change=${(event: MouseEvent) => {
          this.decimalSeparator = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("plant-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
          );
        }}
      >
        <sl-menu-item value=",">${t("dbConfig.comma")}</sl-menu-item>
        <sl-menu-item value=".">${t("dbConfig.period")}</sl-menu-item> </sl-select
      ><br />

      <sl-select
        id="date-format"
        label=${t("dbConfig.dateTimeFormat")}
        value="${this.dateFormat}"
        @sl-change=${(event: MouseEvent) => {
          this.dateFormat = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("plant-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
          );
        }}
      >
        <sl-menu-label>${t("dbConfig.withoutSeconds")}</sl-menu-label>
        <sl-menu-item value="yyyy-MM-dd HH:mm">yyyy-MM-dd HH:mm</sl-menu-item>
        <sl-menu-item value="dd.MM.yyyy HH:mm">dd.MM.yyyy HH:mm</sl-menu-item>
        <sl-menu-item value="dd/MM/yyyy HH:mm">dd/MM/yyyy HH:mm</sl-menu-item>
        <sl-menu-item value="MM/dd/yyyy hh:mm a">MM/dd/yyyy hh:mm a</sl-menu-item
        ><sl-divider></sl-divider><sl-menu-label>${t("dbConfig.withSeconds")}</sl-menu-label
        ><sl-menu-item value="yyyy-MM-dd HH:mm:ss">yyyy-MM-dd HH:mm:ss</sl-menu-item>
        <sl-menu-item value="dd.MM.yyyy HH:mm:ss">dd.MM.yyyy HH:mm:ss</sl-menu-item>
        <sl-menu-item value="dd/MM/yyyy HH:mm:ss">dd/MM/yyyy HH:mm:ss</sl-menu-item>
        <sl-menu-item value="MM/dd/yyyy hh:mm:ss a">MM/dd/yyyy hh:mm:ss a</sl-menu-item></sl-select
      ><br />

      <sl-select
        id="timezone"
        label=${t("dbConfig.timezone")}
        value="${this.timezone}"
        @sl-change=${(event: MouseEvent) => {
          this.timezone = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("plant-config-changed", { detail: DatabaseFormat.fromJSObject(this) })
          );
        }}
      >
        <sl-menu-item value="Europe/Berlin">Europe/Berlin</sl-menu-item>
        <sl-menu-item value="utc">UTC</sl-menu-item>
      </sl-select>`;
  }
}
