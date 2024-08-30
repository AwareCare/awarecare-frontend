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
  mdiArrowLeft,
  mdiAlertDecagram,
  mdiAccountArrowDown,
  mdiPeanutOff,
  mdiLungs,
  mdiKarate,
  mdiKnife,
  mdiCannabis,
  mdiCalendar,
} from "@mdi/js";
import { HomeAssistant } from "../types";

import "./ha-svg-icon";

class QuickActionButtons extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ attribute: "entity-id" }) public entityId!: string;

  @property({ attribute: "on-status-updated", type: Object })
  public onStatusUpdated!: () => void;

  @state() private _error!: string;

  @state() private isFollowupAction = false;

  @state() private updatedStatus = "";

  followActions = ["medical", "disciplinary"];

  buttonMapping = {
    wounded: {
      color: "#ee5253",
      label: "Wounded",
      icon: mdiBandage,
    },
    medical: {
      color: "#54a0ff",
      label: "Medical Alert",
      icon: mdiMedicalBag,
      actionsButtons: {
        seizure: {
          icon: mdiAlertDecagram,
          label: "Seizure",
        },
        unresponsive: {
          icon: mdiAccountArrowDown,
          label: "Unresponsive",
        },
        allergic: {
          icon: mdiPeanutOff,
          label: "Allergic",
        },
        troubleBreathing: {
          icon: mdiLungs,
          label: "Breathing",
        },
      },
    },
    disciplinary: {
      color: "#f368e0",
      label: "Disciplinary",
      icon: mdiSchool,
      actionsButtons: {
        figthing: {
          icon: mdiKarate,
          label: "Fighting",
        },
        weapons: {
          icon: mdiKnife,
          label: "Weapons",
        },
        drugs: {
          icon: mdiCannabis,
          label: "Drugs",
        },
        truancy: {
          icon: mdiCalendar,
          label: "Truancy",
        },
      },
    },

    unaccounted: {
      color: "#01a3a4",
      label: "Unaccounted",
      icon: mdiAccountAlert,
    },
    absent: {
      color: "#666666",
      label: "Absent",
      icon: mdiAccountCancel,
    },
    ok: {
      color: "#1dd1a1",
      label: "Okay",
      icon: mdiCheckDecagram,
    },
  };

  private async updatePersonStatus(status: string) {
    this._error = "";
    this.updatedStatus = status;

    const stateObj = this.hass.states[this.entityId];
    const state_attributes = stateObj.attributes;

    state_attributes.status = status;
    try {
      await this.hass.callApi("POST", "states/" + this.entityId, {
        state: stateObj.state,
        attributes: state_attributes,
      });

      if (this.followActions.includes(status)) {
        this.isFollowupAction = true;
      }

      this.onStatusUpdated();
    } catch (e: any) {
      this._error = e.body?.message || "Unknown error";
    }
  }

  private resetActions = () => {
    this.isFollowupAction = false;
  };

  protected render() {
    return html`
      <hr style="border-color: #000000" />
      <div>
        ${!this.isFollowupAction
          ? html`
              <div class="row">
                ${Object.entries(this.buttonMapping)
                  .slice(0, 3)
                  .map(
                    ([key, item]) =>
                      html` <mwc-button
                        class="status-button ${key}"
                        key=${key}
                        @click=${() => this.updatePersonStatus(key)}
                      >
                        <div class="content-wrapper">
                          <span>
                            <ha-svg-icon
                              .path=${item.icon}
                              .width=${38}
                              .height=${38}
                            ></ha-svg-icon>
                          </span>
                          <span>${item.label}</span>
                        </div>
                      </mwc-button>`
                  )}
              </div>
              <div class="row">
                ${Object.entries(this.buttonMapping)
                  .slice(3, 6)
                  .map(
                    ([key, item]) =>
                      html` <mwc-button
                        class="status-button ${key}"
                        key=${key}
                        @click=${() => this.updatePersonStatus(key)}
                      >
                        <div class="content-wrapper">
                          <span>
                            <ha-svg-icon
                              .path=${item.icon}
                              .width=${38}
                              .height=${38}
                            ></ha-svg-icon>
                          </span>
                          <span>${item.label}</span>
                        </div>
                      </mwc-button>`
                  )}
              </div>
            `
          : html`
              <div class="followup-action-container">
                <div class="row">
                  ${Object.entries(
                    this.buttonMapping[this.updatedStatus].actionsButtons
                  ).map(
                    ([key, item]) =>
                      html` <mwc-button
                        class="status-button ${this.updatedStatus}"
                        key=${key}
                      >
                        <div class="content-wrapper">
                          <span>
                            <ha-svg-icon
                              .path=${item.icon}
                              .width=${38}
                              .height=${38}
                            ></ha-svg-icon>
                          </span>
                          <span>${item.label}</span>
                        </div>
                      </mwc-button>`
                  )}
                </div>
                <div class="row">
                  <mwc-button
                    class="back-button"
                    @click=${() => this.resetActions()}
                  >
                    <div class="content-wrapper-back">
                      <ha-svg-icon .path=${mdiArrowLeft}></ha-svg-icon>
                      <span>Back</span>
                    </div>
                  </mwc-button>
                </div>
              </div>
            `}
      </div>
    `;
  }

  static get styles() {
    return css`
      .row {
        display: flex;
        justify-content: space-between;
        margin: 16px;
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

      .followup-action-container {
        --status-color: #e1e1e11f;
        border-color: var(--status-color);

        .back-button {
          border: 1px solid var(--status-color);
          border-radius: 8px;
          width: 100%;

          .content-wrapper-back {
            color: #e1e1e1;
            ha-svg-icon {
              margin-right: 8px;
            }
          }
        }
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
