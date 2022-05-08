import { css, LitElement } from "lit";
import { property } from "lit/decorators.js";

export abstract class View extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }
    `,
  ];

  @property({ type: Boolean })
  active = false;

  protected shouldUpdate(): boolean {
    return this.active;
  }
}
