import {
  mdiMapMarkerAlert,
  mdiPistol,
  mdiFire,
  mdiMedicalBag,
  mdiWeatherLightningRainy,
  mdiAccountAlert,
  mdiAlert,
} from "@mdi/js";

import { CSSResultGroup, LitElement, css, html } from "lit";
import { property, state } from "lit/decorators";
import "./ha-svg-icon";
import { HomeAssistant } from "../types";

class ClassroomHeaderSection extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @state() private roomName: string = "room_111";

  @state() private storedValue: string = "";

  connectedCallback() {
    super.connectedCallback();
    this._getStoredValue();
    this._subscribeToStateChanges();
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    if (this._unsub) {
      this._unsub();
    }
  }

  private _getStoredValue() {
    const entityId = "input_text.command_store";
    const entity = this.hass.states[entityId];

    if (entity) {
      try {
        this.storedValue = JSON.parse(entity.state);
      } catch (err) {
        handleError(err);
      }
    }
  }

  private _subscribeToStateChanges() {
    this._unsub = this.hass.connection.subscribeMessage(
      (message) => {
        const entityId = "input_text.command_store";
        const event = message.event;

        if (event && event.data.entity_id === entityId) {
          try {
            this.storedValue = JSON.parse(event.data.new_state.state);
          } catch (error) {
            handleError("Failed to parse stored value:", error);
          }
        }
      },
      {
        type: "subscribe_events",
        event_type: "state_changed",
      }
    );
  }

  protected render() {
    return html`
      <div class="static-section">
        <div class="card-static advisor-section">
          <div class="avatar-section">
            <div class="avatar"></div>
            <div class="text-description">
              <h4 class="section-info">CLASSROOM #203</h4>
              <p class="advisor-name">Myra T. Aguirre</p>
              <p class="department">Science Department</p>
            </div>
          </div>
        </div>
        <div class="card-static quick-action-buttons">
          <div class="grid">
            <h3 class="header-section">
              <span
                ><ha-svg-icon
                  .path=${mdiMapMarkerAlert}
                  .width=${32}
                  .height=${32}
                ></ha-svg-icon></span
              >INITIATE EMERGENCY :
              <span>${(this.storedValue?.value || "").toUpperCase()}</span>
            </h3>
          </div>

          <div class="row">
            <mwc-button
              class="status-button weapon"
              id="room_status_${this.roomName}_state_weapon"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiPistol}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Weapon</span>
              </div>
            </mwc-button>

            <mwc-button
              class="status-button fire"
              id="room_status_${this.roomName}_state_fire"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiFire}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Fire</span>
              </div>
            </mwc-button>

            <mwc-button
              class="status-button medical"
              id="room_status_${this.roomName}_state_medical"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiMedicalBag}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Medical</span>
              </div>
            </mwc-button>

            <mwc-button
              class="status-button weather"
              id="room_status_${this.roomName}_state_weather"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiWeatherLightningRainy}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Weather</span>
              </div>
            </mwc-button>

            <mwc-button
              class="status-button suspicious"
              id="room_status_${this.roomName}_state_suspicious"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiAccountAlert}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Suspicious</span>
              </div>
            </mwc-button>

            <mwc-button
              class="status-button conflict"
              id="room_status_${this.roomName}_state_conflict"
              @click=${this._sendRoomStatus}
              ><div class="content-wrapper">
                <span
                  ><ha-svg-icon
                    .path=${mdiAlert}
                    .width=${28}
                    .height=${28}
                  ></ha-svg-icon
                ></span>
                <span>Conflict</span>
              </div>
            </mwc-button>
          </div>
        </div>
      </div>
    `;
  }

  private _sendRoomStatus(ev: MouseEvent) {
    const button = ev.currentTarget as HTMLButtonElement;
    const status = button.id.split("_").pop();

    this.storedValue.roomStatus = status;

    const data = {
      ...this.storedValue,
    };

    this.hass.callService = this.hass.callService.bind(this.hass);
    this.hass.callService("input_text", "set_value", {
      entity_id: "input_text.command_store",
      value: JSON.stringify(data),
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      .static-section {
        display: flex;
        padding: var(--row-gap) var(--column-gap);

        .grid {
          border-radius: 8px 8px 0 0;
          background-color: #e83425;
          text-align: center;
        }

        .row {
          display: flex;
          justify-content: space-between; /* Adjusts spacing between buttons */
          margin: 16px; /* Adds spacing between rows */
        }

        .card-static {
          border-radius: var(--ha-card-border-radius, 12px);
          box-shadow: var(--ha-card-box-shadow);
          border: 1px solid var(--divider-color);
          margin: 8px;
          padding: 16px;

          &.advisor-section {
            width: 30%;
            max-width: 800px;
            display: flex;
            align-items: center;

            .section-info {
              margin: 4px;
            }

            p {
              margin: 0 0 0 4px;

              &.department {
                font-size: 12px;
                color: var(--secondary-text-color);
              }
            }

            .avatar-section {
              display: flex;
              align-items: center;

              .avatar {
                width: 120px;
                height: 120px;
                background-image: url("http://localhost:8123/api/image/serve/96e278fde858dfa0082a3b166438899b/512x512");
                background-size: cover;
                background-position: center;
                border-radius: 50%;
                margin-right: 16px;
              }

              .text-description {
                font-size: 16px;
                color: var(--primary-text-color);
              }
            }
          }

          &.quick-action-buttons {
            width: 70%;
            padding: 0;

            .header-section {
              padding: 16px;
              margin: 0;
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
              color: white;
              border-radius: 8px;
              transition:
                background-color 0.3s,
                border-color 0.3s;

              .content-wrapper {
                display: flex;
                flex-direction: column;
                align-items: center;
                color: white;
              }

              &.weapon {
                background-color: #ed5d5d;
              }
              &.fire {
                background-color: #faa84f;
              }
              &.medical {
                background-color: #6fa1d6;
              }
              &.weather {
                background-color: #9689c1;
              }
              &.suspicious {
                background-color: #00abac;
              }
              &.conflict {
                background-color: #d17cb3;
              }
            }
          }
        }
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-classroom-header-section": ClassroomHeaderSection;
  }
}

customElements.define("ha-classroom-header-section", ClassroomHeaderSection);
