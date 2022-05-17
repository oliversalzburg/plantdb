import { LogEntry, Plant, PlantDB } from "@plantdb/libplantdb";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Typography } from "./PlantComponentStyles";

@customElement("plant-log-entry-form")
export class PlantLogEntryForm extends LitElement {
  static readonly styles = [
    Typography,
    css`
      :host {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      details div {
        display: flex;
        flex-direction: row;
        gap: 1rem;
      }

      details div * {
        flex: 1;
        min-width: 0;
      }
    `,
  ];

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  @property({ type: [LogEntry] })
  logEntry = new LogEntry("");

  @property({ type: Plant })
  plant: Plant | null = Plant.Empty();

  render() {
    return [
      html`<sl-input label="Plant" placeholder="Select plant"></sl-input
        ><sl-select label="Event type" placeholder="Select event type"></sl-select
        ><sl-input label="Date/time" placeholder="current time by default"></sl-input
        ><sl-textarea label="Note" placeholder="Add your notes here"></sl-textarea
        ><sl-input label="Product used" placeholder="name of a product"></sl-input>
        <details>
          <summary>Measurements</summary>
          <div>
            <sl-input label="EC" placeholder="1200"></sl-input
            ><sl-input label="pH" placeholder="5.5"></sl-input>
          </div>
        </details>`,
    ];
  }
}
