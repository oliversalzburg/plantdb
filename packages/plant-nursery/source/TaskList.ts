import { Plant, Task } from "@plantdb/libplantdb";
import SlInput from "@shoelace-style/shoelace/dist/components/input/input";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { PlantStore } from "./stores/PlantStore";
import { PlantStoreUi } from "./stores/PlantStoreUi";

@customElement("pn-task-list")
export class TaskList extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        min-height: 0;
      }

      #filter-input {
        padding: 1rem;
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

  render() {
    return [
      html`<sl-input
        placeholder=${t("task.filterPlaceholder")}
        .value="${this.filter}"
        @sl-input="${(event: InputEvent) => (this.filter = (event.target as SlInput).value)}"
        id="filter-input"
      ></sl-input>`,
      html`<div id="tasks">
        ${this.plantStore?.plantDb.tasks.map(
          task =>
            html`<sl-card @click=${() => this.plantStoreUi?.editTask(task)}>${task.title}</sl-card>`
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
