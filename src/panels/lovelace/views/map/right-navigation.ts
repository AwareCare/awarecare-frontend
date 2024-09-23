import { html, LitElement, css, CSSResultGroup } from "lit";
import { property, state } from "lit/decorators";

import {
  mdiChevronRight,
  mdiChevronDown,
  mdiFormatQuoteOpen,
  mdiSend,
  mdiPistol,
  mdiFire,
  mdiMedicalBag,
  mdiWeatherLightningRainy,
  mdiAccountAlert,
  mdiAlert,
} from "@mdi/js";

import "../../../../components/ha-svg-icon";

import { HomeAssistant } from "../../../../types";
import { sortRoomsByResponse } from "../../../../util/sorting-utils";
import { stateIconMap } from "../../../../common/entity/state-icon-map";

import "./dialog-command";

class MapRightNavigation extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Object, attribute: "room-attributes" })
  public roomAttributes!: { [key: string]: any };

  @property({ attribute: "clicked-room" }) public clickedRoom!: string;

  @state() private roomIds: string[] = [];

  @state() private roomsEntities: object = {};

  @state() private dialogOpen: boolean = false;

  @state() private dialogRoomName: string = "";

  firstUpdated() {
    this.addAccordionListeners();
  }

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    if (changedProperties.has("clickedRoom") && this.clickedRoom) {
      // Find the accordion item associated with clickedRoom
      const accordionItem = this.shadowRoot!.querySelector(
        `.accordion-item.${this.clickedRoom}`
      ) as HTMLElement;

      if (accordionItem) {
        this.openAccordionItem(accordionItem);
      }
    }
  }

  private openAccordionItem(accordionItem: HTMLElement): void {
    const header = accordionItem.querySelector(".accordion-header");
    if (header) {
      this.toggleAccordionContent(header as HTMLElement);
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._getStoredValue();
    this._subscribeToStateChanges();
  }

  private _getStoredValue() {
    this.roomIds = Object.keys(this.hass.states).filter((entityId) =>
      entityId.startsWith("room.room")
    );

    const roomsUnsorted = {};

    this.roomIds.forEach((entityId) => {
      const entity = this.hass.states[entityId];

      if (entity) {
        try {
          roomsUnsorted[entityId] = entity.attributes;
        } catch (err) {
          this.handleError(err);
        }
      }
    });

    this.roomsEntities = sortRoomsByResponse(roomsUnsorted);
  }

  private _subscribeToStateChanges() {
    const subscribeEvent = {
      id: 1,
      type: "subscribe_events",
      event_type: "state_changed",
    };

    if (this.hass?.connection?.socket) {
      this.hass.connection.socket.send(JSON.stringify(subscribeEvent));

      this.hass.connection.socket.addEventListener("message", (event) => {
        const message = JSON.parse(event.data);

        if (message.type === "event" && message.event.c) {
          const updatedEntity = message.event.c;

          if (updatedEntity) {
            this._getStoredValue();
            this.requestUpdate();
          }
        }
      });
    }
  }

  private handleError(error: any) {
    throw error;
  }

  // Function to map response values to icons
  protected mapResponseToIcon(response: string): string {
    switch (response) {
      case "weapon":
        return mdiPistol;
      case "fire":
        return mdiFire;
      case "medical":
        return mdiMedicalBag;
      case "weather":
        return mdiWeatherLightningRainy;
      case "suspicious":
        return mdiAccountAlert;
      case "conflict":
        return mdiAlert;
      default:
        return "";
    }
  }

  private _openDialog(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const entityId = target.getAttribute("id");

    this.dialogOpen = true;
    if (entityId) {
      this.dialogRoomName = entityId;
    }
  }

  private _handleDialogClosed() {
    this.dialogOpen = false;
  }

  protected render() {
    return html`
      <div class="accordion">
        ${Object.entries(this.roomsEntities).map(
          ([entityId, attributes]) =>
            html` <div
              class="accordion-item ${attributes.response} ${attributes.friendly_name}"
              key=${entityId}
            >
              <div class="accordion-header">
                <div class="section-name">
                  ${(attributes.friendly_name || "")
                    .replace("_", " ")
                    .toUpperCase()}
                  ${attributes.response &&
                  html`
                    <span class="section-status"
                      ><ha-svg-icon
                        .path=${this.mapResponseToIcon(attributes.response)}
                        .width=${16}
                        .height=${16}
                      ></ha-svg-icon>
                      <span class="badge counter"> 1 </span>
                      ${attributes.command &&
                      html`
                        <span class="badge command">
                          <ha-svg-icon
                            .path=${mdiFormatQuoteOpen}
                            .width=${12}
                            .height=${12}
                          >
                          </ha-svg-icon
                        ></span>
                      `}
                    </span>
                  `}
                </div>

                <span class="accordion-icon"
                  ><ha-svg-icon
                    .path=${mdiChevronRight}
                    .width=${14}
                    .height=${14}
                  ></ha-svg-icon
                ></span>
              </div>

              <div class="accordion-content">
                <div class="accordion nested">
                  <div class="accordion-item">
                    <div class="accordion-header">
                      <div class="section-name">ROOM INFO</div>
                      <span class="accordion-icon"
                        ><ha-svg-icon
                          .path=${mdiChevronRight}
                          .width=${14}
                          .height=${14}
                        ></ha-svg-icon
                      ></span>
                    </div>
                    <div class="accordion-content">
                      <div class="student-list">
                        <div class="student-item default">
                          <div class="student-name">
                            Myra T. Aguirre
                            <span class="type"> | ADVISER </span>
                          </div>
                        </div>
                        <div>
                          <p>Science Department</p>
                          <p>Class Schedule: 6am - 8am</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div class="accordion-item">
                    <div class="accordion-header">
                      <div class="section-name">ROLL CALL</div>
                      <span class="accordion-icon">
                        <span class="students-count"
                          >${attributes.persons.length} Students</span
                        >
                        <ha-svg-icon
                          .path=${mdiChevronRight}
                          .width=${14}
                          .height=${14}
                        ></ha-svg-icon
                      ></span>
                    </div>
                    <div class="accordion-content">
                      <div class="student-list">
                        ${Object.entries(attributes.persons).map(
                          ([key, datum]: [string, any], index) =>
                            html`<div
                              class="student-item ${datum.attributes.status !==
                              "wounded"
                                ? "default"
                                : "wounded"}"
                              key=${index + key}
                            >
                              <div class="student-icon">
                                <ha-svg-icon
                                  .path=${stateIconMap(datum.attributes.status)}
                                  .width=${18}
                                  .height=${18}
                                ></ha-svg-icon>
                              </div>
                              <div class="student-name">
                                ${datum.attributes.friendly_name}
                              </div>
                            </div>`
                        )}
                      </div>
                    </div>
                  </div>
                  ${attributes.response === "weapon"
                    ? html`
                        <div class="accordion-item threat">
                          <div class="accordion-header">
                            <div class="section-name">THREAT DETAILS</div>
                            <span class="accordion-icon"
                              ><ha-svg-icon
                                .path=${mdiChevronRight}
                                .width=${14}
                                .height=${14}
                              ></ha-svg-icon
                            ></span>
                          </div>
                          <div class="accordion-content">
                            <div class="threat-info-item">
                              <span class="time">13:24</span>
                              <span class="message"
                                >Young male tall black hoodie</span
                              >
                            </div>
                            <div class="threat-info-item">
                              <span class="time">13:22</span>
                              <span class="message">Red backpack</span>
                            </div>
                          </div>
                        </div>
                      `
                    : null}

                  <div
                    class="section-send-command"
                    id=${(attributes.friendly_name || "").replace("_", " ")}
                    @click=${this._openDialog}
                  >
                    <mwc-button class="action-button">
                      <div class="action-button-icon">
                        <p class="button-text">
                          <span class="icon">
                            <ha-svg-icon
                              .path=${mdiSend}
                              .width=${18}
                              .height=${18}
                            ></ha-svg-icon>
                          </span>
                          Send Command
                        </p>
                      </div>
                    </mwc-button>
                  </div>
                </div>
              </div>
            </div>`
        )}

        <div
          class="bottom-action"
          id="room_selected"
          @click=${this._openDialog}
        >
          <mwc-button class="action-button">
            <div class="action-button-icon">
              <p>SEND <span>TO ALL SELECTED</span></p>
            </div>
          </mwc-button>
        </div>
      </div>

      <dialog-command
        .hass=${this.hass}
        .dialogOpen=${this.dialogOpen}
        .dialogRoomName=${this.dialogRoomName}
        @dialog-closed=${this._handleDialogClosed}
      ></dialog-command>
    `;
  }

  private addAccordionListeners() {
    const headers = this.shadowRoot!.querySelectorAll(".accordion-header");
    headers.forEach((header) => {
      header.addEventListener("click", () => {
        this.toggleAccordionContent(header as HTMLElement);
      });
    });
  }

  private toggleAccordionContent(element: HTMLElement): void {
    const content = element.nextElementSibling as HTMLElement;
    const icon = element.querySelector(
      ".accordion-icon ha-svg-icon"
    ) as LitElement;

    if (content.classList.contains("open")) {
      content.style.maxHeight = `${content.scrollHeight}px`;
      requestAnimationFrame(() => {
        content.style.maxHeight = "0";
        content.style.padding = "0 10px";
        content.classList.remove("open");
      });
      icon.setAttribute("path", mdiChevronRight);
    } else {
      content.classList.add("open");
      content.style.maxHeight = "none";
      const height = "100%";
      content.style.maxHeight = "0";
      content.style.padding = "10px";

      requestAnimationFrame(() => {
        content.style.maxHeight = height;
      });

      icon.setAttribute("path", mdiChevronDown);
    }
  }

  static get styles(): CSSResultGroup {
    return css`
    .accordion {
      margin-bottom: 24px;

      .accordion-item {
        border-bottom: 1px solid #415862;
        --status-color: #656565;

        &.weapon,
        .wounded {
          --status-color: #ea4849;
        }
        &.fire {
          --status-color: #faa84f;
        }
        &.medical {
          --status-color: #6fa1d6;
        }
        &.weather {
          --status-color: #9689c1;
        }
        &.suspicious {
          --status-color: #00abac;
        }
        &.conflict {
          --status-color: #d17cb3;
        }
        .default {
          --status-color: #e1e1e1;
        }

        .accordion-header {
          background-color: #212121;
          padding: 10px;
          cursor: pointer;
          font-weight: bold;
          border-left: 8px solid var(--status-color);
          justify-content: space-between;
          align-items: center;
          display: flex;

          .accordion-icon {
            background: var(--status-color);
            border-radius: 50%;
            padding: 2px 6px;

            .students-count {
              font-size: 12px;
              color: #606060;
              font-weight: normal;
            }
          }

          .section-status {
            margin-left: 12px;
            position: relative;
            display: inline-flex;
            align-items: center;
            background: var(--status-color);
            padding: 4px 6px;
            border-radius: 50%;

            .badge {
              position: absolute;
              bottom: -8px;
              border: 1px solid white;
              border-radius: 50%;
              width: 16px;
              height: 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 9px;
            }

            .counter {
              left: -8px;
              background: var(--status-color);
              color: white;
            }

            .command {
              right: -8px;
              background: #feca57;
              color: #0a0a0a;
              border-color: #0a0a0a;
            }
          }
        }

        .action-button {
          width: 100%;
          background: #feca57;
          border-radius: 8px;

          .action-button-icon {
            color: #0a0a0a;
            padding: 8px;
          }
        }

        &:last-child {
          border-bottom: none;
        }
      }

      .accordion-content {
        max-height: 0;
        overflow: hidden;
        /* transition:
          max-height 0.3s ease,
          padding 0.3s ease; */
        padding: 0 10px;
        background-color: #212121;
        border-top: 1px solid #415862;

        .threat-info-item {
          display: flex;
          flex-direction: column;
          margin: 4px 0;
          border-top: 1px solid #415862;
          padding: 4px 0;

          &:last-child {
            border-bottom: none;
          }

          .message {
            margin-bottom: 8px;
          }

          .time {
            color: #a3a3a3;
            font-size: 10px;
          }
        }

        .student-list {
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          cursor: pointer;
        }
        .student-item {
          display: flex;
          align-items: center;
          margin-bottom: 15px;
          transition: background-color 0.3s ease;
          border-bottom: 1px solid #606060;
          color: var(--status-color);
        }
        .student-item:hover {
          background-color: #2b2b2b;
        }
        .student-icon {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          justify-content: center;
          align-items: center;
          font-size: 14px;
          margin-right: 15px;

          &.medical {
            color: #54a0ff;
          }

          &.ok {
            color: #1dd1a1;Av
          }
        }
        .student-name {
          font-size: 14px;

          .type {
            font-size: 10px;
            color: gray;
          }
        }
      }

      .accordion-content.open {
        max-height: 400px; /* Set a maximum height that accommodates the content */
        padding: 10px;
      }

      &.nested {
        .accordion-item {
          border: 1px solid #606060;
          border-radius: 8px;
          margin-bottom: 8px;

          &.threat {
            border-color: #ea4849;

            .section-name {
              color: #ea4849;
              font-size: 12px;
            }
          }

          .accordion-header {
            border-left: none;
            border-radius: 8px;

            .accordion-icon {
              background: none;
            }
          }

          .accordion-content {
            border-top: none;
            border-radius: 8px;
            padding-top: 0 !important;
          }
        }
      }

      .bottom-action{
          margin-top: 12px;

          .action-button {
              width: 100%;
              background: #feca57;
              padding: 8px 0;
              border-radius: 8px;

              p {
                color: #0a0a0a;
                font-size: 12px;
              }
          }
        }
    }`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "map-right-navigation": MapRightNavigation;
  }
}

customElements.define("map-right-navigation", MapRightNavigation);
