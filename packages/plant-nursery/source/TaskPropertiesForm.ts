import { Task } from "@plantdb/libplantdb";
import { SlCheckbox, SlInput, SlSelect, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { t } from "i18next";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { MultiValueEditor } from "./MultiValueEditor";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";
import { assertExists, isNil, mustExist } from "./tools/Maybe";

@customElement("pn-task-properties-form")
export class TaskPropertiesForm extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
      }

      .properties {
        display: flex;
        flex-direction: column;
      }

      #form {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 50vh;
        gap: 1rem 0;
      }

      .row {
        display: flex;
        flex-direction: row;
        column-gap: 1rem;
        align-items: center;
      }
      .row * {
        flex: 1;
        min-width: 0;
      }
      .row .control {
        display: flex;
        flex-direction: column;
      }
      .row .control sl-checkbox {
        margin-top: 1rem;
      }
      .row .control sl-dropdown {
        flex: 0;
      }

      .warning {
        color: var(--sl-color-warning-500);
      }

      #end-conditions sl-radio {
        margin-bottom: 1rem;
      }
    `,
  ];

  @property()
  plantStore: PlantStore | null = null;

  @property()
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: Task })
  task: Task | undefined;

  @state()
  private _title = "";
  @state()
  private _date = new Date().toISOString().slice(0, 10);
  @state()
  private _time: string | undefined;
  @state()
  private _notes: string | undefined;
  @state()
  private _plantId: string | Array<string> | undefined;
  @state()
  private _repeatInterval: number | undefined;
  @state()
  private _repeatUnit: string | undefined;
  @state()
  private _repeatDays: Array<string> | undefined;
  @state()
  private _endsOn: Date | undefined;
  @state()
  private _endsAfter: number | undefined;

  @query("#form")
  private _form: HTMLFormElement | null | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    this._refreshValues();
  }

  protected updated(
    _changedProperties: PropertyValueMap<TaskPropertiesForm> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("task")) {
      this._refreshValues();
    }
  }

  private _refreshValues() {
    this._title = this.task?.title ?? "";
    this._date =
      this.task?.date.toISOString().slice(0, 10) ?? new Date().toISOString().slice(0, 10);
    this._time = this.task?.dateTime.toISOString().slice(11, 19) ?? undefined;
    this._notes = this.task?.notes ?? undefined;
    this._plantId = this.task?.plantId ?? undefined;
    this._repeatInterval = this.task?.repeatInterval ?? undefined;
    this._repeatUnit = this.task?.repeatUnit ?? undefined;
    this._repeatDays = this.task?.repeatDays ?? undefined;
    this._endsOn = this.task?.endsOn ?? undefined;
    this._endsAfter = this.task?.endsAfter ?? undefined;
  }

  reportValidity() {
    assertExists(this._form);

    const controls: NodeListOf<SlInput | SlSelect | SlTextarea | SlCheckbox> =
      this._form.querySelectorAll("sl-input, sl-select, sl-textarea, sl-checkbox");
    let valid = true;

    for (const control of controls) {
      if (!control.reportValidity()) {
        valid = false;
        break;
      }
    }

    return valid;
  }

  asTask() {
    const task = mustExist(this.plantStore).plantDb.makeNewTask(this._title, new Date(this._date));
    return Task.fromTask(task, {
      title: this._title,
      date: new Date(this._date),
      dateTime: this._time ? new Date(`${this._date} ${this._time}`) : undefined,
      notes: this._notes,
      plantId: this._plantId,
      repeatInterval: this._repeatInterval,
      repeatUnit: this._repeatUnit,
      repeatDays: this._repeatDays,
      endsOn: this._endsOn,
      endsAfter: this._endsAfter,
    });
  }

  shouldDelete() {
    return this.task && this._title === "";
  }

  render() {
    if (isNil(this.plantStore)) {
      return;
    }

    const repeatUnits = ["day", "week", "month", "year"];
    const repeatDays = [
      "monday",
      "tuesday",
      "wednesday",
      "thursday",
      "friday",
      "saturday",
      "sunday",
    ];

    return [
      html`<div
        part="base"
        id="properties"
        class=${classMap({
          properties: true,
        })}
      >
        <form
          id="form"
          @submit=${(event: Event) => {
            event.preventDefault();
          }}
        >
          <sl-input
            label=${t("taskEditor.titleLabel")}
            placeholder=${t("taskEditor.titlePlaceholder")}
            clearable
            value=${this._title}
            @sl-input=${(event: InputEvent) => (this._title = (event.target as SlInput).value)}
            required
            >${this.task
              ? this._plantId === ""
                ? html`<small slot="help-text" class="warning"
                    >${t("taskEditor.titleHelpDeleteWarn")}</small
                  >`
                : html`<small slot="help-text">${t("taskEditor.titleHelpDelete")}</small>`
              : undefined}</sl-input
          >

          <div class="date-time row">
            <sl-input
              type="date"
              label=${t("taskEditor.dateLabel")}
              value=${this._date}
              @sl-change=${(event: MouseEvent) => {
                this._date = (event.target as SlInput).value;
              }}
              required
            ></sl-input
            ><sl-checkbox ?checked=${this._time === undefined}
              >${t("taskEditor.allDay")}</sl-checkbox
            ><sl-input
              type="time"
              ?disabled=${this._time === undefined}
              label=${t("taskEditor.timeLabel")}
              value=${this._time}
              step="60"
              @sl-change=${(event: MouseEvent) => {
                this._time = (event.target as SlInput).value;
              }}
              required
            ></sl-input>
          </div>

          <sl-textarea
            label=${t("taskEditor.notesLabel")}
            placeholder=${t("taskEditor.notesPlaceholder")}
            value=${this._notes}
            @sl-change=${(event: MouseEvent) => (this._notes = (event.target as SlTextarea).value)}
          ></sl-textarea>

          <pn-multi-value-editor
            label=${t("taskEditor.plantIdLabel")}
            placeholder=${t("taskEditor.plantIdPlaceholder")}
            .suggestions=${[...this.plantStore.plantDb.plants.keys()]}
            .value=${this._plantId}
            @pn-changed=${(event: CustomEvent) =>
              (this._plantId = (event.target as MultiValueEditor).value)}
          ></pn-multi-value-editor>

          <div class="row">
            <sl-input
              type="number"
              label=${t("taskEditor.repeatIntervalLabel")}
              placeholder=${t("taskEditor.repeatIntervalPlaceholder")}
              clearable
              value=${this._repeatInterval}
              @sl-change=${(event: MouseEvent) =>
                (this._repeatInterval = (event.target as SlInput).valueAsNumber)}
              min="0"
              step="1"
            ></sl-input>

            <sl-select
              label=${t("taskEditor.repeatUnitLabel")}
              placeholder=${t("taskEditor.repeatUnitPlaceholder")}
              clearable
              value=${this._repeatInterval}
              @sl-change=${(event: MouseEvent) =>
                (this._repeatUnit = (event.target as SlSelect).value as string)}
              hoist
            >
              ${repeatUnits.map(unit => html`<sl-menu-item value=${unit}>${unit}</sl-menu-item>`)}
            </sl-select>
            <sl-select
              label=${t("taskEditor.repeatDaysLabel")}
              placeholder=${t("taskEditor.repeatDaysPlaceholder")}
              clearable
              multiple
              value=${this._repeatDays}
              hoist
            >
              ${repeatDays.map(
                unit =>
                  html`<sl-menu-item value=${unit}>${t(`taskEditor.day_${unit}`)}</sl-menu-item>`
              )}
            </sl-select>
          </div>

          <sl-radio-group id="end-conditions" label=${t("taskEditor.endConditions")} fieldset>
            <sl-radio>${t("taskEditor.endsNever")}</sl-radio>
            <sl-radio>
              <sl-input
                type="date"
                label=${t("taskEditor.endsOnLabel")}
                value=${this._endsOn}
                @sl-change=${(event: MouseEvent) => {
                  this._endsOn = (event.target as SlInput).valueAsDate ?? undefined;
                }}
                clearable
              ></sl-input
            ></sl-radio>

            <sl-radio>
              <sl-input
                type="number"
                label=${t("taskEditor.endsAfterLabel")}
                placeholder=${t("taskEditor.endsAfterPlaceholder")}
                value=${this._endsAfter}
                @sl-change=${(event: MouseEvent) => {
                  this._endsAfter = (event.target as SlInput).valueAsNumber;
                }}
                step="1"
                clearable
                ><span slot="suffix">${t("taskEditor.endsAfterOccurences")}</span></sl-input
              ></sl-radio
            >
          </sl-radio-group>
        </form>
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-task-properties-form": TaskPropertiesForm;
  }
}
