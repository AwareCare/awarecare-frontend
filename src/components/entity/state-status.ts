import {
  mdiCheckDecagram,
  mdiMedicalBag,
  mdiBandage,
  mdiSchool,
  mdiAccountAlert,
  mdiAccountCancel,
} from "@mdi/js";
import { css, html, LitElement } from "lit";
import { customElement, property } from "lit/decorators";
import type { HomeAssistant } from "../../types";
import "../ha-svg-icon";

const stateInfoMap = {
  ok: { color: "#1DD1A1", icon: mdiCheckDecagram },
  medical: { color: "#54A0FF", icon: mdiMedicalBag },
  wounded: { color: "#ee5253", icon: mdiBandage },
  disciplinary: { color: "#F368E0", icon: mdiSchool },
  unaccounted: { color: "#01A3A4", icon: mdiAccountAlert },
  absent: { color: "#666666", icon: mdiAccountCancel },
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

    .state-type-text {
      font-size: 11px;
      font-weight: bold;
      text-transform: uppercase;
      text-align: right;
      color: gray;
    }
  `;

  render() {
    const stateClass = this.stateObj?.attributes?.status.toLowerCase();
    const stateInfo = stateInfoMap[stateClass];
    const stateColor = stateInfo?.color || "#C8D6E5";
    const stateIcon = stateInfo?.icon || mdiCheckDecagram;

    const contextClass = this.stateObj?.attributes?.context?.toLowerCase();
    // const contextInfo = stateInfoMap[contextClass];
    // const contextColor = stateInfo?.color || "#C8D6E5";
    // const contextIcon = contextIcon?.icon || mdiCheckDecagram;

    return html`
      <div class="state ${stateClass}" style="color: ${stateColor}">
        <span class="icon">
          <ha-svg-icon .path=${stateIcon}></ha-svg-icon>
        </span>
        <span class="state-text">${stateClass}</span>
      </div>
      <div class="state-type-text">
        <span class="state-type-text">${contextClass}</span>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-status": StateStatus;
  }
}
