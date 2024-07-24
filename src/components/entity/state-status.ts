import { mdiShieldCheckOutline, mdiMedicalBag, mdiAlarmLight } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { HomeAssistant } from "../../types";
import "../ha-svg-icon";

// Define the mapping object
const stateToIconMap = {
  ok: mdiShieldCheckOutline,
  medical: mdiMedicalBag,
  wounded: mdiAlarmLight,
};

// Define the color mapping object
const stateToColorMap = {
  ok: "#1DD1A1",
  medical: "#54A0FF",
  wounded: "#EE5253",
};

@customElement("state-status")
class StateStatus extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: any;

  static styles = css`
    .state {
      margin-inline-start: 16px;
      margin-inline-end: initial;
      text-align: var(--float-end, right);
      min-width: 50px;
      flex: 0 1 fit-content;
      word-break: break-word;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      font-weight: bold;
      text-transform: uppercase;
    }
    .icon {
      margin-right: 8px;
    }
  `;

  render() {
    const state = this.hass.formatEntityState(this.stateObj).toLowerCase();
    const iconPath = stateToIconMap[state] || null;
    const stateColor = stateToColorMap[state] || "inherit";

    return html`
      <div class="state ${state}" style="color: ${stateColor}">
        <span class="icon">
          <ha-svg-icon .path=${iconPath}></ha-svg-icon>
        </span>
        <span class="state-text">${state}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-status": StateStatus;
  }
}
