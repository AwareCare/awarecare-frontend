import {
  css,
  CSSResultGroup,
  LitElement,
  nothing,
  svg,
  SVGTemplateResult,
} from "lit";
import { customElement, property, state } from "lit/decorators";

@customElement("ha-svg-icon")
export class HaSvgIcon extends LitElement {
  @property() public path?: string;

  @property({ attribute: "secondary-path" }) public secondaryPath?: string;

  @property({ attribute: "view-box" }) public viewBox?: string;

  @property({ type: Number }) public height?: number;

  @property({ type: Number }) public width?: number;

  @state() public _width = 24;

  @state() public _height = 24;

  protected updated(changedProperties: Map<string, unknown>): void {
    if (changedProperties.has("height")) {
      this._height = this.height || 24;
    }
    if (changedProperties.has("width")) {
      this._width = this.width || 24;
    }
  }

  protected render(): SVGTemplateResult {
    return svg`
    <svg
      viewBox=${this.viewBox || "0 0 24 24"}
      preserveAspectRatio="xMidYMid meet"
      focusable="false"
      role="img"
      aria-hidden="true"
      height=${this._height}
      width=${this._width}
    >
      <g>
        ${
          this.path
            ? svg`<path class="primary-path" d=${this.path}></path>`
            : nothing
        }
        ${
          this.secondaryPath
            ? svg`<path class="secondary-path" d=${this.secondaryPath}></path>`
            : nothing
        }
      </g>
    </svg>`;
  }

  static get styles(): CSSResultGroup {
    return css`
      :host {
        display: var(--ha-icon-display, inline-flex);
        align-items: center;
        justify-content: center;
        position: relative;
        vertical-align: middle;
        fill: var(--icon-primary-color, currentcolor);
        width: var(--mdc-icon-size, width || 24px);
        height: var(--mdc-icon-size, height || 24px);
      }
      svg {
        width: 100%;
        height: 100%;
        pointer-events: none;
        display: block;
      }
      path.primary-path {
        opacity: var(--icon-primary-opactity, 1);
      }
      path.secondary-path {
        fill: var(--icon-secondary-color, currentcolor);
        opacity: var(--icon-secondary-opactity, 0.5);
      }
    `;
  }
}
declare global {
  interface HTMLElementTagNameMap {
    "ha-svg-icon": HaSvgIcon;
  }
}
