import { Plant, roundTo } from "@plantdb/libplantdb";
import Dygraph from "dygraphs";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property } from "lit/decorators.js";
import { DarkModeController } from "./DarkModeController";

@customElement("plant-dygraph")
export class PlantDygraph extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }

      .graph {
        display: block;
        height: 100%;
        width: 100%;
      }

      /**
       * Default styles for the dygraphs charting library.
       */

      .dygraph-legend {
        position: absolute;
        font-size: 14px;
        z-index: 10;
        width: 250px; /* labelsDivWidth */
        /*
        dygraphs determines these based on the presence of chart labels.
        It might make more sense to create a wrapper div around the chart proper.
        top: 0px;
        right: 2px;
        */
        background: transparent;
        line-height: normal;
        text-align: left;
        overflow: hidden;
      }

      /* styles for a solid line in the legend */
      .dygraph-legend-line {
        display: inline-block;
        position: relative;
        bottom: 0.5ex;
        padding-left: 1em;
        height: 1px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        /* border-bottom-color is set based on the series color */
      }

      /* styles for a dashed line in the legend, e.g. when strokePattern is set */
      .dygraph-legend-dash {
        display: inline-block;
        position: relative;
        bottom: 0.5ex;
        height: 1px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
        /* border-bottom-color is set based on the series color */
        /* margin-right is set based on the stroke pattern */
        /* padding-left is set based on the stroke pattern */
      }

      .dygraph-roller {
        position: absolute;
        z-index: 10;
      }

      /* This class is shared by all annotations, including those with icons */
      .dygraph-annotation {
        position: absolute;
        z-index: 10;
        overflow: hidden;
      }

      /* This class only applies to annotations without icons */
      /* Old class name: .dygraphDefaultAnnotation */
      .dygraph-default-annotation {
        border: 1px solid white;
        background-color: transparent;
        text-align: center;
      }

      .dygraph-axis-label {
        /* position: absolute; */
        /* font-size: 14px; */
        z-index: 10;
        line-height: normal;
        overflow: hidden;
        color: white; /* replaces old axisLabelColor option */
      }

      .dygraph-axis-label-x {
      }

      .dygraph-axis-label-y {
      }

      .dygraph-axis-label-y2 {
      }

      .dygraph-title {
        font-weight: bold;
        z-index: 10;
        text-align: center;
        /* font-size: based on titleHeight option */
      }

      .dygraph-xlabel {
        text-align: center;
        /* font-size: based on xLabelHeight option */
      }

      /* For y-axis label */
      .dygraph-label-rotate-left {
        text-align: center;
        transform: rotate(90deg);
      }

      /* For y2-axis label */
      .dygraph-label-rotate-right {
        text-align: center;
        transform: rotate(-90deg);
      }
    `,
  ];

  @property()
  data = "";

  @property({ type: Plant })
  plant: Plant | undefined;

  private darkModeController = new DarkModeController();

  protected updated(
    _changedProperties: PropertyValueMap<PlantDygraph> | Map<PropertyKey, unknown>
  ): void {
    if (_changedProperties.has("data")) {
      this.renderGraph();
    }
  }

  renderGraph() {
    if (!this.shadowRoot?.querySelector(".graph")) {
      console.warn("Tried to create chart before DOM ready.");
    }

    if (!this.plant) {
      return;
    }

    const colorSets = [
      ["#fab601", "#00bcf2", "#8AE234"],
      ["#444444", "#888888", "#DDDDDD"],
    ];

    new Dygraph(
      // containing div
      this.shadowRoot?.querySelector(".graph") as HTMLDivElement,

      this.data,
      {
        axes: {
          y2: {
            axisLabelFormatter: (v: number | Date) => {
              return String(roundTo(v.valueOf() / 100));
            },
            valueFormatter: (y, opts, series_name) => {
              return String(roundTo(series_name === "pH" ? y / 100 : y));
            },
          },
        },
        colors: colorSets[this.darkModeController.darkMode ? 0 : 1],
        series: {
          pH: {
            axis: "y2",
          },
        },
        ylabel: "EC µS/cm",
        y2label: "pH",
      }
    );
  }

  render() {
    return [html`<div class="graph"></div>`];
  }
}
