/* eslint-disable lit/no-template-arrow */
import { html, LitElement, css } from "lit";
import { property, state } from "lit/decorators";
import {
  mdiCheckDecagram,
  mdiMedicalBag,
  mdiBandage,
  mdiSchool,
  mdiAccountAlert,
  mdiAccountCancel,
} from "@mdi/js";
import { HomeAssistant } from "../types";

import "./ha-svg-icon";

class QuickActionButtons extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: "entity-id" }) public entityId!: string;

  @state() private _error!: string;

  private async updatePersonStatus(status: string) {
    this._error = "";

    const stateObj = this.hass.states[this.entityId];
    const state_attributes = stateObj.attributes;

    state_attributes.status = status;

    try {
      await this.hass.callApi("POST", "states/" + this.entityId, {
        state: stateObj.state,
        attributes: state_attributes,
      });
    } catch (e: any) {
      this._error = e.body?.message || "Unknown error";
    }
  }

  protected render() {
    return html`
      <hr style="border-color: #000000" />
      <div class="row">
        <mwc-button
          class="status-button wounded"
          @click=${() => this.updatePersonStatus("wounded")}
        >
          <div class="content-wrapper">
            <span
              ><ha-svg-icon
                .path=${mdiBandage}
                .width=${38}
                .height=${38}
              ></ha-svg-icon
            ></span>
            <span>Wounded</span>
          </div>
        </mwc-button>
        <mwc-button
          class="status-button medical"
          @click=${() => this.updatePersonStatus("medical")}
          ><div class="content-wrapper">
            <span
              ><ha-svg-icon
                .path=${mdiMedicalBag}
                .width=${38}
                .height=${38}
              ></ha-svg-icon
            ></span>
            <span>Medical Alert</span>
          </div>
        </mwc-button>
        <mwc-button
          class="status-button disciplinary"
          @click=${() => this.updatePersonStatus("disciplinary")}
          ><div class="content-wrapper">
            <span
              ><ha-svg-icon
                .path=${mdiSchool}
                .width=${38}
                .height=${38}
              ></ha-svg-icon
            ></span>
            <span>Disciplinary</span>
          </div></mwc-button
        >
      </div>
      <div class="row">
        <mwc-button
          class="status-button unaccounted"
          @click=${() => this.updatePersonStatus("unaccounted")}
          ><div class="content-wrapper">
            <span
              ><ha-svg-icon
                .path=${mdiAccountAlert}
                .width=${38}
                .height=${38}
              ></ha-svg-icon
            ></span>
            <span>Unaccounted</span>
          </div></mwc-button
        >
        <mwc-button
          class="status-button absent"
          @click=${() => this.updatePersonStatus("absent")}
          ><div class="content-wrapper">
            <span
              ><ha-svg-icon
                .path=${mdiAccountCancel}
                .width=${38}
                .height=${38}
              ></ha-svg-icon
            ></span>
            <span>Absent</span>
          </div></mwc-button
        >
        <mwc-button
          class="status-button ok"
          @click=${() => this.updatePersonStatus("ok")}
        >
          <div class="content-wrapper">
            <span>
              <ha-svg-icon
                .path=${mdiCheckDecagram}
                .width=${38}
                .height=${38}
              ></ha-svg-icon>
            </span>
            <span>Okay</span>
          </div>
        </mwc-button>
      </div>
    `;
  }

  static get styles() {
    return css`
      .row {
        display: flex;
        justify-content: space-between; /* Adjusts spacing between buttons */
        margin: 16px; /* Adds spacing between rows */
      }
      .content-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
      }
      .status-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80px;
        flex: 1 1 calc(33.333% - 8px);
        margin-right: 8px;
        border: 1px solid #e1e1e11f;
        border-radius: 8px;
        transition:
          background-color 0.3s,
          border-color 0.3s;
      }
      .status-button:last-child {
        margin-right: 0;
      }
      .status-button:hover {
        background-color: #f0f0f08c;
      }

      /* Define CSS variables within the component */
      .status-button.ok {
        --status-color: #1dd1a1;
        border-color: var(--status-color);
      }
      .status-button.ok .content-wrapper {
        color: var(--status-color);
      }

      .status-button.medical {
        --status-color: #54a0ff;
        border-color: var(--status-color);
      }
      .status-button.medical .content-wrapper {
        color: var(--status-color);
      }

      .status-button.wounded {
        --status-color: #ee5253;
        border-color: var(--status-color);
      }
      .status-button.wounded .content-wrapper {
        color: var(--status-color);
      }

      .status-button.disciplinary {
        --status-color: #f368e0;
        border-color: var(--status-color);
      }
      .status-button.disciplinary .content-wrapper {
        color: var(--status-color);
      }

      .status-button.unaccounted {
        --status-color: #01a3a4;
        border-color: var(--status-color);
      }
      .status-button.unaccounted .content-wrapper {
        color: var(--status-color);
      }

      .status-button.absent {
        --status-color: #666666;
        border-color: var(--status-color);
      }
      .status-button.absent .content-wrapper {
        color: var(--status-color);
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "quick-action-buttons": QuickActionButtons;
  }
}

customElements.define("quick-action-buttons", QuickActionButtons);
