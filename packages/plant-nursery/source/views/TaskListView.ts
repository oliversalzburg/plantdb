import { Task } from "@plantdb/libplantdb";
import { t } from "i18next";
import { css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
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

  render() {
    return [
      0 < (this.plantStore?.plantDb.tasks.length ?? 0)
        ? html`<pn-task-list
            id="list"
            .plantStore=${this.plantStore}
            .plantStoreUi=${this.plantStoreUi}
            .tasks=${this.tasks}
          ></pn-task-list>`
        : html`<pn-empty-state class="empty"><p>${t("empty.tasks")}</p></pn-empty-state>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-task-list-view": TaskListView;
  }
}
