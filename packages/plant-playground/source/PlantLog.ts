import { identifyLogType, LogEntry } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { mustExist } from "./Maybe";
import { PlantLogEntry } from "./PlantLogEntry";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi, retrieveStoreUi } from "./stores/PlantStoreUi";

@customElement("plant-log")
export class PlantLog extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
        overflow: auto;
        min-height: 0;
      }
      :host([headervisible]) {
        cursor: pointer;
      }

      .filters {
        margin: 1rem;
        display: flex;
        flex-direction: row;
      }

      .filters sl-input {
        flex: 0.7;
      }
      .filters sl-select {
        flex: 0.3;
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: [LogEntry] })
  log = new Array<LogEntry>();

  @property()
  filter = "";

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

  @state()
  private _filterEventTypes = new Array<string>();

  render() {
    // Initial log is the entire passed log, filtered by event types, in reverse order.
    let filteredLog = this.log
      .filter(
        entry =>
          // Filter event type
          0 === this._filterEventTypes.length || this._filterEventTypes.includes(entry.type)
      )
      .reverse();

    if (this.filter) {
      const index = mustExist(this.plantStore).indexFromLog(this.log);
      const filtered = mustExist(this.plantStore).searchLog(this.filter, index);
      filteredLog = filteredLog.filter(entry => filtered.includes(entry));
    }

    return [
      html`<div class="filters">
        <sl-input
          placeholder=${t("placeholder.filter")}
          .value=${this.filter}
          @sl-input=${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}
        ></sl-input
        ><sl-select
          placeholder=${t("placeholder.eventFilter")}
          multiple
          clearable
          .value=${this._filterEventTypes}
          @sl-change=${(event: Event) => {
            const value = (event.target as SlSelect).value as string[];
            this._filterEventTypes = value;
          }}
          >${[...(this.plantStore?.plantDb.entryTypes.values() ?? [])]
            .sort()
            .map(
              entryType =>
                html`<sl-menu-item value="${entryType}"
                  >${entryType}<sl-icon
                    slot="prefix"
                    name=${PlantLogEntry.extractTypeDetails(
                      undefined,
                      identifyLogType(entryType, mustExist(this.plantStore).plantDb)
                    ).icon}
                  ></sl-icon
                ></sl-menu-item>`
            )}</sl-select
        >
      </div>`,
      filteredLog.slice(0, 100).map(
        entry =>
          html`<plant-log-entry
            .plantDb=${this.plantStore?.plantDb}
            .plant=${this.plantStore?.plantDb.plants.get(entry.plantId)}
            .logEntry=${entry}
            .headerVisible=${this.headerVisible}
            @click=${async () => {
              if (!this.headerVisible) {
                console.debug(`Show entry dialog for entry #${entry.sourceLine ?? ""}`);
                await retrieveStoreUi()?.editLogEntry(mustExist(this.plantStore), entry);
              }
              retrieveStoreUi()?.navigatePath(`/plant/${entry.plantId}`);
            }}
          ></plant-log-entry>`
      ),
    ];
  }
}
