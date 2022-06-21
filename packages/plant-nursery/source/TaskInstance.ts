import { Task } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";
import { assertExists, mustExist } from "./tools/Maybe";

@customElement("pn-task-instance")
export class TaskInstance extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }
    `,
  ];

  @property({ type: PlantStore })
  plantStore: PlantStore | null = null;

  @property({ type: PlantStoreUi })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ type: Task })
  task: Task | undefined;

  render() {
    assertExists(this.plantStore);
    assertExists(this.plantStoreUi);
    assertExists(this.task);

    return [
      html`<sl-card @click=${() => this.plantStoreUi?.editTask(mustExist(this.task))}
        >${this.task.title}<br /><small
          >${this.task.time
            ? DateTime.fromJSDate(this.task.dateTime).toFormat("DDDD t")
            : DateTime.fromJSDate(this.task.date).toFormat("DDDD")}</small
        ></sl-card
      >`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-task-instance": TaskInstance;
  }
}
