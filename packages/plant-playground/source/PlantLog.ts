import { LogEntry, PlantDB } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { css, html, LitElement } from "lit";
import { customElement, property, state } from "lit/decorators.js";

@customElement("plant-log")
export class PlantLog extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
      }

      .filters {
        margin: 1rem;
        display: flex;
        flex-direction: row;
      }

      .filters sl-input {
        flex: 1;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [LogEntry] })
  log = this.plantDb.log;

  @property()
  filter = "";

  @property({ type: Boolean })
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
          placeholder="Type filter here"
          .value="${this.filter}"
          @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
        ></sl-input
        ><sl-select
          placeholder="Filter event types"
          multiple
          clearable
          .value=${this._filterEventTypes}
          @sl-change=${(event: Event) => {
            const value = (event.target as SlSelect).value as string[];
            console.debug(value);
            this._filterEventTypes = value;
          }}
          >${[...this.plantDb.entryTypes.values()]
            .sort()
            .map(
              entryType => html`<sl-menu-item value="${entryType}">${entryType}</sl-menu-item>`
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
            ></plant-log-entry>`
        ),
    ];
  }
}
