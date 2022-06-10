import { Plant, roundTo } from "@plantdb/libplantdb";
import Dygraph from "dygraphs";
import { css, html, LitElement, PropertyValueMap } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { PlantStoreUi, retrieveStoreUi } from "./stores/PlantStoreUi";
import { mustExist } from "./tools/Maybe";

@customElement("pn-plant-dygraph")
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
      }

      /* styles for a dashed line in the legend, e.g. when strokePattern is set */
      .dygraph-legend-dash {
        display: inline-block;
        position: relative;
        bottom: 0.5ex;
        height: 1px;
        border-bottom-width: 2px;
        border-bottom-style: solid;
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
        border: 1px solid black;
        background-color: transparent;
        text-align: center;
      }
      .dark-theme .dygraph-default-annotation {
        border: 1px solid white;
      }

      .dygraph-axis-label {
        /* position: absolute; */
        /* font-size: 14px; */
        z-index: 10;
        line-height: normal;
        overflow: hidden;
        color: black;
      }
      .dark-theme .dygraph-axis-label {
        color: white;
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
      }

      .dygraph-xlabel {
        text-align: center;
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

  @property({ type: Boolean })
  darkMode = false;

  @state()
  private _plantStoreUi: PlantStoreUi | undefined;

  private _onThemeChangeHandler: ((event: Event) => void) | undefined;

  connectedCallback(): void {
    super.connectedCallback();
    this._plantStoreUi = mustExist(retrieveStoreUi());
    this.darkMode = this._plantStoreUi.darkMode;
    if (this.darkMode) {
      this.classList.add("dark-theme");
    } else {
      this.classList.remove("dark-theme");
    }
    this._onThemeChangeHandler = (event: Event) => {
      this.darkMode = (event as CustomEvent<"dark" | "light">).detail === "dark";
      this._handleThemeChange();
    };
    this._plantStoreUi.addEventListener("pn-theme-changed", this._onThemeChangeHandler);
  }

  disconnectedCallback(): void {
    if (this._onThemeChangeHandler) {
      this._plantStoreUi?.removeEventListener("pn-theme-changed", this._onThemeChangeHandler);
      this._onThemeChangeHandler = undefined;
    }
  }

  private _handleThemeChange() {
    if (this.darkMode) {
      this.classList.add("dark-theme");
    } else {
      this.classList.remove("dark-theme");
    }

    this.renderGraph();
  }

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
      ["#00bcf2", "#fab601", "#8AE234"],
      ["#0230aa", "#be3400", "#DDDDDD"],
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
        colors: colorSets[this._plantStoreUi?.darkMode ? 0 : 1],
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
    return [html`<div class="graph ${this.darkMode ? "dark-theme" : ""}"></div>`];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-dygraph": PlantDygraph;
  }
}
