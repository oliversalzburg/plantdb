import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";

@customElement("plant-404")
export class InvalidRouteView extends LitElement {
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

  render() {
    return [
      html`<section>
        <h2>Oops! You hit a 404</h2>
        <p>
          The page you're looking for doesn't seem to exist. Head back
          <a href="/">home</a> and try again?
        </p>
      </section>`,
    ];
  }
}
