import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { classMap } from "lit/directives/class-map.js";
import { mustExist } from "./tools/Maybe";

@customElement("pn-plant-scanner")
export class PlantScanner extends LitElement {
  static readonly styles = [
    css`
      :host {
        display: block;
      }

      .scanner {
        display: flex;
        flex-direction: column;
        gap: 1rem;
      }

      .top {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .controls {
        display: flex;
        gap: 1rem;
        justify-content: center;
      }

      #canvas,
      #pick-image,
      #retry {
        display: none;
      }
      #spinner {
        display: none;
        position: absolute;
      }

      .scanner.scanner--busy #spinner {
        display: block;
      }

      .scanner.scanner--scanning #canvas,
      .scanner.scanner--scanning #pick-image,
      .scanner.scanner--scanning #retry {
        display: none;
      }
      .scanner.scanner--scanning #abort,
      .scanner.scanner--scanning #click-photo,
      .scanner.scanner--scanning #video {
        display: block;
      }

      .scanner.scanner--image-available #canvas,
      .scanner.scanner--image-available #pick-image,
      .scanner.scanner--image-available #retry {
        display: block;
      }
      .scanner.scanner--image-available #abort,
      .scanner.scanner--image-available #click-photo,
      .scanner.scanner--image-available #video {
        display: none;
      }

      #video {
        width: 100%;
      }
    `,
  ];

  @query("#video")
  private _video: HTMLVideoElement | null | undefined;
  @query("#canvas")
  private _canvas: HTMLCanvasElement | null | undefined;

  private _mediaStream: MediaStream | null = null;

  @state()
  private _busy = false;
  @state()
  private _scanning = false;
  @state()
  private _imageAvailable = false;

  @property()
  dataUrl: string | null = null;

  stop(): void {
    mustExist(this._video).pause();

    this._mediaStream?.getTracks().forEach(track => track.stop());
  }

  async start() {
    const canvas = mustExist(this._canvas);
    const video = mustExist(this._video);

    this._busy = true;

    const mediaStream = await this._getMediaStream();
    this._mediaStream = mediaStream;

    video.srcObject = mediaStream;
    await new Promise((resolve, reject) => {
      video.onloadedmetadata = resolve;
      video.onerror = reject;
    });
    await video.play();

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    this._busy = false;
    this._scanning = true;
  }

  private async _getMediaStream(
    constraints: {
      audio: boolean;
      video: { facingMode?: { exact: string }; width: number; height: number };
    } = {
      audio: false,
      video: {
        facingMode: { exact: "environment" },
        width: this.clientWidth,
        height: this.clientHeight,
      },
    },
  ): Promise<MediaStream> {
    let mediaStream;
    try {
      mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
    } catch (error) {
      if ((error as Error).name === "OverconstrainedError" && "facingMode" in constraints.video) {
        // Environment camera problably not available. Assume we're on deskop.
        delete constraints.video.facingMode;
        return this._getMediaStream(constraints);
      }
      throw error;
    }

    return mediaStream;
  }

  private _capture() {
    const canvas = mustExist(this._canvas);
    const video = mustExist(this._video);

    this._scanning = false;

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    console.log(canvas.width, canvas.height);

    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    this._imageAvailable = true;
    this.dataUrl = canvas.toDataURL("image/jpeg");
  }

  private _retry() {
    const video = mustExist(this._video);

    video.play().catch(console.error);

    this._imageAvailable = false;
    this.dataUrl = null;
  }

  private _abort() {
    this.stop();

    this.dispatchEvent(new CustomEvent("pn-aborted"));
  }

  private _pick() {
    if (!this._imageAvailable) {
      return;
    }

    this.dispatchEvent(new CustomEvent("pn-scanned", { detail: this.dataUrl }));
  }

  render() {
    return [
      html`<div 
        part="base"
        id="scanner"
        class=${classMap({
          scanner: true,
          "scanner--busy": this._busy,
          "scanner--scanning": this._scanning,
          "scanner--image-available": this._imageAvailable,
        })}>
        <div class="top">
          <sl-spinner id="spinner" style="font-size: 3rem;"></sl-spinner>
          <video id="video" @click=${() => this._capture()}></video><canvas id="canvas"></canvas>
        </div>
        <div class="controls">
          <sl-button id="pick-image" variant="success" @click=${() => this._pick()}>${t(
            "scanner.pickImage",
          )}<sl-icon slot="prefix" name="check"></sl-button>
          <sl-button id="click-photo" variant="primary" @click=${() =>
            this._capture()}><sl-icon slot="prefix" name="camera"></sl-icon>${t(
            "scanner.captureImage",
          )}</sl-button>
          <sl-button id="retry" @click=${() => this._retry()}>${t("retry", {
            ns: "common",
          })}<sl-icon slot="suffix" name="arrow-counterclockwise"></sl-icon></sl-button>
          <sl-button id="abort" @click=${() => this._abort()}>${t("cancel", {
            ns: "common",
          })}<sl-icon slot="suffix" name="x"></sl-icon></sl-button>
        </div>
      </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-scanner": PlantScanner;
  }
}
