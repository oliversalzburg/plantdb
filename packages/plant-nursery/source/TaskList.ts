import { Plant, Task } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { Forms } from "./ComponentStyles";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";
import { assertExists } from "./tools/Maybe";

@customElement("pn-task-list")
export class TaskList extends LitElement {
  static readonly styles = [
    Forms,
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      .filter {
        display: flex;
        flex-direction: row;
        padding: 1rem;
      }

      .filter sl-input:first-child {
        flex: 1;
      }

      #tasks {
        display: flex;
        flex-direction: column;
        margin: 1rem;
        gap: 1rem;
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: [Plant] })
  tasks = new Array<Task>();

  @property()
  filter = "";

  @property({ type: Date })
  dateStart: Date = new Date();
  @property({ type: Date })
  dateEnd: Date = DateTime.fromJSDate(new Date()).plus({ months: 1 }).toJSDate();

  render() {
    assertExists(this.plantStore);

    const taskInstances = this.plantStore.tasksForDateRange(this.dateStart, this.dateEnd);

    return [
      html`<div class="filter input-group">
        <sl-input
          placeholder=${t("task.filterPlaceholder")}
          .value="${this.filter}"
          @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
          id="filter-input"
        ></sl-input
        ><sl-input
          id="date-start"
          type="date"
          label="Start"
          value=${this.dateStart?.toISOString().slice(0, 10)}
          @sl-change=${(event: Event) =>
            (this.dateStart = (event.target as SlInput).valueAsDate ?? new Date())}
          required
        ></sl-input
        ><sl-input
          id="date-end"
          type="date"
          label="End"
          value=${this.dateEnd?.toISOString().slice(0, 10)}
          @sl-change=${(event: Event) =>
            (this.dateEnd = (event.target as SlInput).valueAsDate ?? new Date())}
          required
        ></sl-input>
      </div>`,
      html`<div id="tasks">
        ${taskInstances.map(
          task =>
            html`<sl-card @click=${() => this.plantStoreUi?.editTask(task)}
              >${task.title}<br /><small>${task.date}</small></sl-card
            >`
        )}
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-task-list": TaskList;
  }
}
