import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";
import { PlantStore } from "../stores/PlantStore";
import { PlantStoreUi } from "../stores/PlantStoreUi";

export abstract class View extends LitElement {
  static readonly styles = [
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        min-height: 0;
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
