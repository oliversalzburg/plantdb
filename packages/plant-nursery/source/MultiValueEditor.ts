import { SlDropdown, SlInput } from "@shoelace-style/shoelace";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";

@customElement("pn-multi-value-editor")
export class MultiValueEditor extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
      }

      .tags {
        display: flex;
        margin-top: 0.1rem;
        gap: 0.1rem;
        flex-wrap: wrap;
      }
    `,
  ];

  @property()
  value: Array<string> | string | undefined;
  @state()
  protected _nextValue: string | undefined;

  @property()
  label: string | undefined;

  @property()
  placeholder: string | undefined;

  @property({ type: [String] })
  suggestions: Array<string> | undefined;

  @query("#input")
  protected _input: SlInput | null | undefined;
  @query("#dropdown")
  protected _dropdown: SlDropdown | null | undefined;

  protected _addNextValue() {
    if (!this._nextValue) {
      return;
    }

    if (!Array.isArray(this.value)) {
      this.value = [];
    }

    if (!this.value.includes(this._nextValue)) {
      this.value.push(this._nextValue);
    }

    this._nextValue = undefined;
    this._input?.focus();
    this.requestUpdate();

    this.dispatchEvent(
      new CustomEvent("pn-changed", {
        detail: this.value,
      }),
    );
  }

  render() {
    return [
      html`<sl-input
          id="input"
          label=${this.label}
          placeholder=${Array.isArray(this.value) ? this.value.sort().join(", ") : this.placeholder}
          clearable
          value=${Array.isArray(this.value) ? this._nextValue : this.value}
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
        >${Array.isArray(this.suggestions) && this.suggestions.length
          ? html`<sl-dropdown id="dropdown" hoist>
              <sl-menu>
                ${this._nextValue
                  ? html`<sl-button
                      size="small"
                      variant="primary"
                      @click=${() => this._addNextValue()}
                      ><sl-icon slot="prefix" name="plus"></sl-icon>${this._nextValue}</sl-button
                    >`
                  : undefined}
                ${(this.suggestions ?? [])
                  .filter(suggestion => {
                    // Don't show existing values
                    if (Array.isArray(this.value) && this.value.includes(suggestion)) {
                      return false;
                    }

                    return suggestion
                      .toLocaleLowerCase()
                      .includes(
                        (
                          this._nextValue ??
                          (Array.isArray(this.value) ? "" : this.value) ??
                          ""
                        ).toLocaleLowerCase(),
                      );
                  })
                  .sort()
                  .slice(0, 10)
                  .map(
                    entry =>
                      html`<sl-menu-item
                        @click=${() => {
                          if (Array.isArray(this.value)) {
                            this._nextValue = entry;
                          } else {
                            this.value = entry;
                          }
                        }}
                        >${entry}</sl-menu-item
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
                    @click=${() => this._addNextValue()}
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
          : undefined} `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-multi-value-editor": MultiValueEditor;
  }
}
