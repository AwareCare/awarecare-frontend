/* eslint-disable lit/no-template-arrow */
import {
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
import isEmpty from "lodash/isEmpty";
import { HomeAssistant } from "../types";

class ClassroomHeaderSection extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: "on-status-updated", type: Object })
  public onStatusUpdated!: () => void;

  @state() private entityId: string =
    "room." + window.location.pathname.split("/")[2];

  @state() private updatedCommand: string = "";

  @state() private roomAttributes: { response?: string } = {};

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
        this.roomAttributes = entity?.attributes as { response?: string };
        this.updatedCommand = entity.state || "";
      } catch (err) {
        this.handleError(err);
      }
    }
  }

  private _subscribeToStateChanges() {
    const subscribeEvent = {
      id: 1,
      type: "subscribe_events",
      event_type: "state_changed",
    };

    if (this.hass.connection.socket) {
      this.hass.connection.socket.send(JSON.stringify(subscribeEvent));

      this.hass.connection.socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        if (
          message.type === "event" &&
          message.event.c &&
          this.roomAttributes !== this.roomAttributes.response
        ) {
          const updatedEntity = message.event.c[this.entityId];

          if (updatedEntity && updatedEntity["+"].s) {
            const newCommand = updatedEntity["+"].s;

            this.updatedCommand = newCommand;

            if (this.onStatusUpdated) {
              this.onStatusUpdated();
            }
          }
        }
      });
    }
  }

  private async updateClassRoomStatus(response: string) {
    const stateObj = this.hass.states[this.entityId];

    const state_attributes = stateObj.attributes;

    try {
      await this.hass.callApi("POST", "states/" + this.entityId, {
        state: response,
        attributes: state_attributes,
      });
      this.onStatusUpdated = () => {};
    } catch (e: any) {
      throw e.body?.message || e.message || "Unknown error";
    }
  }

  private handleError(error: any) {
    throw error;
  }

  protected render() {
    return html`
      <div class="static-section">
        <div class="card-static advisor-section">
          <div class="avatar-section">
            <div class="avatar"></div>
            <div class="text-description">
              <h4 class="section-info">CLASSROOM #111</h4>
              <p class="advisor-name">Myra T. Aguirre</p>
              <p class="department">Science Department</p>
            </div>
          </div>
        </div>
        <div class="card-static quick-action-buttons">
          <div class="grid">
            <h2
              class="header-section"
              style="background-color: ${this.updatedCommand
                ? this.responseBtnMapping[this.updatedCommand]?.color
                : "transparent"};"
            >
              ${isEmpty(this.updatedCommand)
                ? html`<p>INITIATE EMERGENCY</p>`
                : html`<p class="hasResponse">
                    ${this.responseBtnMapping[
                      this.updatedCommand
                    ]?.label.toUpperCase()}
                  </p>`}
            </h2>
          </div>

          <div class="row">
            ${Object.entries(this.responseBtnMapping).map(
              ([key, item]) =>
                html`<button
                  class="status-button ${key === this.updatedCommand
                    ? "active"
                    : this.updatedCommand !== "0"
                      ? "dark"
                      : ""}"
                  key=${key}
                  @click=${() => this.updateClassRoomStatus(key)}
                >
                  <div class="content-wrapper ${key}">
                    <span
                      ><ha-svg-icon
                        .path=${item.icon}
                        .width=${28}
                        .height=${28}
                      ></ha-svg-icon
                    ></span>
                    <span>${item.label}</span>
                  </div>
                </button>`
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
      }
      .static-section .grid {
        border-radius: 8px 8px 0 0;
        text-align: center;
      }
      .static-section .row {
        display: flex;
        justify-content: space-between;
        margin: 16px;
      }
      .static-section .card-static {
        border-radius: var(--ha-card-border-radius, 12px);
        box-shadow: var(--ha-card-box-shadow);
        border: 1px solid #6b8488;
        margin: 8px;
        padding: 16px;
      }
      .static-section .card-static.advisor-section {
        width: 30%;
        max-width: 800px;
        display: flex;
        align-items: center;
      }
      .static-section .card-static.advisor-section .section-info {
        margin: 4px;
      }
      .static-section .card-static.advisor-section p {
        margin: 0 0 0 4px;
      }
      .static-section .card-static.advisor-section p.department {
        font-size: 12px;
        color: var(--secondary-text-color);
      }
      .static-section .card-static.advisor-section .avatar-section {
        display: flex;
        align-items: center;
      }
      .static-section .card-static.advisor-section .avatar-section .avatar {
        width: 120px;
        height: 120px;
        background-image: url("http://localhost:8123/api/image/serve/69637b27fc0c59baf0c74141c6acf00f/512x512");
        background-size: cover;
        background-position: center;
        border-radius: 50%;
        margin-right: 16px;
      }
      .static-section
        .card-static.advisor-section
        .avatar-section
        .text-description {
        font-size: 16px;
        color: var(--primary-text-color);
      }
      .static-section .card-static.quick-action-buttons {
        width: 70%;
        padding: 0;
        border-top: 12px solid #ff3d19;
      }
      .static-section .card-static.quick-action-buttons .header-section {
        margin: 0;
      }
      .static-section .card-static.quick-action-buttons .header-section p {
        padding: 8px;
        margin: 0;
      }
      .static-section .card-static.quick-action-buttons .status-button {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 80px;
        flex: 1 1 calc(33.333% - 8px);
        margin-right: 8px;
        border: 1px solid #e1e1e1 1f;
        color: white;
        border-radius: 8px;
        transition:
          background-color 0.3s,
          border-color 0.3s;
        background-color: #212222;
        width: 140px;
        cursor: pointer;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        color: white;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.weapon {
        color: #ed5d5d;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.fire {
        color: #faa84f;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.medical {
        color: #6fa1d6;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.weather {
        color: #9689c1;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.suspicious {
        color: #00abac;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button
        .content-wrapper.conflict {
        color: #d17cb3;
      }
      .static-section .card-static.quick-action-buttons .status-button:hover {
        background-color: #2e2e2e;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark {
        background-color: #212222;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.weapon {
        color: #ed5d5d;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.fire {
        color: #faa84f;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.medical {
        color: #6fa1d6;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.weather {
        color: #9689c1;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.suspicious {
        color: #00abac;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button:hover.dark
        .content-wrapper.conflict {
        color: #d17cb3;
      }
      .static-section .card-static.quick-action-buttons .status-button.dark {
        background-color: #212222;
      }
      .static-section
        .card-static.quick-action-buttons
        .status-button.dark
        .content-wrapper {
        color: #3d4141;
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
