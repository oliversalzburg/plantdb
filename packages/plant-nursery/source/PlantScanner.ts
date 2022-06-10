import { SlSpinner } from "@shoelace-style/shoelace";
import { t } from "i18next";
import { css, html, LitElement } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { mustExist } from "./tools/Maybe";

@customElement("pn-plant-scanner")
export class PlantScanner extends LitElement {
  static readonly styles = [
    css`
      :host {
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

      #spinner {
        position: absolute;
      }

      #video {
        width: 100%;
      }
    `,
  ];

  @query("#spinner")
  private _spinner: SlSpinner | null | undefined;
  @query("#video")
  private _video: HTMLVideoElement | null | undefined;
  @query("#canvas")
  private _canvas: HTMLCanvasElement | null | undefined;
  @query("#pick-image")
  private _pickImageButton: HTMLButtonElement | null | undefined;
  @query("#click-photo")
  private _clickPhotoButton: HTMLButtonElement | null | undefined;
  @query("#retry")
  private _retryButton: HTMLButtonElement | null | undefined;
  @query("#abort")
  private _abortButton: HTMLButtonElement | null | undefined;

  private _mediaStream: MediaStream | null = null;

  @state()
  private _imageAvailable = false;

  @property()
  dataUrl: string | null = null;

  stop(): void {
    mustExist(this._video).pause();

    this._mediaStream?.getTracks().forEach(track => track.stop());
  }

  start() {
    const canvas = mustExist(this._canvas);
    const video = mustExist(this._video);

    mustExist(this._clickPhotoButton).style.display = "";
    mustExist(this._abortButton).style.display = "";
    mustExist(this._pickImageButton).style.display = "none";
    mustExist(this._retryButton).style.display = "none";

    canvas.style.display = "none";
    video.style.display = "unset";

    this._getMediaStream()
      .then(mediaStream => {
        mustExist(this._spinner).style.display = "none";
        this._mediaStream = mediaStream;
        video.srcObject = mediaStream;
        video.onloadedmetadata = () => {
          video
            .play()
            .then(() => {
              canvas.width = video.clientWidth;
              canvas.height = video.clientHeight;
            })
            .catch(console.error);
        };
      })
      .catch(console.error);
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
    }
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

    canvas.width = video.clientWidth;
    canvas.height = video.clientHeight;

    console.log(canvas.width, canvas.height);

    canvas.getContext("2d")?.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.style.display = "";
    video.style.display = "none";
    mustExist(this._clickPhotoButton).style.display = "none";
    mustExist(this._abortButton).style.display = "none";
    mustExist(this._pickImageButton).style.display = "";
    mustExist(this._retryButton).style.display = "";

    this._imageAvailable = true;
    this.dataUrl = canvas.toDataURL("image/jpeg");
  }

  private _retry() {
    const canvas = mustExist(this._canvas);
    const video = mustExist(this._video);

    canvas.style.display = "none";
    video.style.display = "block";
    mustExist(this._clickPhotoButton).style.display = "";
    mustExist(this._abortButton).style.display = "";
    mustExist(this._pickImageButton).style.display = "none";
    mustExist(this._retryButton).style.display = "none";

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
      html`<div class="top">
          <sl-spinner id="spinner" style="font-size: 3rem;"></sl-spinner>
          <video id="video" @click=${() => this._capture()}></video><canvas id="canvas"></canvas>
        </div>
        <div class="controls">
          <sl-button id="pick-image" variant="success" @click=${() => this._pick()}
            >${t("scanner.pickImage")}<sl-icon slot="prefix" name="check"></sl-button
          ><sl-button id="click-photo" variant="primary" @click=${() => this._capture()}
            ><sl-icon slot="prefix" name="camera"></sl-icon>${t("scanner.captureImage")}</sl-button
          ><sl-button id="retry" @click=${() => this._retry()}>${t("retry", {
        ns: "common",
      })}<sl-icon slot="suffix" name="arrow-counterclockwise"></sl-icon></sl-button
          ><sl-button id="abort" @click=${() => this._abort()}>${t("cancel", {
        ns: "common",
      })}<sl-icon slot="suffix" name="x"></sl-icon></sl-button>
        </div>`,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "pn-plant-scanner": PlantScanner;
  }
}
