import { isNil } from "@oliversalzburg/js-utils/nil.js";
import { Plant } from "@plantdb/libplantdb";
import { SlInput } from "@shoelace-style/shoelace";
import { html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { MultiValueEditor } from "./MultiValueEditor.js";
import { PlantStore } from "./stores/PlantStore.js";

@customElement("pn-multi-value-pid-editor")
export class MultiValuePidEditor extends MultiValueEditor {
  static readonly styles = [...MultiValueEditor.styles];

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plants: Array<Plant> | undefined;

  override render() {
    if (isNil(this.plantStore)) {
      return [];
    }

    const foundPlants = [
      ...this.plantStore.searchPlants(
        (Array.isArray(this.value) ? this._nextValue : this.value) ?? "",
      ),
    ];

    return [
      html`<sl-input
          id="input"
          label=${ifDefined(this.label)}
          placeholder=${ifDefined(
            Array.isArray(this.value) ? this.value.sort().join(", ") : this.placeholder,
          )}
          clearable
          value=${ifDefined(Array.isArray(this.value) ? this._nextValue : this.value)}
          @sl-focus=${() => this._dropdown?.show()}
          @sl-input=${(event: InputEvent) => {
            if (Array.isArray(this.value)) {
              this._nextValue = (event.target as SlInput).value;
            } else {
              this.value = (event.target as SlInput).value;
              this.dispatchEvent(
                new CustomEvent("pn-changed", {
                  detail: this.value,
                }),
              );
            }
          }}
          >${Array.isArray(this.value)
            ? html`<sl-icon-button
                name="arrows-collapse"
                slot="suffix"
                ?disabled=${!Array.isArray(this.value) || 1 < this.value.length}
                @click=${() => {
                  if (!Array.isArray(this.value) || 1 < this.value.length) {
                    return;
                  }
                  this.value = this.value[0];
                  this._nextValue = undefined;
                }}
              ></sl-icon-button>`
            : html`<sl-icon-button
                name="arrows-expand"
                slot="suffix"
                ?disabled=${!this.value}
                @click=${() => {
                  if (Array.isArray(this.value) || !this.value) {
                    return;
                  }
                  this.value = [this.value];
                  this._nextValue = undefined;
                }}
              ></sl-icon-button>`}</sl-input
        >${Array.isArray(foundPlants) && foundPlants.length
          ? html`<sl-dropdown id="dropdown" hoist>
              <sl-menu>
                ${this._nextValue
                  ? html`<sl-button
                      size="small"
                      variant="primary"
                      @click=${() => {
                        this._addNextValue();
                      }}
                      ><sl-icon slot="prefix" name="plus"></sl-icon>${this._nextValue}</sl-button
                    >`
                  : undefined}
                ${foundPlants
                  .filter(plant => {
                    // Don't show existing values
                    if (Array.isArray(this.value) && this.value.includes(plant.id)) {
                      return false;
                    }

                    return true;
                  })
                  .slice(0, 8)
                  .map(
                    plant =>
                      html`<sl-menu-item
                        @click=${() => {
                          if (Array.isArray(this.value)) {
                            this._nextValue = plant.id;
                          } else {
                            this.value = plant.id;
                          }
                        }}
                        >${plant.name}<sl-badge slot="suffix" variant="neutral"
                          >${plant.id}</sl-badge
                        ></sl-menu-item
                      >`,
                  )}
              </sl-menu>
            </sl-dropdown>`
          : undefined}
        ${Array.isArray(this.value)
          ? html`<div class="tags">
              ${this._nextValue
                ? html`<sl-button
                    size="small"
                    variant="primary"
                    @click=${() => {
                      this._addNextValue();
                    }}
                    ><sl-icon slot="prefix" name="plus"></sl-icon>${this._nextValue}</sl-button
                  >`
                : undefined}
              ${this.value
                .sort((a, b) => a.toLocaleLowerCase().localeCompare(b.toLocaleLowerCase()))
                .map(
                  element =>
                    html`<sl-tag
                      removable
                      @sl-remove=${() => {
                        if (!Array.isArray(this.value)) {
                          return;
                        }

                        const index = this.value.indexOf(element);
                        if (-1 < index) {
                          this.value.splice(index, 1);
                          this.requestUpdate();
                          this.dispatchEvent(
                            new CustomEvent("pn-changed", {
                              detail: this.value,
                            }),
                          );
                        }
                      }}
                      >${element}</sl-tag
                    >`,
                )}
            </div>`
          : undefined}`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-multi-value-pid-editor": MultiValuePidEditor;
  }
}
