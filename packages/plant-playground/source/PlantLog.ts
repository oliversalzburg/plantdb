import { identifyLogType, LogEntry, PlantDB } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PlantLogEntry } from "./PlantLogEntry";
import { retrieveStore } from "./stores/PlantStore";
import { retrieveStoreUi } from "./stores/PlantStoreUi";

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

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [LogEntry] })
  log = this.plantDb.log;

  @property()
  filter = "";

  @property({ type: Boolean, attribute: true, reflect: true })
  headerVisible = true;

  @state()
  private _filterEventTypes = new Array<string>();

  private _filterMatchesLogEntry(logEntry: LogEntry, filter: string) {
    const terms = filter.toLocaleLowerCase().split(" ");
    for (const term of terms) {
      if (!logEntry.indexableText.includes(term)) {
        return false;
      }
    }
    return true;
  }

  render() {
    return [
      html`<div class="filters">
        <sl-input
          placeholder=${t("placeholder.filter")}
          .value=${this.filter}
          @sl-input=${(event: InputEvent) => {
            this.filter = (event.target as SlInput).value;
            retrieveStore()?.searchLog(this.filter);
          }}
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
          >${[...this.plantDb.entryTypes.values()]
            .sort()
            .map(
              entryType =>
                html`<sl-menu-item value="${entryType}"
                  >${entryType}<sl-icon
                    slot="prefix"
                    name="${PlantLogEntry.extractTypeDetails(
                      undefined,
                      identifyLogType(entryType, this.plantDb)
                    ).icon}"
                  ></sl-icon
                ></sl-menu-item>`
            )}</sl-select
        >
      </div>`,
      this.log
        .filter(
          entry =>
            // Filter event type
            (0 === this._filterEventTypes.length || this._filterEventTypes.includes(entry.type)) &&
            // Filter text content
            this._filterMatchesLogEntry(entry, this.filter)
        )
        .reverse()
        .slice(0, 100)
        .map(
          entry =>
            html`<plant-log-entry
              .plantDb=${this.plantDb}
              .plant=${this.plantDb.plants.get(entry.plantId)}
              .logEntry=${entry}
              .headerVisible=${this.headerVisible}
              @click=${() => {
                if (!this.headerVisible) {
                  return;
                }
                retrieveStoreUi()?.navigatePath(`/plant/${entry.plantId}`);
              }}
            ></plant-log-entry>`
        ),
    ];
  }
}
