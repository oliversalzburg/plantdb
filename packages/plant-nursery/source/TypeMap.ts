import {
  DictionaryClassifiers,
  EventType,
  EventTypes,
  PlantDB,
  UserDictionary,
} from "@plantdb/libplantdb";
import SlSelect from "@shoelace-style/shoelace/dist/components/select/select.js";
import { t } from "i18next";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";

@customElement("pn-type-map")
export class TypeMap extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }

      .type-list {
        padding: 0;
        list-style: none;
      }

      .type-list div {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-items: center;
        margin-bottom: 1rem;
      }

      .type-list div * {
        flex: 0.5;
      }
      @media (max-width: 500px) {
        .type-list div * {
          min-width: 100%;
        }
      }
    `,
  ];

  @property({ attribute: false })
  plantDb = PlantDB.Empty();

  @property({ attribute: false })
  proposedMapping = new Map<string, EventType>();

  asUserDictionary() {
    return new UserDictionary(
      DictionaryClassifiers.LogEntryEventType,
      Object.fromEntries(this.proposedMapping.entries()),
    );
  }

  render() {
    return [
      html`<h2>${t("typeMap.title")}</h2>
        <p>${t("typeMap.introduction")}</p>
        <div class="type-list">
          ${[...this.plantDb.entryTypes.values()].sort().map(
            entryType =>
              html`<div>
                <span>${entryType}</span>
                <sl-select
                  placeholder=${t("typeMap.unmapped")}
                  value=${ifDefined(
                    this.plantDb
                      .getDictionary(DictionaryClassifiers.LogEntryEventType)
                      .translateUserTerm(entryType),
                  )}
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
                        html`<sl-option .value="${type}">${t(`eventType.${type}`)}</sl-option>`,
                    )}</sl-select
                >
              </div>`,
          )}
        </div>
        <sl-button
          variant="primary"
          @click=${() => {
            this.dispatchEvent(
              new CustomEvent("pn-config-changed", {
                bubbles: true,
                composed: true,
                detail: this.asUserDictionary(),
              }),
            );
          }}
          >${t("typeMap.save")}</sl-button
        >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-type-map": TypeMap;
  }
}
