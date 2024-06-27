import type { HassEntity } from "home-assistant-js-websocket";
import { css, CSSResultGroup, html, LitElement, TemplateResult } from "lit";
import { customElement, property } from "lit/decorators";
import "../components/entity/state-info";
import "../components/entity/state-status";
import "../panels/lovelace/components/hui-timestamp-display";
import { haStyle } from "../resources/styles";
import type { HomeAssistant } from "../types";

@customElement("state-card-display")
class StateCardDisplay extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: false }) public stateObj!: HassEntity;

  @property({ type: Boolean }) public inDialog = false;

  // property used only in CSS
  @property({ type: Boolean, reflect: true }) public rtl = false;

  protected render(): TemplateResult {
    return html`
      <div class="horizontal justified layout">
        <state-info
          .hass=${this.hass}
          .stateObj=${this.stateObj}
          .inDialog=${this.inDialog}
        >
        </state-info>

        <div>
          <state-status .hass=${this.hass} .stateObj=${this.stateObj}>
          </state-status>
        </div>
      </div>
    `;
  }

  static get styles(): CSSResultGroup {
    return [
      haStyle,
      css`
        state-info {
          flex: 0 1 fit-content;
          min-width: 120px;
        }
        .state.has-unit_of_measurement {
          white-space: nowrap;
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "state-card-display": StateCardDisplay;
  }
}
