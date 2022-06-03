import "@shoelace-style/shoelace/dist/components/badge/badge";
import "@shoelace-style/shoelace/dist/components/button/button";
import "@shoelace-style/shoelace/dist/components/card/card";
import "dygraphs/dist/dygraph.css";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isNil, mustExist } from "./Maybe";

export type PlantNetResult = {
  score: number;
  species: {
    scientificNameWithoutAuthor: string;
    scientificNameAuthorship: string;
    genus: {
      scientificNameWithoutAuthor: string;
      scientificNameAuthorship: string;
      scientificName: string;
    };
    family: {
      scientificNameWithoutAuthor: string;
      scientificNameAuthorship: string;
      scientificName: string;
    };
    commonNames: Array<string>;
    scientificName: string;
  };
  images: Array<{
    organ: string;
    author: string;
    license: string;
    date: { timestamp: number; string: string };
    url: {
      o: string;
      m: string;
      s: string;
    };
    citation: string;
  }>;
  gbif: { id: string };
};

export type PlantNetResponse = {
  query: {
    project: string;
    images: Array<string>;
    organs: Array<"auto" | string>;
    includeRelatedImages: boolean;
  };
  language: "en" | string;
  preferedReferential: string;
  bestMatch: string;
  results: Array<PlantNetResult>;
  version: string;
  remainingIdentificationRequests: number;
};

@customElement("plant-identification-picker")
export class PlantIdentificationPicker extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: flex;
        flex-direction: column;
        flex: 1;
      }

      #results {
        display: flex;
        flex-direction: column;
        gap: 0.25rem;
      }

      .result {
        flex: 1;
        display: flex;
        flex-direction: row;
        align-items: center;
        padding: 0.5rem;
        gap: 1rem;
        cursor: pointer;
      }
      .result:hover {
        background-color: var(--sl-color-primary-500);
      }

      .result .info {
        flex: 1;
      }
    `,
  ];

  @property()
  response: PlantNetResponse | undefined;

  render() {
    if (isNil(this.response)) {
      return;
    }

    return [
      html`<h3>Best match</h3>
        <div id="results">
          ${html`<div
              class="result"
              @click=${() =>
                this.dispatchEvent(
                  new CustomEvent<PlantNetResult>("plant-identification-picked", {
                    detail: mustExist(this.response).results[0],
                  })
                )}
            >
              <img src=${this.response.results[0].images[0].url.s} />
              <p class="info">
                <strong>${this.response.results[0].species.scientificName}</strong><br />
                Genus: ${this.response.results[0].species.genus.scientificName}<br />
                Family: ${this.response.results[0].species.family.scientificName}
              </p>
              <sl-button>Pick</sl-button>
            </div>
            <sl-button
              @click=${() => this.dispatchEvent(new CustomEvent("plant-identification-cancelled"))}
              >Cancel</sl-button
            >
            <h4>Other results</h4>`}
          ${this.response.results.slice(1, 10).map(
            result =>
              html`<div
                class="result"
                @click=${() =>
                  this.dispatchEvent(
                    new CustomEvent<PlantNetResult>("plant-identification-picked", {
                      detail: result,
                    })
                  )}
              >
                <img src=${result.images[0].url.s} />
                <p class="info">
                  <strong>${result.species.scientificName}</strong><br />
                  Genus: ${result.species.genus.scientificName}<br />
                  Family: ${result.species.family.scientificName}
                </p>
                <sl-button>Pick</sl-button>
              </div>`
          )}
        </div>`,
    ];
  }
}
