import { mdiShieldCheckOutline, mdiMedicalBag, mdiAlarmLight } from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { HomeAssistant } from "../../types";
import "../ha-svg-icon";

// Define the mapping object
const stateToIconMap = {
  good: mdiShieldCheckOutline,
  medical: mdiMedicalBag,
  danger: mdiAlarmLight,
};

// Define the color mapping object
const stateToColorMap = {
  good: "#4caf50",
  medical: "#ffc107",
  danger: "#f44336",
};

@customElement("state-status")
class StateStatus extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: any;

  static styles = css`
    .state {
      color: #4caf50; //var(--primary-text-color);
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
    const iconPath = stateToIconMap[state] || mdiShieldCheckOutline;
    const stateColor = stateToColorMap[state] || "#4caf50";

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
