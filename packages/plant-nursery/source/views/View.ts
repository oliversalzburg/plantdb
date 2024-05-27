import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { PlantStore } from "../stores/PlantStore.js";
import { PlantStoreUi } from "../stores/PlantStoreUi.js";

export abstract class View extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
        min-width: 0;
      }
    `,
  ];

  @property({ type: Boolean })
  active = false;

  @property()
  plantStore: PlantStore | null = null;

  @property()
  plantStoreUi: PlantStoreUi | null = null;

  protected shouldUpdate(): boolean {
    return this.active;
  }
}
