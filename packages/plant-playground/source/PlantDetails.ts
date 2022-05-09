import { Plant, PlantDB } from "@plantdb/libplantdb";
import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DateTime } from "luxon";

@customElement("plant-details")
export class PlantDetails extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: inline-block;
      }

      :host sl-card {
        margin: 1rem;
      }

      :host sl-card [slot="header"] {
        text-align: right;
      }

      :host sl-card [slot="footer"] {
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      :host sl-card [slot="footer"] ul {
        padding: 0;
        list-style: none;
      }

      :host sl-card [slot="footer"] ul li {
        color: #777;
      }

      .top {
        display: flex;
        align-items: center;
      }

      .graph {
        display: inline-block;
        width: 400px;
        height: 250px;
        background-color: #444;
      }
    `,
  ];

  @property({ type: Plant })
  plant: Plant | undefined;

  @property({ type: PlantDB })
  plantDb = PlantDB.Empty();

  plantDataAsCSV(plant: Plant) {
    return (
      "Date,pH,EC\n" +
      plant.log
        .filter(entry => entry.ph || entry.ec)
        .map(entry => `${entry.timestamp.toISOString()},${(entry.ph ?? 0) * 100},${entry.ec ?? 0}`)
        .join("\n")
    );
  }

  render() {
    if (!this.plant) {
      return;
    }

    return html`<div class="top">
        <sl-card>
          <div slot="header"><sl-badge variant="neutral">${this.plant.id}</sl-badge></div>
          ${this.plant.name}
          <br />
          <small><em>${this.plant.kind}</em></small>
          <div slot="footer">
            <small>
              <ul>
                <li>
                  Added: ${DateTime.fromJSDate(this.plant.logEntryOldest.timestamp).toRelative()}
                </li>
                <li>
                  Last updated:
                  ${DateTime.fromJSDate(this.plant.logEntryLatest.timestamp).toRelative()}
                </li>
              </ul>
            </small>
          </div>
        </sl-card>
        <plant-dygraph
          class="graph"
          .data=${this.plantDataAsCSV(this.plant)}
          .plant=${this.plant}
        ></plant-dygraph>
      </div>

      <plant-log
        .plantDb=${this.plantDb}
        .log=${this.plant.log}
        .headerVisible=${false}
      ></plant-log>`;
  }
}
