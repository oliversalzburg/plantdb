import { assertExists } from "@oliversalzburg/js-utils/lib/nil";
import { Task } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { t } from "i18next";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { Forms } from "./ComponentStyles";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

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
        flex-wrap: wrap;
        gap: 0.25rem 0;
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

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
  tasks = new Array<Task>();

  @property()
  filter = "";

  @property({ attribute: false })
  dateStart: Date = DateTime.fromJSDate(new Date()).startOf("day").toJSDate();
  @property({ attribute: false })
  dateEnd: Date = DateTime.fromJSDate(new Date()).plus({ months: 1 }).toJSDate();

  render() {
    assertExists(this.plantStore);

    const taskInstances = this.plantStore.tasksForDateRange(this.dateStart, this.dateEnd);

    let filteredTasks = taskInstances;
    if (this.filter) {
      const index = this.plantStore.indexFromTasks(taskInstances);
      const filtered = this.plantStore.searchTasks(this.filter, index).map(task => task.id);
      filteredTasks = filteredTasks.filter(task => filtered.includes(task.id));
    }

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
          value=${DateTime.fromJSDate(this.dateStart).toFormat("yyyy-MM-dd")}
          @sl-change=${(event: Event) =>
            (this.dateStart =
              (event.target as SlInput).valueAsDate ??
              DateTime.fromJSDate(new Date()).startOf("day").toJSDate())}
          required
        ></sl-input
        ><sl-input
          id="date-end"
          type="date"
          label="End"
          value=${DateTime.fromJSDate(this.dateEnd).toFormat("yyyy-MM-dd")}
          @sl-change=${(event: Event) =>
            (this.dateEnd =
              (event.target as SlInput).valueAsDate ??
              DateTime.fromJSDate(new Date()).startOf("day").toJSDate())}
          required
        ></sl-input>
      </div>`,
      html`<div id="tasks">
        ${filteredTasks.map(
          task =>
            html`<pn-task-instance
              .plantStore=${this.plantStore}
              .plantStoreUi=${this.plantStoreUi}
              .task=${task}
            ></pn-task-instance>`,
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
