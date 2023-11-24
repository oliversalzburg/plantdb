import { mustExist } from "@oliversalzburg/js-utils/nil.js";
import { identifyLogType, LogEntry } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { Forms } from "./ComponentStyles";
import { PlantLogEntry } from "./PlantLogEntry";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("pn-plant-log")
export class PlantLog extends LitElement {
  static readonly styles = [
    Forms,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .filter {
        display: flex;
        flex-direction: row;
        padding: 1rem;
        flex-wrap: wrap;
        gap: 0.25rem 0;
      }

      .filter * {
        flex: 1;
      }

      @media (min-width: 500px) {
        .filters sl-input {
          flex: 0.7;
        }
        .filters sl-select {
          flex: 0.3;
        }
      }

      #entries {
        display: flex;
        flex-direction: column;
        overflow: auto;
        min-height: 0;
        gap: 1rem;
        padding: 1rem;
      }

      #entries sl-button {
        margin: 1rem;
      }
    `,
  ];

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
  log = new Array<LogEntry>();

  @property({ type: Number })
  maxItems = 10;

  @property()
  filter = "";

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

  @state()
  private _filterEventTypes = new Array<string>();

  connectedCallback(): void {
    super.connectedCallback();
    mustExist(this.plantStore).addEventListener("pn-config-changed", () => {
      this.requestUpdate();
    });
  }

  render() {
    // Initial log is the entire passed log, filtered by event types, in reverse order.
    let filteredLog = this.log
      .filter(
        entry =>
          // Filter event type
          0 === this._filterEventTypes.length || this._filterEventTypes.includes(entry.type),
      )
      .reverse();

    if (this.filter) {
      const index = mustExist(this.plantStore).indexFromLog(this.log);
      const filtered = mustExist(this.plantStore).searchLog(this.filter, index);
      filteredLog = filteredLog.filter(entry => filtered.includes(entry));
    }

    return [
      html`<div class="filter">
        <sl-input
          placeholder=${t("log.filterPlaceholder")}
          .value=${this.filter}
          @sl-input=${(event: InputEvent) => {
            this.filter = (event.target as SlInput).value;
            this.maxItems = 10;
          }}
          clearable
        ></sl-input
        ><sl-select
          placeholder=${t("log.filterTypePlaceholder")}
          multiple
          clearable
          .value=${this._filterEventTypes}
          @sl-change=${(event: Event) => {
            const value = (event.target as SlSelect).value as Array<string>;
            this._filterEventTypes = value;
            this.maxItems = 10;
          }}
          >${[...(this.plantStore?.plantDb.entryTypes.values() ?? [])]
            .sort()
            .map(
              entryType =>
                html`<sl-option value="${entryType}"
                  >${entryType}<sl-icon
                    slot="prefix"
                    name=${PlantLogEntry.extractTypeDetails(
                      undefined,
                      identifyLogType(entryType, mustExist(this.plantStore).plantDb),
                    ).icon}
                  ></sl-icon
                ></sl-option>`,
            )}</sl-select
        >
      </div>`,
      html`<div id="entries">
        ${filteredLog.slice(0, this.maxItems).map(
          entry =>
            html`<pn-plant-log-entry
              .plantDb=${this.plantStore?.plantDb}
              .plant=${this.plantStore?.plantDb.plants.get(entry.plantId)}
              .logEntry=${entry}
              .headerVisible=${this.headerVisible}
              @pn-badge-click=${() => {
                this.plantStoreUi?.navigatePath(`/plant/${entry.plantId}`);
              }}
              @pn-body-click=${() => {
                this.dispatchEvent(new CustomEvent<LogEntry>("pn-edit-entry", { detail: entry }));
              }}
            ></pn-plant-log-entry>`,
        )}${this.maxItems < filteredLog.length
          ? html`<sl-button @click=${() => (this.maxItems += 10)}>${t("log.showMore")}</sl-button>`
          : undefined}
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-log": PlantLog;
  }
}
