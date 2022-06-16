import { Task } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { assertExists } from "../tools/Maybe";
import { View } from "./View";

@customElement("pn-task-list-view")
export class TaskListView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      .empty {
        flex: 1;
      }
    `,
  ];

  @property({ type: [Task] })
  tasks = new Array<Task>();

  async createNewTask() {
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);

    const task = await this.plantStoreUi.showTaskEditor();
    if (!task) {
      return;
    }

    console.debug(task);
    const newDb = this.plantStore.plantDb.withNewTask(task);
    return this.plantStore.updatePlantDb(newDb);
  }

  render() {
    return [
      0 < (this.plantStore?.plantDb.tasks.length ?? 0)
        ? html`<pn-task-list
            id="list"
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .tasks=${this.tasks}
          ></pn-task-list>`
        : html`<pn-empty-state class="empty"
            ><p>${t("empty.tasks")}</p>
            <sl-button @click=${() => this.createNewTask()}
              >${t("task.add")}</sl-button
            ></pn-empty-state
          >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-task-list-view": TaskListView;
  }
}
