/* eslint-disable lit/no-template-arrow */
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

  @property({ attribute: "on-status-updated", type: Object })
  public onStatusUpdated!: () => void;

  @state() private entityId: string =
    "room." + window.location.pathname.split("/")[2];

  @state() private updatedCommand: string = "";

  @state() private roomAttributes: object = {};

  private _unsub?: () => void;

  responseBtnMapping = {
    weapon: {
      color: "#ed5d5d",
      label: "Weapon",
      icon: mdiPistol,
    },
    fire: {
      color: "#faa84f",
      label: "Fire",
      icon: mdiFire,
    },
    medical: {
      color: "#6fa1d6",
      label: "Medical",
      icon: mdiMedicalBag,
    },
    weather: {
      color: "#9689c1",
      label: "Weather",
      icon: mdiWeatherLightningRainy,
    },
    suspicious: {
      color: "#00abac",
      label: "Suspicious",
      icon: mdiAccountAlert,
    },
    conflict: {
      color: "#d17cb3",
      label: "Conflict",
      icon: mdiAlert,
    },
  };

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
    const entity = this.hass.states[this.entityId];

    if (entity) {
      try {
        this.roomAttributes = entity?.attributes;
        this.updatedCommand = this.roomAttributes.command;
      } catch (err) {
        handleError(err);
      }
    }
  }

  private _subscribeToStateChanges() {
    const subscribeEvent = {
      id: 1,
      type: "subscribe_events",
      event_type: "state_changed",
    };

    this.hass.connection.socket.send(JSON.stringify(subscribeEvent));

    this.hass.connection.socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);

      if (
        message.type === "event" &&
        message.event.c &&
        this.roomAttributes !== this.roomAttributes.command
      ) {
        const updatedEntity = message.event.c["room.room_111"];

        if (updatedEntity && updatedEntity["+"]) {
          const newCommand = updatedEntity["+"].a.command;

          this.updatedCommand = newCommand;

          if (this.onStatusUpdated) {
            this.onStatusUpdated();
          }
        }
      }
    });
  }

  private async updateClassRoomStatus(response: string) {
    this._error = "";

    const stateObj = this.hass.states[this.entityId];
    const state_attributes = stateObj.attributes;

    state_attributes.response = response;
    try {
      await this.hass.callApi("POST", "states/" + this.entityId, {
        state: stateObj.state,
        attributes: state_attributes,
      });
      this.onStatusUpdated();
    } catch (e: any) {
      this._error = e.body?.message || "Unknown error";
    }
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
              <span>${this.updatedCommand.toUpperCase()}</span>
            </h3>
          </div>

          <div class="row">
            ${Object.entries(this.responseBtnMapping).map(
              ([key, item]) =>
                html`<mwc-button
                  class="status-button ${key}"
                  key=${key}
                  @click=${() => this.updateClassRoomStatus(key)}
                  ><div class="content-wrapper">
                    <span
                      ><ha-svg-icon
                        .path=${item.icon}
                        .width=${28}
                        .height=${28}
                      ></ha-svg-icon
                    ></span>
                    <span>${item.label}</span>
                  </div>
                </mwc-button>`
            )}
          </div>
        </div>
      </div>
    `;
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
