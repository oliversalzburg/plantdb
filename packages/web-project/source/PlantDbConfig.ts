import SlCheckbox from "@shoelace-style/shoelace/dist/components/checkbox/checkbox";
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
  plantData = "";

  @property()
  plantLogData = "";

  @property()
  columnSeparator = "\t";

  @property()
  dateFormat = "yyyy-MM-dd hh:mm:ss";

  @property({ type: Boolean })
  hasHeaderRow = false;

  @property()
  timezone = "utc";

  render() {
    return html`<form id="plant-db-input">
      <fieldset class="import-container">
        <legend>Import Data</legend>
        <sl-textarea
          id="plant-data"
          rows="10"
          placeholder="paste plants.csv here"
          label="Plant data"
          .value="${this.plantData}"
        ></sl-textarea>

        <sl-textarea
          id="log-data"
          rows="10"
          placeholder="paste plantlog.csv here"
          label="Plant log"
          .value="${this.plantLogData}"
        ></sl-textarea>
      </fieldset>

      <fieldset id="db-configuration">
        <legend>Database Configuration</legend>
        <sl-checkbox
          id="has-header-row"
          .checked="${this.hasHeaderRow}"
          @click="${(event: MouseEvent) =>
            (this.hasHeaderRow = (event.target as SlCheckbox).checked)}"
          >Has header row?</sl-checkbox
        >

        <sl-select id="column-separator" label="Column separator" value="${this.columnSeparator}">
          <sl-menu-item value="&#9;">Tab</sl-menu-item>
        </sl-select>

        <sl-select id="date-format" label="Timestamp format" value="${this.dateFormat}">
          <sl-menu-item value="dd/MM/yyyy HH:mm">dd/MM/yyyy HH:mm</sl-menu-item>
        </sl-select>

        <sl-select id="timezone" label="Timezone" value="${this.timezone}">
          <sl-menu-item value="Europe/Berlin">Europe/Berlin</sl-menu-item>
        </sl-select>
      </fieldset>
    </form>`;
  }
}
