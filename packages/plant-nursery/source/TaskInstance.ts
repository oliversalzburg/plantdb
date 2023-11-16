import { assertExists, mustExist } from "@oliversalzburg/js-utils/lib/nil";
import { Task } from "@plantdb/libplantdb";
import { LitElement, css, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

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

  @property({ attribute: false })
  plantStore: PlantStore | null = null;

  @property({ attribute: false })
  plantStoreUi: PlantStoreUi | null = null;

  @property({ attribute: false })
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
