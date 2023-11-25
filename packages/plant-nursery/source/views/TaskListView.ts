import { assertExists } from "@oliversalzburg/js-utils/nil.js";
import { Task } from "@plantdb/libplantdb";
import { css, html } from "lit";
import { translate as t } from "lit-i18n";
import { customElement, property } from "lit/decorators.js";
import { View } from "./View";

@customElement("pn-task-list-view")
export class TaskListView extends View {
  static readonly styles = [
    ...View.styles,
    css`
      #list {
        flex: 1;
      }

      .footer {
        display: flex;
        justify-content: flex-end;
        padding: 1rem;
      }

      .empty {
        flex: 1;
      }
    `,
  ];

  @property({ attribute: false })
  tasks = new Array<Task>();

  async createNewTask() {
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);

    const task = await this.plantStoreUi.showTaskEditor();
    if (!task) {
      return Promise.resolve(undefined);
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
            ></pn-task-list>
            <section class="footer">
              <sl-button variant="primary" @click=${() => this.createNewTask()}
                >${t("task.add")}</sl-button
              >
            </section>`
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
