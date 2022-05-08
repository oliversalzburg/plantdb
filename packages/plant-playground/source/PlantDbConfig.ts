import { DatabaseFormat } from "@plantdb/libplantdb";
import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
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
  columnSeparator = "\t";

  @property()
  dateFormat = "yyyy-MM-dd hh:mm:ss";

  @property({ type: Boolean })
  hasHeaderRow = false;

  @property()
  timezone = "utc";

  toPlantDbConfig() {
    return DatabaseFormat.fromJSON({
      columnSeparator: this.columnSeparator,
      dateFormat: this.dateFormat,
      hasHeaderRow: this.hasHeaderRow,
      timezone: this.timezone,
    });
  }

  render() {
    return html`<fieldset id="db-configuration">
      <legend>Database Configuration</legend>
      <sl-checkbox
        id="has-header-row"
        ?checked=${this.hasHeaderRow}
        @sl-change="${(event: MouseEvent) => {
          this.hasHeaderRow = (event.target as SlCheckbox).checked;
          this.dispatchEvent(
            new CustomEvent("config-changed", { detail: DatabaseFormat.fromJSON(this) })
          );
        }}"
        >Has header row?</sl-checkbox
      >

      <sl-select
        id="column-separator"
        label="Column separator"
        value=${this.columnSeparator}
        @sl-change="${(event: MouseEvent) => {
          this.columnSeparator = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("config-changed", { detail: DatabaseFormat.fromJSON(this) })
          );
        }}"
      >
        <sl-menu-item value="&#9;">Tab</sl-menu-item>
      </sl-select>

      <sl-select
        id="date-format"
        label="Timestamp format"
        value="${this.dateFormat}"
        @sl-change="${(event: MouseEvent) => {
          this.dateFormat = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("config-changed", { detail: DatabaseFormat.fromJSON(this) })
          );
        }}"
      >
        <sl-menu-item value="dd/MM/yyyy HH:mm">dd/MM/yyyy HH:mm</sl-menu-item>
      </sl-select>

      <sl-select
        id="timezone"
        label="Timezone"
        value="${this.timezone}"
        @sl-change="${(event: MouseEvent) => {
          this.timezone = (event.target as SlSelect).value as string;
          this.dispatchEvent(
            new CustomEvent("config-changed", { detail: DatabaseFormat.fromJSON(this) })
          );
        }}"
      >
        <sl-menu-item value="Europe/Berlin">Europe/Berlin</sl-menu-item>
      </sl-select>
    </fieldset>`;
  }
}
