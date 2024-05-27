import { assertExists, isNil, mustExist } from "@oliversalzburg/js-utils/nil.js";
import { Task, TaskRepeatDays, TaskRepeatFrequency, WeekDay } from "@plantdb/libplantdb";
import { SlCheckbox, SlInput, SlRadio, SlSelect, SlTextarea } from "@shoelace-style/shoelace";
import "@shoelace-style/shoelace/dist/components/badge/badge.js";
import "@shoelace-style/shoelace/dist/components/button/button.js";
import "@shoelace-style/shoelace/dist/components/card/card.js";
import "dygraphs/dist/dygraph.css";
import { LitElement, PropertyValueMap, css, html } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { ifDefined } from "lit/directives/if-defined.js";
import { DateTime } from "luxon";
import { MultiValueEditor } from "./MultiValueEditor.js";
import { PlantStore } from "./stores/PlantStore.js";
import { PlantStoreUi } from "./stores/PlantStoreUi.js";

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

      #end-conditions sl-input::part(form-control) {
        display: flex;
        align-items: center;
        gap: 0.5em;
      }
      #end-conditions sl-input::part(form-control-label) {
        min-width: 4rem;
      }
      #end-conditions sl-radio::part(base) {
        align-items: center;
      }

      .row {
        display: flex;
        flex-direction: row;
        column-gap: 1rem;
        align-items: flex-end;
      }
      .row * {
        flex: 1;
        min-width: 0;
      }
      .row sl-checkbox {
        margin-bottom: 0.75rem;
      }

      .warning {
        color: var(--sl-color-warning-500);
      }

      #end-conditions sl-radio {
        margin-bottom: 1rem;
      }
    `,
  ];

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
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
  private _repeatFrequency: TaskRepeatFrequency | undefined;
  @state()
  private _repeatInterval: number | undefined;
  @state()
  private _repeatDays = new Array<TaskRepeatDays>();
  @state()
  private _endsOn: string | undefined;
  @state()
  private _endsAfter: number | undefined;

  @query("#form")
  private _form: HTMLFormElement | null | undefined;

  connectedCallback(): void {
    super.connectedCallback();

    this._refreshValues();
  }

  protected updated(
    _changedProperties: PropertyValueMap<TaskPropertiesForm> | Map<PropertyKey, unknown>,
  ): void {
    if (_changedProperties.has("task")) {
      this._refreshValues();
    }
  }

  private _refreshValues() {
    this._title = this.task?.title ?? "";
    this._date = this.task?.date
      ? DateTime.fromJSDate(this.task.date).toFormat("yyyy-MM-dd")
      : DateTime.fromJSDate(new Date()).toFormat("yyyy-MM-dd");
    this._time = this.task?.time ? DateTime.fromJSDate(this.task.time).toFormat("T") : undefined;
    this._notes = this.task?.notes ?? undefined;
    this._plantId = this.task?.plantId ?? undefined;
    this._repeatFrequency = this.task?.repeatFrequency ?? undefined;
    this._repeatInterval = this.task?.repeatInterval ?? undefined;
    this._repeatDays = this.task?.repeatDays ?? [];
    this._endsOn = this.task?.endsOn?.toISOString().slice(0, 10) ?? undefined;
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
      id: this.task?.id,
      title: this._title,
      date: new Date(this._date),
      time: this._time ? new Date(`${this._date} ${this._time}`) : undefined,
      notes: this._notes,
      plantId: this._plantId,
      repeatFrequency: this._repeatFrequency,
      repeatInterval: this._repeatInterval,
      repeatDays: this._repeatDays,
      endsOn: this._endsOn ? new Date(this._endsOn) : undefined,
      endsAfter: this._endsAfter,
    });
  }

  shouldDelete() {
    return this.task && this._title === "";
  }

  render() {
    if (isNil(this.plantStore)) {
      return undefined;
    }

    const repeatUnits = ["day", "week", "month", "year"];
    const repeatDays = Object.values(WeekDay);

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
            ><sl-checkbox
              ?checked=${this._time === undefined}
              @sl-change=${(event: Event) => {
                this._time = (event.target as SlCheckbox).checked
                  ? undefined
                  : new Date().toISOString().slice(11, 16);
              }}
              >${t("taskEditor.allDay")}</sl-checkbox
            ><sl-input
              type="time"
              ?disabled=${this._time === undefined}
              label=${t("taskEditor.timeLabel")}
              value=${ifDefined(this._time)}
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
            value=${ifDefined(this._notes)}
            @sl-change=${(event: MouseEvent) => (this._notes = (event.target as SlTextarea).value)}
          ></sl-textarea>

          <pn-multi-value-pid-editor
            label=${t("taskEditor.plantIdLabel")}
            placeholder=${t("taskEditor.plantIdPlaceholder")}
            .plantStore=${this.plantStore}
            .plants=${[...this.plantStore.plantDb.plants.values()]}
            .value=${this._plantId}
            @pn-changed=${(event: CustomEvent) =>
              (this._plantId = (event.target as MultiValueEditor).value)}
          ></pn-multi-value-pid-editor>

          <div class="repeat row">
            <sl-input
              type="number"
              label=${t("taskEditor.repeatIntervalLabel")}
              placeholder=${t("taskEditor.repeatIntervalPlaceholder")}
              clearable
              value=${ifDefined(this._repeatInterval)}
              @sl-change=${(event: MouseEvent) =>
                (this._repeatInterval = (event.target as SlInput).valueAsNumber)}
              min="1"
              step="1"
            ></sl-input>

            <sl-select
              label=${t("taskEditor.repeatUnitLabel")}
              placeholder=${t("taskEditor.repeatUnitPlaceholder")}
              clearable
              ?required=${this._repeatInterval !== undefined}
              value=${ifDefined(this._repeatFrequency)}
              @sl-change=${(event: MouseEvent) =>
                (this._repeatFrequency = (event.target as SlSelect).value as string)}
              hoist
            >
              ${repeatUnits.map(
                unit =>
                  html`<sl-option value=${unit}>${t(`taskEditor.interval_${unit}`)}</sl-option>`,
              )}
            </sl-select>
            <sl-select
              label=${t("taskEditor.repeatDaysLabel")}
              placeholder=${t("taskEditor.repeatDaysPlaceholder")}
              clearable
              multiple
              .value=${this._repeatDays}
              @sl-change=${(event: MouseEvent) => {
                this._repeatDays = (event.target as SlSelect).value as Array<TaskRepeatDays>;
              }}
              hoist
            >
              ${repeatDays.map(
                unit =>
                  html`<sl-option value=${unit}
                    >${t(`taskEditor.day_${unit.toString()}`)}</sl-option
                  >`,
              )}
            </sl-select>
          </div>

          <sl-radio-group id="end-conditions" label=${t("taskEditor.endConditions")} fieldset>
            <sl-radio ?checked=${this._endsOn === undefined && this._endsAfter === undefined}
              >${t("taskEditor.endsNever")}</sl-radio
            >
            <sl-radio
              ?checked=${this._endsOn !== undefined}
              @sl-change=${(event: Event) => {
                this._endsOn = (event.target as SlRadio).checked
                  ? new Date().toISOString().slice(0, 10)
                  : undefined;
              }}
            >
              <sl-input
                type="date"
                label=${t("taskEditor.endsOnLabel")}
                value=${ifDefined(this._endsOn)}
                ?disabled=${this._endsOn === undefined}
                @sl-change=${(event: MouseEvent) => {
                  this._endsOn = (event.target as SlInput).value;
                  event.stopPropagation();
                }}
                clearable
              ></sl-input
            ></sl-radio>

            <sl-radio
              ?checked=${this._endsAfter !== undefined}
              @sl-change=${(event: Event) => {
                this._endsAfter = (event.target as SlRadio).checked ? 1 : undefined;
              }}
            >
              <sl-input
                type="number"
                label=${t("taskEditor.endsAfterLabel")}
                placeholder=${t("taskEditor.endsAfterPlaceholder")}
                value=${ifDefined(this._endsAfter)}
                ?disabled=${this._endsAfter === undefined}
                @sl-change=${(event: MouseEvent) => {
                  this._endsAfter = (event.target as SlInput).valueAsNumber;
                  event.stopPropagation();
                }}
                step="1"
                min="1"
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
