import { EventType, EventTypes, PlantDB } from "@plantdb/libplantdb";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-type-map")
export class PlantTypeMap extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }

      .type-list {
        padding: 0;
        list-style: none;
      }

      .type-list li {
        display: flex;
        flex-direction: row;
        align-items: center;
        margin-bottom: 1rem;
      }

      .type-list li > * {
        flex: 1;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: Map })
  proposedMapping = new Map<string, EventType>();

  render() {
    return [
      html`<h2>Type mapping</h2>
        <p>
          On the left, you see the event types that you have used in your input data. Assign the
          PlantDB type identifiers on the right to make your events recognizable in the app.
        </p>
        <ul class="type-list">
          ${[...this.plantDb.entryTypes.values()].sort().map(
            entryType =>
              html`<li>
                <span>${entryType}</span><span>→</span>
                <sl-select
                  placeholder="Unmapped event type"
                  value=${this.plantDb.config.typeMap.get(entryType)}
                  clearable
                  @sl-change=${(event: Event) => {
                    const value = (event.target as SlSelect).value;
                    if (value === "") {
                      this.proposedMapping.delete(entryType);
                      return;
                    }
                    this.proposedMapping.set(entryType, value as EventType);
                  }}
                  >${EventTypes.map(
                    type => html`<sl-menu-item .value="${type}">${type}</sl-menu-item>`
                  )}</sl-select
                >
              </li>`
          )}
        </ul>
        <sl-button
          variant="primary"
          @click=${() => {
            this.dispatchEvent(
              new CustomEvent("config-changed", {
                detail: this.plantDb.config.withNewTypeMap(this.proposedMapping),
              })
            );
          }}
          >Save mapping</sl-button
        >`,
    ];
  }
}
