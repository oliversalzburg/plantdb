import { EventType, EventTypes, PlantDB } from "@plantdb/libplantdb";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select";
import { t } from "i18next";
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
      html`<h2>${t("typeMap.title")}</h2>
        <p>${t("typeMap.introduction")}</p>
        <ul class="type-list">
          ${[...this.plantDb.entryTypes.values()].sort().map(
            entryType =>
              html`<li>
                <span>${entryType}</span><span>→</span>
                <sl-select
                  placeholder=${t("typeMap.unmapped")}
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
                  >${Object.keys(EventTypes)
                    .sort((a, b) => t(`eventType.${a}`).localeCompare(t(`eventType.${b}`)))
                    .map(
                      type =>
                        html`<sl-menu-item .value="${type}"
                          >${t(`eventType.${type}`)}</sl-menu-item
                        >`
                    )}</sl-select
                >
              </li>`
          )}
        </ul>
        <sl-button
          variant="primary"
          @click=${() => {
            this.dispatchEvent(
              new CustomEvent("plant-config-changed", {
                bubbles: true,
                composed: true,
                detail: this.plantDb.config.withNewTypeMap(this.proposedMapping),
              })
            );
          }}
          >${t("typeMap.save")}</sl-button
        >`,
    ];
  }
}
