import { property, state } from "lit/decorators";
import {
  mdiMagnifyMinus,
  mdiMagnifyPlus,
  mdiMapMarker,
  mdiMapMarkerRadius,
  mdiArrowExpand,
  mdiGrid,
  mdiChevronRight,
  mdiChevronDown,
  mdiPistol,
  mdiFire,
  mdiCheckDecagram,
  mdiMedicalBag,
  mdiBandage,
  mdiFormatQuoteOpen,
  mdiSend,
  mdiExitRun,
  mdiEyeOff,
  mdiHomeLock,
} from "@mdi/js";

import { css, CSSResultGroup, html, LitElement, PropertyValues } from "lit";

import "../../../components/ha-svg-icon";

import "../../../components/ha-dialog";

import { HomeAssistant } from "../../../types";

const stateToColorMap = {
  weapon: "#ed5d5d",
  fire: "#faa84f",
  medical: "#6fa1d6",
  weather: "#9689c1",
  suspicious: "#00abac",
  conflict: "#d17cb3",
};

class MapView extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, attribute: "dialog-open" }) dialogOpen = false;

  @property({ type: String, attribute: "dialog-title" }) dialogTitle = "";

  @property({ type: String, attribute: "dialog-type" }) dialogType = "";

  @property({ type: String, attribute: "dialog-room" }) dialogRoom = "";

  @state() private roomId: string = "";

  @state() private roomAttributes: object = {};

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    const parsedValue = this.roomAttributes;

    if (parsedValue && parsedValue.response) {
      const svgElement = this.shadowRoot?.querySelector(
        `#${parsedValue.friendly_name}`
      ) as SVGElement;

      const svgElementStatus = this.shadowRoot?.querySelector(
        `#status_${parsedValue.friendly_name}`
      ) as SVGElement;

      if (svgElement) {
        const fillColor =
          stateToColorMap[parsedValue.response as keyof typeof stateToColorMap];

        const bgStatusGroup = svgElementStatus.querySelector(
          "#bg_status"
        ) as SVGGElement;

        const commandGroup = svgElementStatus.querySelector(
          "#command"
        ) as SVGGElement;

        if (bgStatusGroup) {
          // Find the path element with class 'bg_status_color' inside the group
          const pathElement = bgStatusGroup.querySelector(
            ".bg_status_color"
          ) as SVGPathElement;

          const allPathElementIcons = bgStatusGroup.querySelectorAll(
            "[id^='bg_status_icon_']"
          ) as NodeListOf<SVGPathElement>;

          allPathElementIcons.forEach((icon) => {
            icon.setAttribute("style", "opacity: 0;");
          });

          const pathElementIcon = bgStatusGroup.querySelector(
            `#bg_status_icon_${parsedValue.response}`
          ) as SVGPathElement;

          if (pathElement) {
            // Set the fill attribute for the path element
            pathElement.setAttribute("fill", fillColor);
          }

          if (pathElementIcon) {
            pathElementIcon.setAttribute("style", "opacity: 1;");
          }
        }

        if (commandGroup && parsedValue.command) {
          commandGroup.setAttribute("style", "opacity: 1;");
        }

        svgElement.setAttribute("fill", fillColor);
      }
    }
  }

  connectedCallback() {
    super.connectedCallback();
    this._getStoredValue();
    this._subscribeToStateChanges();
  }

  private _getStoredValue() {
    const roomEntityId = this.hass.states[`room.room_111`]; // convert to dynamic

    if (roomEntityId) {
      try {
        this.roomAttributes = roomEntityId?.attributes;
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
          const newCommand = updatedEntity["+"].a.response;

          this.updatedCommand = newCommand;

          if (this.onStatusUpdated) {
            this.onStatusUpdated();
          }

          this.roomAttributes = {
            ...this.roomAttributes,
            response: newCommand,
          };

          this.requestUpdate();
        }
      }
    });
  }

  protected render() {
    return html`
      <div class="header header-map-section">
        <div class="action-icon">
          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiMagnifyMinus}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>

          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiMagnifyPlus}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>

          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiMapMarker}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>

          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiMapMarkerRadius}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>

          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiArrowExpand}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>

          <mwc-button class="action-button">
            <div class="action-button-icon">
              <ha-svg-icon
                .path=${mdiGrid}
                .width=${18}
                .height=${18}
              ></ha-svg-icon>
            </div>
          </mwc-button>
        </div>

        <div
          class="right-navigation"
          id="entire-campus"
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
                Send Command to Entire Campus
              </p>
            </div>
          </mwc-button>
        </div>
      </div>

      <div class="container">
        <div class="svg-map">
          <div class="map-name">
            <h2>Campus Map</h2>
          </div>
          <div id="svg-container"></div>
        </div>

        <div class="right-menu" id="right-menu">
          <div class="accordion">
            <div class="accordion-item weapon room_111">
              <div class="accordion-header">
                <div class="section-name">
                  Room 111
                  <span class="section-status"
                    ><ha-svg-icon
                      .path=${mdiPistol}
                      .width=${16}
                      .height=${16}
                    ></ha-svg-icon>
                    <span class="badge counter"> 1 </span>
                    <span class="badge command">
                      <ha-svg-icon
                        .path=${mdiFormatQuoteOpen}
                        .width=${12}
                        .height=${12}
                      >
                      </ha-svg-icon
                    ></span>
                  </span>
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
                <!-- Nested Accordion -->
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
                        <span class="students-count">15 Students</span>
                        <ha-svg-icon
                          .path=${mdiChevronRight}
                          .width=${14}
                          .height=${14}
                        ></ha-svg-icon
                      ></span>
                    </div>
                    <div class="accordion-content">
                      <div class="student-list">
                        <div class="student-item wounded">
                          <div class="student-icon">
                            <ha-svg-icon
                              .path=${mdiBandage}
                              .width=${18}
                              .height=${18}
                            ></ha-svg-icon>
                          </div>
                          <div class="student-name">Alice Smith</div>
                        </div>
                        <div class="student-item default">
                          <div class="student-icon medical">
                            <ha-svg-icon
                              .path=${mdiMedicalBag}
                              .width=${18}
                              .height=${18}
                            ></ha-svg-icon>
                          </div>
                          <div class="student-name">Bob Johnson</div>
                        </div>
                        <div class="student-item default">
                          <div class="student-icon ok">
                            <ha-svg-icon
                              .path=${mdiCheckDecagram}
                              .width=${18}
                              .height=${18}
                            ></ha-svg-icon>
                          </div>
                          <div class="student-name">Charlie Brown</div>
                        </div>
                      </div>
                    </div>
                  </div>
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
                  <div
                    class="section-send-command"
                    id="room_111"
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
                <!-- End of Nested Accordion -->
              </div>
              <div class="accordion-item fire room_113">
                <div class="accordion-header">
                  <div class="section-name">
                    Room 113
                    <span class="section-status"
                      ><ha-svg-icon
                        .path=${mdiFire}
                        .width=${16}
                        .height=${16}
                      ></ha-svg-icon>
                    </span>
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
                              Ava Rice
                              <span class="type"> | ADVISER </span>
                            </div>
                          </div>
                          <div>
                            <p>English Department</p>
                            <p>Class Schedule: 6am - 8am</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="accordion-item">
                      <div class="accordion-header">
                        <div class="section-name">ROLL CALL</div>
                        <span class="accordion-icon">
                          <span class="students-count">23 Students</span>
                          <ha-svg-icon
                            .path=${mdiChevronRight}
                            .width=${14}
                            .height=${14}
                          ></ha-svg-icon
                        ></span>
                      </div>
                      <div class="accordion-content">
                        <div class="student-list">
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiMedicalBag}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Aereth Smith</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Jabari Scar</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Jame Davis</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="section-send-command"
                      id="room_113"
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
              </div>
              <div class="accordion-item fire room_142">
                <div class="accordion-header">
                  <div class="section-name">
                    Room 142
                    <span class="section-status"
                      ><ha-svg-icon
                        .path=${mdiFire}
                        .width=${16}
                        .height=${16}
                      ></ha-svg-icon>
                    </span>
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
                              Lyra Santiago
                              <span class="type"> | ADVISER </span>
                            </div>
                          </div>
                          <div>
                            <p>Mathematics Department</p>
                            <p>Class Schedule: 6am - 8am</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="accordion-item">
                      <div class="accordion-header">
                        <div class="section-name">ROLL CALL</div>
                        <span class="accordion-icon">
                          <span class="students-count">19 Students</span>
                          <ha-svg-icon
                            .path=${mdiChevronRight}
                            .width=${14}
                            .height=${14}
                          ></ha-svg-icon
                        ></span>
                      </div>
                      <div class="accordion-content">
                        <div class="student-list">
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Johhny Doe</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Grace Lewis</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Lucas Anderson</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="section-send-command"
                      id="room_142"
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
              </div>
              <div class="accordion-item medical multi_purpose_room">
                <div class="accordion-header">
                  <div class="section-name">
                    Room 149 - Multi Purpose
                    <span class="section-status"
                      ><ha-svg-icon
                        .path=${mdiMedicalBag}
                        .width=${16}
                        .height=${16}
                      ></ha-svg-icon>
                    </span>
                  </div>
                  <span class="accordion-icon"
                    ><ha-svg-icon
                      .path=${mdiChevronRight}
                      .width=${14}
                      .height=${14}
                    ></ha-svg-icon
                  ></span>
                </div>
                <div class="accordion-content">Content for Option 3</div>
              </div>
              <div class="accordion-item room_105">
                <div class="accordion-header">
                  Room 105
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
                              Edmond Cua
                              <span class="type"> | ADVISER </span>
                            </div>
                          </div>
                          <div>
                            <p>History Department</p>
                            <p>Class Schedule: 6am - 8am</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div class="accordion-item">
                      <div class="accordion-header">
                        <div class="section-name">ROLL CALL</div>
                        <span class="accordion-icon">
                          <span class="students-count">17 Students</span>
                          <ha-svg-icon
                            .path=${mdiChevronRight}
                            .width=${14}
                            .height=${14}
                          ></ha-svg-icon
                        ></span>
                      </div>
                      <div class="accordion-content">
                        <div class="student-list">
                          <div class="student-item medical">
                            <div class="student-icon">
                              <ha-svg-icon
                                .path=${mdiMedicalBag}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Aereth Smith</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Jabari Scar</div>
                          </div>
                          <div class="student-item default">
                            <div class="student-icon ok">
                              <ha-svg-icon
                                .path=${mdiCheckDecagram}
                                .width=${18}
                                .height=${18}
                              ></ha-svg-icon>
                            </div>
                            <div class="student-name">Jame Davis</div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div
                      class="section-send-command"
                      id="room_105"
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
              </div>
              <div class="accordion-item room_145">
                <div class="accordion-header">
                  Room 145 - Library
                  <span class="accordion-icon"
                    ><ha-svg-icon
                      .path=${mdiChevronRight}
                      .width=${14}
                      .height=${14}
                    ></ha-svg-icon
                  ></span>
                </div>
                <div class="accordion-content">Content for Option 3</div>
              </div>
            </div>
          </div>

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
      </div>

      <ha-dialog
        ?open=${this.dialogOpen}
        @closed=${this._closeDialog}
        heading=${this.dialogTitle}
      >
        <div>Send Instant Command to ${this.dialogType}</div>

        <div class="row">
          <mwc-button
            class="command-button"
            dialogAction="send"
            id="cmd-evacuate"
            value="evacuate"
            @click=${this._sendCommand}
          >
            <div class="content-wrapper">
              <span>
                <ha-svg-icon
                  .path=${mdiExitRun}
                  .width=${38}
                  .height=${38}
                ></ha-svg-icon>
              </span>
              <span>Evacuate</span>
            </div>
          </mwc-button>

          <mwc-button
            class="command-button"
            id="cmd-hide"
            dialogAction="send"
            value="hide"
            @click=${this._sendCommand}
          >
            <div class="content-wrapper">
              <span>
                <ha-svg-icon
                  .path=${mdiEyeOff}
                  .width=${38}
                  .height=${38}
                ></ha-svg-icon>
              </span>
              <span>Hide</span>
            </div>
          </mwc-button>

          <mwc-button
            class="command-button"
            id="cmd-lockdown"
            dialogAction="send"
            value="lockdown"
            @click=${this._sendCommand}
          >
            <div class="content-wrapper">
              <span>
                <ha-svg-icon
                  .path=${mdiHomeLock}
                  .width=${38}
                  .height=${38}
                ></ha-svg-icon>
              </span>
              <span>Lockdown</span>
            </div>
          </mwc-button>
        </div>
        <mwc-button slot="primaryAction" dialogAction="send"
          >Send Command</mwc-button
        >
        <mwc-button slot="primaryAction" dialogAction="close">Close</mwc-button>
      </ha-dialog>
    `;
  }

  private _openDialog(event: Event) {
    const target = event.currentTarget as HTMLElement;

    this.roomId = target.id;
    const type = this.roomId === "entire-campus" ? "entire" : "selected";

    this.dialogTitle = "Send Command";
    this.dialogRoom = target.id;
    this.dialogType = type === "entire" ? "Entire Campus" : "Selected Room/s";
    this.dialogOpen = true;
  }

  private async _sendCommand(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const cmdValue = target.getAttribute("value") || "";

    this._error = "";

    if (!this.hass) {
      return;
    }

    const roomEntityId = `room.${this.roomId}`;
    const roomState = this.hass.states[`room.${this.roomId}`];
    const roomStateAttributes = roomState.attributes;

    roomStateAttributes.command = cmdValue;

    try {
      await this.hass.callApi("POST", "states/" + roomEntityId, {
        state: roomState.state,
        attributes: roomStateAttributes,
      });
    } catch (e: any) {
      this.error = e.body?.message || "Unknown error";
    }
  }

  private _closeDialog() {
    this.dialogOpen = false;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.addAccordionListeners();
    this._addSvgMap();
  }

  private _addSvgMap() {
    const svgMap = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1368 792" width="100%" height="792">
	<style>
		tspan { white-space:pre }
		.s0 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10 }
		.s1 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: 1.1 }
		.s2 { fill: #6bc4c7 }
		.s3 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: 2 }
		.s4 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: .8 }
		.s5 { opacity: .8;fill: #656565 }
		.s6 { opacity: 0;fill: #ffffff }
		.s7 { opacity: .8;fill: #faa84f }
		.s9 { opacity: .8;fill: #6fa1d6 }
		.s10 { opacity: 0;fill: #68cef5 }
		.t11 { font-size: 9px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.t12 { font-size: 7px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.t13 { font-size: 6px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.s14 { fill: #ea4849 }
		.s15 { fill: #ffffff }
		.s16 { fill: #ff943b }
		.s17 { fill: #feca57;stroke: #ffffff;stroke-miterlimit:10;stroke-width: 1.4 }
		.s18 { fill: #231f20 }
		.s19 { fill: #ea4849;stroke: #ffffff;stroke-miterlimit:10;stroke-width: 1.4 }
		.s20 { fill: #626262 }
	</style>
	<g>
		<g id="floorplan">
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m1128.5 299.5h-3.1v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1143.1 300.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1182.4 299.1h9v8.3h-9z"/>
				<path class="s1" d="m1159.5 300.4v7.6"/>
				<path class="s1" d="m1151.5 300.4v7.6"/>
				<path class="s1" d="m1167.1 300.4v7.6"/>
				<path class="s1" d="m1173.3 300.4v7.6"/>
				<path class="s1" d="m1157.7 303.8h24.7"/>
				<path class="s1" d="m1143.1 303.8h10.1"/>
				<path fill-rule="evenodd" class="s1" d="m1153.2 300.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1128.5 300.8h-3.1-0.5v-1.7h3.6z"/>
				<path class="s2" d="m1143.6 300.8h-6.8-1.1v-1.7h7.9z"/>
				<path class="s0" d="m1128 300.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m964.7 299.5h-3.1v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m979.3 300.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1018.6 299.1h9v8.3h-9z"/>
				<path class="s1" d="m995.7 300.4v7.6"/>
				<path class="s1" d="m987.7 300.4v7.6"/>
				<path class="s1" d="m1003.3 300.4v7.6"/>
				<path class="s1" d="m1009.5 300.4v7.6"/>
				<path class="s1" d="m994.2 303.8h24.4"/>
				<path class="s1" d="m979.3 303.8h10.1"/>
				<path fill-rule="evenodd" class="s1" d="m989.4 300.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m964.7 300.8h-3.1-0.5v-1.7h3.6z"/>
				<path class="s2" d="m979.8 300.8h-6.8-1.1v-1.7h7.9z"/>
				<path class="s0" d="m964.3 300.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m801 299.5h-3.2v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m815.5 300.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m854.8 299.1h9v8.3h-9z"/>
				<path class="s1" d="m831.9 300.4v7.6"/>
				<path class="s1" d="m823.9 300.4v7.6"/>
				<path class="s1" d="m839.5 300.4v7.6"/>
				<path class="s1" d="m845.7 300.4v7.6"/>
				<path class="s1" d="m830.2 303.8h24.6"/>
				<path class="s1" d="m815.5 303.8h10.5"/>
				<path fill-rule="evenodd" class="s1" d="m825.6 300.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m801 300.8h-3.2-0.5v-1.7h3.7z"/>
				<path class="s2" d="m816 300.8h-6.8-1.1v-1.7h7.9z"/>
				<path class="s0" d="m800.5 300.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m766.1 299.5h3.1v-7.5h13.4v-78h-80v94.2h48.9v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m751.6 308h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m712.2 307.4h-9v-8.3h9z"/>
				<path class="s1" d="m735.1 300.4v7.6"/>
				<path class="s1" d="m743.1 300.4v7.6"/>
				<path class="s1" d="m727.5 300.4v7.6"/>
				<path class="s1" d="m721.3 300.4v7.6"/>
				<path class="s1" d="m736.9 303.8h-24.7"/>
				<path class="s1" d="m751.5 303.8h-9.9"/>
				<path fill-rule="evenodd" class="s1" d="m741.4 305.2h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m766.1 300.8h3.1 0.5v-1.7h-3.6z"/>
				<path class="s2" d="m751 300.8h6.8 1.1v-1.7h-7.9z"/>
				<path class="s0" d="m766.6 300.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m929.9 299.5h3.1v-7.5h13.4v-78h-80.1v94.2h49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m915.3 308h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m876 307.4h-9v-8.3h9z"/>
				<path class="s1" d="m898.9 300.4v7.6"/>
				<path class="s1" d="m906.9 300.4v7.6"/>
				<path class="s1" d="m891.3 300.4v7.6"/>
				<path class="s1" d="m885.1 300.4v7.6"/>
				<path class="s1" d="m900.9 303.8h-24.9"/>
				<path class="s1" d="m915.3 303.8h-10.1"/>
				<path fill-rule="evenodd" class="s1" d="m905.2 303.8v-3.6h-4.6v5h4.6z"/>
				<path class="s2" d="m929.9 300.8h3.1 0.5v-1.7h-3.6z"/>
				<path class="s2" d="m914.8 300.8h6.8 1.1v-1.7h-7.9z"/>
				<path class="s0" d="m930.4 300.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m1093.6 299.5h3.2v-7.5h13.4v-78h-80.1v94.2h49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1079.1 308h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1039.8 307.4h-9v-8.3h9z"/>
				<path class="s1" d="m1062.7 300.4v7.6"/>
				<path class="s1" d="m1070.7 300.4v7.6"/>
				<path class="s1" d="m1055.1 300.4v7.6"/>
				<path class="s1" d="m1048.9 300.4v7.6"/>
				<path class="s1" d="m1064.4 303.8h-24.6"/>
				<path class="s1" d="m1079.1 303.8h-10.2"/>
				<path fill-rule="evenodd" class="s1" d="m1069 305.2h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m1093.6 300.8h3.2 0.5v-1.7h-3.7z"/>
				<path class="s2" d="m1078.6 300.8h6.8 1.1v-1.7h-7.9z"/>
				<path class="s0" d="m1094.1 300.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m1076.6 451.4h3.1v7.5h13.4v78h-80v-94.2h49v8.7"/>
				<path fill-rule="evenodd" class="s0" d="m1062 450.7h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1022.7 451.8h-9v-8.3h9z"/>
				<path class="s0" d="m1045.6 450.5v-7.5"/>
				<path class="s0" d="m1053.7 450.5v-7.5"/>
				<path class="s0" d="m1038 450.5v-7.5"/>
				<path class="s0" d="m1031.9 450.5v-7.5"/>
				<path class="s0" d="m1047.4 447.1h-24.6"/>
				<path class="s0" d="m1062.1 447.1h-9.8"/>
				<path fill-rule="evenodd" class="s0" d="m1051.9 450.8h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m1076.6 450.1h3.1 0.5v1.8h-3.6z"/>
				<path class="s2" d="m1061.5 450.1h6.8 1.2v1.8h-8z"/>
				<path class="s0" d="m1077.1 450.8v-8.4c0 0-8.2-1.6-8.1 8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m1195.7 451.4h-3.1v7.5h-13.4v78h80v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1210.2 443h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1249.5 443.6h9v8.3h-9z"/>
				<path class="s1" d="m1226.7 450.5v-7.5"/>
				<path class="s1" d="m1218.6 450.5v-7.5"/>
				<path class="s1" d="m1234.3 450.5v-7.5"/>
				<path class="s1" d="m1240.4 450.5v-7.5"/>
				<path class="s0" d="m1224.9 447.1h24.6"/>
				<path fill-rule="evenodd" class="s1" d="m1220.3 445.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1195.7 450.1h-3.1-0.5v1.8h3.6z"/>
				<path class="s2" d="m1210.7 450.1h-6.8-1.1v1.8h7.9z"/>
				<path class="s0" d="m1195.2 450.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
				<path class="s0" d="m1209.8 447.1h10.4"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m1112.6 451.4h-3.1v7.5h-13.4v78h80.1v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1127.2 443h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1166.5 443.6h9v8.3h-9z"/>
				<path class="s1" d="m1143.6 450.5v-7.5"/>
				<path class="s1" d="m1135.6 450.5v-7.5"/>
				<path class="s1" d="m1151.2 450.5v-7.5"/>
				<path class="s1" d="m1157.4 450.5v-7.5"/>
				<path class="s0" d="m1127.2 447.1h10.3"/>
				<path class="s0" d="m1141.6 447.1h34"/>
				<path fill-rule="evenodd" class="s1" d="m1137.3 445.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1112.6 450.1h-3.1-0.5v1.8h3.6z"/>
				<path class="s2" d="m1127.7 450.1h-6.8-1.1v1.8h7.9z"/>
				<path class="s0" d="m1112.1 450.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m946.6 451.4h-6v8.6h-10.6v76.9h80.1v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m961.1 443h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1000.4 443.6h9v8.3h-9z"/>
				<path class="s1" d="m977.5 450.5v-7.5"/>
				<path class="s1" d="m969.5 450.5v-7.5"/>
				<path class="s1" d="m985.1 450.5v-7.5"/>
				<path class="s1" d="m991.3 450.5v-7.5"/>
				<path class="s0" d="m961.1 447.1h9.9"/>
				<path class="s0" d="m975.7 447.1h33.7"/>
				<path fill-rule="evenodd" class="s1" d="m971.2 445.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m946.6 450.1h-3.1-0.6v1.8h3.7z"/>
				<path class="s2" d="m961.6 450.1h-6.8-1.1v1.8h7.9z"/>
				<path class="s0" d="m946.1 450.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			</g>
			<path class="s0" d="m1172.3 402.8v-1.6h-9.6v-53.3h14.8v-15.9h84.1v85.3h-89.3v-7"/>
			<path fill-rule="evenodd" class="s0" d="m1162.7 347.9h9.6v53.3h-9.6z"/>
			<path class="s0" d="m1163 356.9h9.1"/>
			<path class="s0" d="m1163 366.5h9.1"/>
			<path class="s0" d="m1163 375.1h9.1"/>
			<path class="s0" d="m1163 382.3h9.1"/>
			<path class="s0" d="m1163 391.2h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1166.8 384.6h5.6v4.7h-5.6z"/>
			<path class="s0" d="m1168.6 356.9v25.4"/>
			<path class="s0" d="m1168.6 391.2v10.1"/>
			<path class="s0" d="m1026 341.1l6.3 0.1v-9.8h35.2v84.5h-51.8v-74.8h2"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s0" d="m1015.7 408.2h9.2v7.7h-9.2z"/>
			<path class="s0" d="m1067.5 409.2h-42.3"/>
			<path class="s0" d="m1067.5 412.7h-42.3"/>
			<path class="s0" d="m1034.4 409.2v6.7"/>
			<path class="s0" d="m1032.6 412.7v3.2"/>
			<path class="s0" d="m1042.1 409.2v6.7"/>
			<path class="s0" d="m1059 409.2v3.5"/>
			<path class="s3" d="m1032.6 336h34.9"/>
			<path class="s2" d="m1017.9 340.1h-2.3-0.4v1.7h2.7z"/>
			<path class="s2" d="m1032.8 340.1h-6.7-1.1v1.7h7.8z"/>
			<path class="s0" d="m1017.4 340.7v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			<path class="s0" d="m985.8 331.4v84.5"/>
			<path class="s0" d="m869.2 331.4v84.5"/>
			<path class="s0" d="m996 331.4h19.2v84.5h-18.6"/>
			<path class="s2" d="m985.8 380.8h29.4v2.5h-29.4z"/>
			<path class="s2" d="m945.7 392.5h19v2.5h-19z"/>
			<path class="s2" d="m931.7 369.8h54.1v2.5h-54.1z"/>
			<path class="s2" d="m869.2 369.8h52.4v2.5h-52.4z"/>
			<path class="s2" d="m946.1 371.6v12.2h-2.5v-12.2z"/>
			<path class="s2" d="m946.1 391v15.4h-2.5v-15.4z"/>
			<path class="s0" d="m959.3 331.8v39.3"/>
			<path class="s0" d="m932.1 331.4v39.7"/>
			<path fill-rule="evenodd" class="s0" d="m1193.8 214h44.9v25.5h-44.9z"/>
			<path class="s0" d="m1216.3 236.6v37.1"/>
			<path class="s0" d="m1227.9 236.6v37.1"/>
			<path class="s0" d="m1238.7 236.6v70.8"/>
			<path class="s0" d="m1216.3 241.9h21.9"/>
			<path class="s0" d="m1216.3 270.3h22.4"/>
			<path class="s0" d="m1216.3 267.7h22.4"/>
			<path class="s0" d="m1216.3 265.1h22.4"/>
			<path class="s0" d="m1216.3 262.5h22.4"/>
			<path class="s0" d="m1216.3 259.9h22.4"/>
			<path class="s0" d="m1216.3 257.4h22.4"/>
			<path class="s0" d="m1216.3 254.8h22.4"/>
			<path class="s0" d="m1216.3 252.2h22.4"/>
			<path class="s0" d="m1216.3 249.6h22.4"/>
			<path class="s0" d="m1216.3 247h22.4"/>
			<path class="s0" d="m1216.3 244.4h22.4"/>
			<path class="s0" d="m1227.5 257.4l9.7-5.2"/>
			<path class="s0" d="m1218.1 257.4l9.6-5.2"/>
			<path class="s2" d="m1196.8 273.3h-3.1-0.5v-1.7h3.6z"/>
			<path class="s2" d="m1216.7 273.7h-10.9-1.9v-1.8h12.8z"/>
			<path class="s0" d="m1196.3 272.7v8.4c0 0 8.2 1.6 8.1-8.9"/>
			<path class="s2" d="m1219.8 316.7v5.7 1h-1.7v-6.7z"/>
			<path class="s2" d="m1242.7 308.8h-21.1-3.5v-1.8h24.6z"/>
			<path class="s0" d="m1218.1 331h9.5c0 0 1.6-8.2-8.9-8.1"/>
			<path class="s0" d="m1218.1 309.1h9.5c0 0 1.6 8.2-8.9 8.1"/>
			<path class="s2" d="m1241.2 316v5.3 0.9h-1.8v-6.2z"/>
			<path class="s0" d="m1239.5 329.1h9.5c0 0 1.6-7.5-8.9-7.5"/>
			<path class="s0" d="m1239.5 309.1h9.5c0 0 1.6 7.5-8.9 7.5"/>
			<path class="s2" d="m1262.2 420h-20.7-3.4v-2.5h24.1z"/>
			<path class="s2" d="m1238.6 329.5h23.5v2.5h-23.5z"/>
			<path class="s2" d="m1154.3 331.5h23.3v2.5h-23.3z"/>
			<path class="s2" d="m1237.2 430.6v-1c3.4 0 5.8-0.8 7.2-2.5 1.4-1.7 1.4-3.8 1.3-4.6h-8v-1h8.9v0.4c0 0.1 0.6 3.3-1.5 5.9-1.6 1.9-4.3 2.9-8 2.9z"/>
			<path class="s2" d="m1260.6 428.5v-1c3.4 0 5.8-0.8 7.2-2.5 1.4-1.7 1.4-3.8 1.3-4.6h-8v-1h8.9v0.4c0 0.1 0.6 3.3-1.5 5.9-1.6 1.9-4.3 2.9-8 2.9z"/>
			<path class="s2" d="m1237.2 430.3v1c3.4 0 5.8 0.8 7.2 2.5 1.4 1.7 1.4 3.8 1.3 4.6h-8v1h8.9v-0.4c0-0.1 0.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9z"/>
			<path class="s2" d="m1260.6 432.2v1c3.4 0 5.8 0.8 7.2 2.5 1.4 1.7 1.4 3.8 1.3 4.6h-8v1h8.9v-0.4c0-0.1 0.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9z"/>
			<path class="s2" d="m1236.4 438.4h2.7v3.8h-2.7z"/>
			<path class="s2" d="m1236.4 417.5h2.7v5h-2.7z"/>
			<path class="s2" d="m1259.4 427.5h2.4v5.7h-2.4z"/>
			<path class="s3" d="m699.7 232.9l-0.1-22.5h543.1v96.6"/>
			<path class="s0" d="m1079.6 312.4h-100.3v-6.8"/>
			<path class="s0" d="m915.9 312.4h-100.4v-6.9"/>
			<path class="s0" d="m1193.8 239.5v72.9h-50.8v-7.6"/>
			<g>
				<path class="s0" d="m1115.2 308.8v8.4c0 0-8.2 1.6-8.1-8.9v-1.7c0.1 0-8.4 0-8.4 0v-12.5h25v12.5h-8.4v2.2"/>
				<path class="s0" d="m1096.8 300.8v7.9h10.8"/>
				<path class="s0" d="m1125.4 300.8v7.9h-10.7"/>
			</g>
			<g>
				<path class="s0" d="m933 300.4v7.8h10.3l0.1-2.1h-8.5v-12.5h24.9v12.5h-8.7"/>
				<path class="s0" d="m951.4 305.6v11.2c0 0-8.2 1.6-8.1-8.9"/>
				<path class="s0" d="m950.9 308.2h10.7v-7.8"/>
			</g>
			<g>
				<path class="s0" d="m787.7 308.3v-2.2h8.4v-12.5h-25v12.5h8.5v1.7c-0.2 10.5 8 8.9 8 8.9v-8.4"/>
				<path class="s0" d="m769.2 300.4v7.8h10.8"/>
				<path class="s0" d="m797.9 300.4v7.8h-10.7"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m1097.7 360.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1089.5 360.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1105 360.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1081.6 360.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path class="s4" d="m1089.8 347.1c-0.9 5.5-5 5.8-5 5.8v-5.7h-1.6v14.3"/>
			<path fill-rule="evenodd" class="s4" d="m1085.3 371.1c0 0.3 0 0.7 0 1.1 0 2.7 1 4.9 2.3 4.9 1.3 0 2.3-2.2 2.3-4.9 0-2.7 0-0.7 0-1.1h-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1077.5 371.1c0 0.3 0 0.7 0 1.1 0 2.7 1 4.9 2.3 4.9 1.3 0 2.3-2.2 2.3-4.9 0-2.7 0-0.7 0-1.1h-4.4z"/>
			<path class="s4" d="m1090.8 347.3h1.6v5.7c0 0 4.1-0.3 5-5.8"/>
			<path class="s4" d="m1098.9 347.3h1.6v5.7c0 0 4.1-0.3 5-5.8"/>
			<path class="s4" d="m1068.9 346.9h1.7v-8.1c0 0 8.3 0.1 8.2 8.4"/>
			<path class="s2" d="m1078.4 346.6h6.1v1.1h-6.1z"/>
			<path class="s2" d="m1089.4 346.6h3.4v1.1h-3.4z"/>
			<path class="s2" d="m1096.9 346.6h4v1.1h-4z"/>
			<path class="s4" d="m1091.1 347.1v14.5"/>
			<path class="s4" d="m1098.9 347.1v14.5"/>
			<path class="s2" d="m1067.4 360.9h39.6v1.5h-39.6z"/>
			<path class="s2" d="m1106.2 343h16.6v2h-16.6z"/>
			<path class="s2" d="m1106.2 383.5h16.6v2h-16.6z"/>
			<path class="s2" d="m1067.4 369.3h39.6v1.5h-39.6z"/>
			<path class="s2" d="m1069.2 395.3h65.1v1.5h-65.1z"/>
			<path class="s2" d="m1068.5 415.4h2.3v1.1h-2.3z"/>
			<path class="s0" d="m1069 415.9v-82.9h64.9v14.1h1.8v-16.1h-68.2v84.9"/>
			<path fill-rule="evenodd" class="s4" d="m1094.2 370.8h2.1c0.8 0 1.4 0.6 1.4 1.4v0.1c0 0.8-0.6 1.4-1.4 1.4h-2.1c-0.8 0-1.4-0.6-1.4-1.4v-0.1c0-0.8 0.6-1.4 1.4-1.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1102 370.8h2.1c0.8 0 1.4 0.6 1.4 1.4v0.1c0 0.8-0.6 1.4-1.4 1.4h-2.1c-0.8 0-1.4-0.6-1.4-1.4v-0.1c0-0.8 0.6-1.4 1.4-1.4z"/>
			<path class="s4" d="m1098.9 370.5v7.3"/>
			<path class="s4" d="m1097.4 376.6h3.1"/>
			<path fill-rule="evenodd" class="s0" d="m1106.7 343.7h2.3v40.8h-2.3z"/>
			<path class="s0" d="m1068.7 385.1h2.4v8.6c0 0 8 0.1 8-8.6h5.3v-0.6"/>
			<path class="s4" d="m1091.1 370.3v14.9h-1v-0.7c-0.9-5.5-5-5.8-5-5.8v5.7h-1.6v-14.3"/>
			<g>
				<path class="s0" d="m1098.2 442.1v2.2h8.8v12.5h-25v-12.5h8v-1.7c0-10.5 8.1-8.9 8.1-8.9v8.4"/>
				<path class="s0" d="m1079.7 451.4v-9.2h10.8"/>
				<path class="s0" d="m1109.5 451.4v-9.2h-11.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m929.3 442.6v2.2h8.8v12.5h-25v-12.5h8.1v-1.7c0-10.5 8.1-8.9 8.1-8.9z"/>
				<path class="s0" d="m784.3 505.8l-5-3.6"/>
				<path class="s0" d="m921.6 442.7h-10.8v17.3h15.7l0.4 76.9-99.3-0.4-30.3-21.6"/>
				<path class="s0" d="m940.6 451.9v-9.2h-11.8"/>
			</g>
			<path class="s0" d="m1187.1 443c0-8.9-8.1-8.5-8.1-8.5v8.2h-3.4"/>
			<path class="s0" d="m1193.5 451.7v-9.2h-6.4"/>
			<path class="s0" d="m1133.8 396.5v-16.2h1.9v37.3h-32.6v-1.7h30.8v-3.4"/>
			<path fill-rule="evenodd" class="s0" d="m1130.1 400.5h5.5v6h-5.5z"/>
			<path fill-rule="evenodd" class="s0" d="m1130.1 406.5h5.5v6h-5.5z"/>
			<path fill-rule="evenodd" class="s0" d="m1122.6 397.1h7.6v3.4c0 0.7 0 1.5 0 2.2 0 1.3-1 1.1-2 1-3.6-0.3-5.7-3-5.6-6.6z"/>
			<path class="s2" d="m1126.3 399.3h1.2v1.2h-1.2z"/>
			<path class="s0" d="m1095.3 417.6h-16.8"/>
			<path class="s0" d="m1071.5 417.6h-74.9"/>
			<path class="s0" d="m931.7 417.6h34.9v-45.9"/>
			<path class="s0" d="m988.4 417.6h-13.4"/>
			<path class="s0" d="m989 415.9h-14"/>
			<path class="s0" d="m923.2 415.9h-103v-11.7"/>
			<path class="s0" d="m801.6 415.9h-98.5v-82.5h98.4v6.6h-91.1"/>
			<path class="s0" d="m931.3 415.9h33.7v-44.2"/>
			<path fill-rule="evenodd" class="s0" d="m1093.2 396.7h18.4v4.1h-18.4z"/>
			<path class="s0" d="m1091.8 396.5l-0.1 19.4h-13.1"/>
			<path class="s0" d="m1093.2 396v19.9h1.8"/>
			<path class="s0" d="m1094.8 417.6v-10.1c0 0 8.6 0.5 8.6 8.4"/>
			<path class="s0" d="m1071.1 417.6v-10.1c0 0 8 0.4 8 8.4"/>
			<path class="s2" d="m1078.5 415.4h1v2.2h-1z"/>
			<path class="s0" d="m1154.9 333.6c0 0-0.5 8.5 8.7 8.5v5.8"/>
			<path class="s0" d="m988.4 331.1v-8.4c0 0 8.1-0.4 8.1 8.5"/>
			<path class="s0" d="m830.2 331.2c0-8.9 8.1-8.5 8.1-8.5v8.4h10.3v23.3"/>
			<path class="s0" d="m969.5 331.2c0 8.9-8.1 8.5-8.1 8.5v-8.4"/>
			<path class="s0" d="m942.9 331.2c0 8.9-8.1 8.5-8.1 8.5v-8.4h-4.4v8.4c0 0-8.1 0.4-8.1-8.5"/>
			<path class="s0" d="m859.5 331.2c0 8.9-8.1 8.5-8.1 8.5v-8.5h-2.5"/>
			<path class="s0" d="m988.9 331.4h-20"/>
			<path class="s0" d="m961.8 331.4h-19.5"/>
			<path class="s0" d="m922.8 331.4h-63.8"/>
			<path class="s0" d="m809.6 341h-6v-9.6h-102.3v86.2h102.2v-9"/>
			<path class="s4" d="m702.6 221.5h488.8"/>
			<path class="s0" d="m967.5 415.5v8.4c0 0 8.1 0.5 8.1-8.4"/>
			<path class="s0" d="m988.5 415.5v8.4c0 0 8.1 0.4 8.1-8.5"/>
			<path class="s0" d="m944.4 391.5h-8.4c0 0-0.4-8.1 8.5-8.1"/>
			<path class="s0" d="m944.4 405.9c-8.9 0-8.5 8.1-8.5 8.1h8.4v2.1"/>
			<path fill-rule="evenodd" class="s4" d="m964.3 374.5c-0.3 0-0.7 0-1.1 0-2.7 0-4.9 1-4.9 2.3 0 1.3 2.2 2.3 4.9 2.3 2.7 0 0.7 0 1.1 0v-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m964.3 396.7c-0.3 0-0.7 0-1.1 0-2.7 0-4.9 1-4.9 2.3 0 1.3 2.2 2.3 4.9 2.3 2.7 0 0.7 0 1.1 0v-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1109.5 358.2h6.7v12.4h-6.7z"/>
			<path fill-rule="evenodd" class="s4" d="m1111.9 360.3c1.3 0 2.4 1.1 2.4 2.4v3.4c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4v-3.4c0-1.3 1.1-2.4 2.4-2.4z"/>
			<path class="s2" d="m1110.2 363.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path class="s2" d="m1110.2 366c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m964.6 393.1h-6.7v-9h6.7z"/>
				<path class="s2" d="m963.8 390.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m963.8 388.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m962.3 391.4c-1.1 0-2-1.3-2-2.9 0-1.6 0.9-2.9 2-2.9 1.1 0 2 1.3 2 2.9 0 1.6-0.9 2.9-2 2.9z"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s4" d="m964.3 412.3h-6.7v-9h6.7z"/>
				<path class="s2" d="m963.6 409.5c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m963.6 407.6c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m962.1 410.6c-1.1 0-2-1.3-2-2.9 0-1.6 0.9-2.9 2-2.9 1.1 0 2 1.3 2 2.9 0 1.6-0.9 2.9-2 2.9z"/>
			</g>
			<path class="s0" d="m809.1 341c0-10.8 7.7-9.8 7.7-9.8v8.4h1.7"/>
			<path class="s0" d="m818.1 403.8h9.5c0 0 0.4-8.1-8.5-8.1"/>
			<path class="s0" d="m808.9 408.1c0 8.9 8.1 8.5 8.1 8.5v-8.4h1.8"/>
			<path class="s0" d="m923.2 417.6h-104.6v-13.8"/>
			<path class="s0" d="m931.4 418.1v-10.7c0 0-8.1-0.4-8.1 8.5v2.1"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m885.8 391h27.4v7.1h-27.4z"/>
				<path class="s0" d="m903.6 391.5v6.6"/>
				<path class="s0" d="m894.5 391v7.1"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m885.3 348.4h26.1v7.1h-26.1z"/>
				<path class="s0" d="m902.3 348.9v6.7"/>
				<path class="s0" d="m893.6 348.4v7.2"/>
			</g>
			<path class="s0" d="m875.9 412.7v-40.4"/>
			<path class="s0" d="m872.4 415.9v-43.6"/>
			<path class="s0" d="m875.9 381.6h-6.7"/>
			<path class="s0" d="m872.4 379.7h-3.2"/>
			<path class="s0" d="m875.9 389.2h-6.7"/>
			<path class="s0" d="m875.9 406.2h-3.5"/>
			<path class="s0" d="m869.2 412.7h19.8 8.3v3.2"/>
			<path class="s0" d="m889 415.5v-2.8"/>
			<path class="s0" d="m880.7 412.7v3.2"/>
			<path class="s0" d="m874.2 370.9v-39.1"/>
			<path class="s0" d="m871.5 375.4v-43.6"/>
			<path class="s0" d="m874.5 341h-5.3"/>
			<path class="s0" d="m869.2 337.8h38.4v-6.2"/>
			<path class="s0" d="m874.5 348.6h-5.3"/>
			<path class="s0" d="m871.2 366.2h36.4 11.6v4.2"/>
			<path class="s0" d="m896.4 331.6v6.2"/>
			<path class="s0" d="m885.3 331.4v6.1"/>
			<path class="s0" d="m907.3 370.4v-3.7"/>
			<path class="s0" d="m896.4 366.4v4"/>
			<path class="s0" d="m885.3 366.4v3.7"/>
			<path fill-rule="evenodd" class="s0" d="m851.4 391h-13.7v-17.7h6.8 6.9z"/>
			<path class="s0" d="m845 391v-17.7"/>
			<path class="s0" d="m837.7 382.6h13.7"/>
			<path fill-rule="evenodd" class="s0" d="m869.2 415.9h-7.9v-42.2h7.9v11.3z"/>
			<path class="s0" d="m860.9 384.6h8.3"/>
			<path class="s0" d="m861.3 398.9h7.9"/>
			<path class="s4" d="m1253 332v85.3"/>
			<path class="s0" d="m699.6 252.6v-8.4c0 0-8.1-0.4-8.1 8.5"/>
			<path class="s0" d="m698.7 233.1l-4.4-7.2c0 0-3.7 2.1-4 6.1"/>
			<path class="s0" d="m710.4 333.6v82.3"/>
			<path class="s0" d="m703.1 349h7.3"/>
			<path class="s0" d="m703.1 357.4h7.3"/>
			<path class="s0" d="m703.1 361.6h7.3"/>
			<path class="s0" d="m703.1 365.8h7.3"/>
			<path class="s0" d="m703.1 369.7h7.3"/>
			<path class="s0" d="m703.1 379.4h7.3"/>
			<path class="s0" d="m703.1 383.6h7.3"/>
			<path class="s0" d="m703.1 387.8h7.3"/>
			<path class="s0" d="m703.1 391.7h7.3"/>
			<path class="s0" d="m703.1 400.1h7.3"/>
			<path class="s0" d="m710.4 408.8h4.2 86.5v7.1"/>
			<path class="s0" d="m714.6 415.9v-7.1"/>
			<path class="s0" d="m723.9 415.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m716.4 408.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m718.5 412.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m717.8 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m720 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m738.6 415.9v-7.1"/>
			<path class="s0" d="m748 415.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m740.5 408.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m742.5 412.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m741.8 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m744.1 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m764.6 415.9v-7.1"/>
			<path class="s0" d="m773.9 415.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m766.4 408.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m768.5 412.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m767.8 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m770 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m788.9 415.9v-7.1"/>
			<path class="s0" d="m798.2 415.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m790.7 408.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m792.8 412.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m792.1 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m794.3 413.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m797 332.9v7.1"/>
			<path class="s0" d="m787.7 332.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m795.2 339.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m793.1 336.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m793.8 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m791.6 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m772.9 332.9v7.1"/>
			<path class="s0" d="m763.6 332.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m771.1 339.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m769.1 336.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m769.8 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m767.5 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m747 332.9v7.1"/>
			<path class="s0" d="m737.7 332.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m745.2 339.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m743.1 336.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m743.8 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m741.6 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m722.7 332.9v7.1"/>
			<path class="s0" d="m713.4 332.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m720.9 339.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m718.8 336.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m719.5 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m717.3 336c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m735.4 408.9v7"/>
			<path class="s0" d="m752.1 408.9v7"/>
			<path class="s0" d="m760.7 408.9v7"/>
			<path class="s0" d="m777.3 408.9v7"/>
			<path class="s2" d="m801.2 407.7h8.2v1.6h-8.2z"/>
			<path class="s0" d="m734.8 333.1v7"/>
			<path class="s0" d="m751.4 333.1v7"/>
			<path class="s0" d="m760.1 333.1v7"/>
			<path class="s0" d="m776.7 333.1v7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m801.8 360.8v26.1h-7.1v-26.1z"/>
				<path class="s0" d="m801.3 377.8h-6.7"/>
				<path class="s0" d="m801.8 369.2h-7.2"/>
			</g>
			<path class="s0" d="m818.6 396.2v-64.8h12"/>
			<path class="s0" d="m818.6 354.7h50.6"/>
			<path class="s0" d="m827.1 362.4h41.5"/>
			<path class="s0" d="m859.8 355v7.4"/>
			<path class="s0" d="m851.4 354.7v7.3"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m842.3 362.2h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m840.2 358.9h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m840.9 358.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m838.7 358.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m842.3 358.7h26.9"/>
			<path class="s0" d="m837.4 358.7h-14.6v30.5"/>
			<path class="s0" d="m827.1 355v14.8 19.4h-8.2"/>
			<path class="s0" d="m818.9 369.8h8.2"/>
			<path class="s0" d="m818.6 379.4h8.2"/>
			<path class="s0" d="m818.6 381.6h4.2"/>
			<path class="s0" d="m856.7 355v3.9"/>
			<path class="s0" d="m834.5 355v3.7"/>
			<path class="s0" d="m846 355v3.7"/>
			<path class="s0" d="m1261.6 440.8v99h-434l-13.3 18"/>
			<path class="s0" d="m701.3 340.1h-5.8v69.1h5.8"/>
			<g>
				<path class="s1" d=""/>
				<path class="s1" d="m587.5 281.2l-3.1-0.5 1.2-7.4-13.2-2.2 12.8-76.9 78.9 13.3-15.4 92.7-48.3-8.1 1.4-8.5"/>
				<path fill-rule="evenodd" class="s1" d="m602 283.8l38.8 6.4-1.3 7.7-38.8-6.4z"/>
				<path fill-rule="evenodd" class="s1" d="m640.9 289.2l8.9 1.5-1.4 8.2-8.9-1.5z"/>
				<path class="s1" d="m617.9 287.1l-1.3 7.5"/>
				<path class="s1" d="m610 285.8l-1.3 7.5"/>
				<path class="s1" d="m625.4 288.4l-1.3 7.4"/>
				<path class="s1" d="m631.4 289.4l-1.2 7.4"/>
				<path class="s1" d="m615.6 290.2l24.3 4"/>
				<path class="s1" d="m601.1 287.8l10.1 1.7"/>
				<path class="s2" d="m587.3 282.5l-3.1-0.5-0.5-0.1 0.3-1.8 3.5 0.6z"/>
				<path class="s2" d="m602.1 284.9l-6.7-1.1-1.1-0.2 0.3-1.7 7.8 1.3z"/>
				<path class="s1" d="m586.9 281.7l-1.4 8.3c0 0 7.8 2.9 9.5-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m611.9 285.4l4.5 0.7-0.8 5-4.5-0.7z"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path class="s0" d="m553 275.3l3.1 0.6 1.2-7.4 13.2 2.2 12.8-76.8-78.9-13.3-15.5 92.9 48.3 8 1.5-8.5"/>
				<path fill-rule="evenodd" class="s1" d="m536.9 281.6l-38.7-6.4 1.2-7.7 38.8 6.5z"/>
				<path fill-rule="evenodd" class="s0" d="m498.3 274.6l-8.9-1.5 1.4-8.2 8.9 1.5z"/>
				<path class="s1" d="m522.3 271.1l-1.3 7.5"/>
				<path class="s1" d="m530.2 272.5l-1.2 7.4"/>
				<path class="s1" d="m514.8 269.9l-1.2 7.4"/>
				<path class="s1" d="m508.7 268.9l-1.2 7.4"/>
				<path class="s1" d="m523.5 274.8l-24.3-4.1"/>
				<path class="s1" d="m538 277.2l-10.3-1.7"/>
				<path fill-rule="evenodd" class="s1" d="m527.5 277.3l-4.5-0.7 0.9-5 4.4 0.7z"/>
				<path class="s2" d="m552.8 276.6l3.1 0.6h0.5l0.2-1.7-3.5-0.6z"/>
				<path class="s2" d="m537.9 274.2l6.7 1.1 1.2 0.2 0.2-1.8-7.8-1.3z"/>
				<path class="s0" d="m553.4 276.1l-1.4 8.3c0 0-8.4 0.2-6.6-10.1"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m473.7 205.4c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m475.1 197.3c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m472.5 212.7c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m476.4 189.6c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path class="s4" d="m488.3 199.9c-5.3-1.8-4.9-5.9-4.9-5.9l5.6 0.9 0.3-1.6-14.1-2.4"/>
			<path fill-rule="evenodd" class="s4" d="m465.3 191.5c-0.3 0-0.7-0.2-1-0.2-2.7-0.4-5 0.2-5.2 1.4-0.2 1.2 1.8 2.6 4.5 3 2.7 0.4 0.7 0 1 0.1l0.7-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m466.6 183.8c-0.3 0-0.7-0.2-1-0.2-2.7-0.4-5 0.2-5.2 1.4-0.2 1.2 1.8 2.6 4.5 3 2.7 0.4 0.7 0 1 0.1l0.7-4.4z"/>
			<path class="s4" d="m487.9 200.8l-0.3 1.6-5.6-0.9c0 0-0.4 4.1 4.9 5.9"/>
			<path class="s4" d="m486.6 208.9l-0.3 1.6-5.6-0.9c0 0-0.4 4.1 4.9 5.9"/>
			<path class="s4" d="m492.1 178.5l-0.4 2.5 8 1.3c0 0-1.5 8.2-9.6 6.7"/>
			<path class="s2" d="m490.5 188.6l-1 6-1.1-0.2 1-6z"/>
			<path class="s2" d="m488.8 199.5l-0.6 3.4-1.1-0.2 0.6-3.4z"/>
			<path class="s2" d="m487.5 207l-0.6 3.9-1.1-0.2 0.7-3.9z"/>
			<path class="s2" d="m486.2 215l-0.3 1.8-1.1-0.2 0.3-1.8z"/>
			<path class="s4" d="m488.1 201.2l-14.4-2.4"/>
			<path class="s4" d="m486.8 208.9l-14.4-2.4"/>
			<path class="s2" d="m478.1 176.1l-6.4 38.4-1.5-0.2 6.4-38.5z"/>
			<path class="s2" d="m482.3 244.3l-2.8 16.4-1.9-0.3 2.7-16.4z"/>
			<path class="s2" d="m442.3 237.7l-2.8 16.3-1.9-0.3 2.7-16.4z"/>
			<path class="s2" d="m470 174.6l-6.5 38.5-1.5-0.3 6.5-38.4z"/>
			<path class="s2" d="m451.6 213.8l-4.2 25-1.5-0.3 4.2-24.9z"/>
			<path class="s2" d="m480.7 230.1l-2.3 13.8-1.5-0.2 2.3-13.8z"/>
			<path fill-rule="evenodd" class="s4" d="m464.1 200.3l-0.4 2.1c-0.1 0.7-0.8 1.3-1.6 1.1h-0.1c-0.8-0.1-1.3-0.8-1.2-1.6l0.4-2.1c0.1-0.7 0.8-1.2 1.6-1.1h0.1c0.8 0.1 1.3 0.8 1.2 1.6z"/>
			<path fill-rule="evenodd" class="s4" d="m462.8 208l-0.4 2c-0.1 0.8-0.8 1.3-1.6 1.2h-0.1c-0.7-0.2-1.3-0.9-1.1-1.7l0.3-2c0.1-0.8 0.9-1.3 1.6-1.2h0.1c0.8 0.2 1.3 0.9 1.2 1.7z"/>
			<path class="s4" d="m463.7 205l-7.2-1.1"/>
			<path class="s4" d="m457.9 202.5l-0.5 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m481.6 244.7l-0.4 2.3-40.2-6.7 0.4-2.3z"/>
			<path fill-rule="evenodd" class="s0" d="m488 217.6l-0.4 2.3-40.3-6.7 0.4-2.3z"/>
			<path class="s0" d="m454.4 172.1l-0.5 3-8.5-1.4c0 0-1.4 7.9 7.2 9.3l-0.9 5.2h0.5"/>
			<path class="s4" d="m465.2 197.3l-14.7-2.5 0.2-1h0.7c5.6 0.2 6.6-3.8 6.6-3.8l-5.6-0.9 0.3-1.6 14.1 2.4"/>
			<path fill-rule="evenodd" class="s4" d="m466.8 245.1l-1.1 6.6-12.2-2 1.1-6.6z"/>
			<path fill-rule="evenodd" class="s4" d="m464.3 247.1c-0.2 1.3-1.4 2.2-2.7 1.9l-3.4-0.5c-1.3-0.2-2.2-1.5-2-2.8 0.3-1.3 1.5-2.2 2.8-1.9l3.4 0.5c1.3 0.2 2.2 1.5 1.9 2.8z"/>
			<path class="s2" d="m461.7 245.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path class="s2" d="m459.7 245.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path class="s0" d="m448 234.7l30.1 5.1"/>
			<path class="s0" d="m479.3 229.7l8.3 1.4c0 0 1.7-8-7-9.4l0.5-3"/>
			<path class="s0" d="m358.6 195.7l-67.2-11.5-14.9 26.7"/>
			<path class="s0" d=""/>
			<path class="s0" d="m373.8 198.2l15.3 2.6 6.6-41.7 272.3 45.9-16.2 99.9-3.6-0.7"/>
			<path class="s0" d="m391.4 204.1l6.6-41.7 45.1 7.8"/>
			<path class="s0" d="m471.7 267.7l15.2 2.7 15.1-90.2-58.9-10-14.4 89.4 16 2.8"/>
			<path class="s0" d="m394.3 185.8l20.8 3.4"/>
			<path class="s0" d="m394.3 188.7l20.8 3.4"/>
			<path class="s0" d="m393.3 191l20.8 3.4"/>
			<path class="s0" d="m392.9 193.3l20.8 3.3"/>
			<path class="s0" d="m392.9 196l20.8 3.4"/>
			<path class="s0" d="m392.1 198.3l20.9 3.3"/>
			<path class="s0" d="m391.4 200.8l20.8 3.4"/>
			<path class="s0" d="m391.4 203.4l20.8 3.3"/>
			<path class="s0" d="m390.6 205.7l20.8 3.4"/>
			<path class="s0" d="m390.1 208.3l20.8 3.4"/>
			<path class="s0" d="m389.4 210.9l20.9 3.4"/>
			<path class="s0" d="m389.1 213.1l20.8 3.3"/>
			<path class="s0" d="m388.9 216.1l20.8 3.4"/>
			<path class="s2" d="m414.7 187.2l2.3 0.4-6 35.6-2.3-0.4z"/>
			<path class="s0" d="m404.7 184.2l-6.3 36.1"/>
			<path class="s0" d="m391.6 202.5l10-2.7"/>
			<path class="s0" d="m401.6 204.7l10.9-2.7"/>
			<path class="s0" d="m416 189.4l23 4.2"/>
			<path class="s0" d="m409.9 222l12.7 2.4"/>
			<path class="s0" d="m422.1 224.1c-1.5 8.7 6.6 9.7 6.6 9.7l1.4-8.3 4 0.6"/>
			<path class="s3" d="m664.3 227.6l21.3 3.5v52.3"/>
			<path class="s3" d="m654.7 287.8l30.9 5.5v-2.8"/>
			<path class="s0" d="m685.4 291l-6.1-5.5c0 0 2.5-3.8 7.1-1.7"/>
			<path class="s0" d="m691.7 252.2h-5.2"/>
			<path class="s0" d="m690.7 232h-4.2"/>
			<path class="s0" d="m702.6 252.2h-3.5"/>
			<path class="s0" d="m565.7 285.2l-8.9-1.6 2.3-12.7 24.2 4.2-2.4 12.8-8.2-1.4"/>
			<path class="s1" d="m565.1 285.5l-1.4 8.3c0 0 7.8 2.9 9.5-7.5"/>
			<path class="s0" d="m370.4 219.2l15.4 2.6 3.2-20.5"/>
			<path class="s0" d="m344.7 193.3l-2.8 21 13.3 2.3"/>
			<path class="s0" d="m374.3 198l1.6-8.3c0 0-7.7-3.1-9.7 7.2"/>
			<path class="s0" d="m358.1 195.3l1.2-8.4c0 0 8.3-0.5 6.8 10"/>
			<path class="s0" d="m371 218.8l1.6-8.3c0 0-7.7-3.1-9.7 7.2"/>
			<path class="s0" d="m354.8 216.1l1.2-8.4c0 0 8.3-0.5 6.8 10"/>
			<path class="s1" d="m644.8 327.9l6.4 1.2"/>
			<path class="s1" d="m557.6 312.5l71 13.1"/>
			<path class="s1" d="m523.2 306.5l27.6 4.8"/>
			<path class="s1" d="m510.4 304.2l5.5 1"/>
			<path class="s1" d=""/>
			<path class="s1" d=""/>
			<path class="s1" d=""/>
			<path class="s1" d="m545.5 367.6l49.7 35.1"/>
			<path class="s1" d="m523.4 351.9l16.2 11.8"/>
			<path class="s1" d="m517 347.4l-49.9-35.3 1.3-1.7"/>
			<path class="s1" d="m489.8 300.6l-2.3 26"/>
			<path class="s1" d="m513 304.8l-3.2 37.5"/>
			<path class="s1" d="m547.1 310.7l-7.6 52.1"/>
			<path class="s1" d="m582.2 316.7l-10.8 69.1"/>
			<path class="s0" d="m645.3 327.8l-12.2 85.1"/>
			<path class="s1" d="m607.9 388.2l-2.4 20.5"/>
			<path class="s1" d="m593.2 385.1l-1 15.5"/>
			<path class="s0" d="m650.7 329l-12.2 84.8-35.6-5.7-1.1-1.3-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path class="s1" d="m572 381.9l64 10.9"/>
			<path class="s1" d="m572 383.1l20.8 8.6"/>
			<path class="s1" d="m510.4 335.5l32.3 4.9"/>
			<path class="s1" d="m543.3 338.6l34.7 5.2"/>
			<path fill-rule="evenodd" class="s0" d="m580.8 325.2l8.9 1.5 1.4-7.8-8.8-1.7z"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m628.1 325.5l-37-6.4-1.2 7.7 37 6.3z"/>
				<path class="s0" d="m612.6 323.1l-1.2 7.4"/>
				<path class="s0" d="m620.1 324.4l-1.1 7.4"/>
				<path class="s0" d="m605.4 321.8l-1.1 7.4"/>
				<path class="s0" d="m599.6 320.8l-1.1 7.4"/>
				<path class="s0" d="m614.1 326.7l-23.6-4"/>
				<path class="s0" d="m627.6 329.1l-9.6-1.7"/>
				<path fill-rule="evenodd" class="s0" d="m618 327.4l0.6-3.5-4.3-0.8-0.8 5 4.3 0.7z"/>
			</g>
			<path class="s1" d="m630.4 391.8l-0.7 5.2-2 15"/>
			<path class="s1" d="m635.2 397.9l-27.6-4.2"/>
			<path class="s1" d="m635.2 400.4l-5.5-0.8"/>
			<path class="s1" d="m633.6 406.3l-5.5-0.8"/>
			<path class="s1" d="m633.6 409.8l-5.5-0.8"/>
			<path class="s1" d="m550.3 311.2l-1.7 10.1c0 0 4.5 1.3 7.4-2.2 2.9-3.5 1.8-3.4 2.1-7"/>
			<path class="s1" d="m517.4 347.1l-6.5 7.5c0 0 3.1 3.6 7.4 2.2 4.3-1.4 3.6-2.1 5.8-5"/>
			<path class="s1" d="m539 363.6l6.6-9.1c0 0 4.2 2.2 3.8 6.7-0.4 4.5-1.5 4.2-3.8 7"/>
			<path class="s1" d="m515.4 305.6l1.4-10c0 0 4.7-0.1 6.5 4 1.8 4.1 0.8 3.9 0.1 7.4"/>
			<path class="s1" d="m469.1 310.4l-8.4-5.5c0 0 1.9-4.3 6.5-4.2 4.6 0.1 4 1.1 6.8 3.1"/>
			<path class="s1" d="m510.9 304.6l-1.2 10.2c0 0-4.7 0.2-6.6-3.9-1.9-4.1-0.8-4.9-0.1-8.5"/>
			<path class="s1" d="m492 329.7l2.4-3.1 11.5 7.8-2.6 3.3"/>
			<path class="s1" d="m488.1 324.3l22.8 1.1"/>
			<path class="s1" d="m505.9 334.4l5-4.8"/>
			<path fill-rule="evenodd" class="s4" d="m488.3 321.7c0.3 0 0.7 0.1 1 0.1 2.7 0.2 5-0.6 5.1-1.8 0.1-1.2-2-2.4-4.7-2.7-2.7-0.3-0.7 0-1.1 0l-0.4 4.4z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m489.3 303.6l6.7 0.6-0.8 8.9-6.7-0.6z"/>
				<path class="s2" d="m490.1 307.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m489.9 309.1c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m493.9 308.4c-0.2 1.6-1.2 2.8-2.3 2.7-1.1-0.1-1.9-1.5-1.7-3.1 0.1-1.6 1.1-2.8 2.2-2.7 1.1 0.1 1.9 1.5 1.8 3.1z"/>
			</g>
			<path class="s1" d="m473.5 303.5c0.6-1 1.9-3.4 2.8-4.3 0.9-0.9 2.1-0.7 3.3-0.5 6 1.1 12.1 2.2 18.1 3.2l5.6 1"/>
			<path class="s0" d="m640.2 335.7l3.9 0.7"/>
			<path class="s0" d="m626.9 333.1l6 1.1"/>
			<path class="s1" d="m640.6 336.1l1.7-11.1c0 0-4.5-1.4-7.4 2.1-2.9 3.5-1.9 3.9-2.2 7.5"/>
			<path class="s0" d="m355.5 266.7c103.9 73.2 222 156.3 271.6 191.2"/>
			<path class="s0" d="m353.9 268.2c40.2 28.3 82.6 58.5 122 86.2 63.9 44.9 120.5 84.8 149.6 105.3"/>
			<path class="s0" d="m339.6 258.8c-14.1-9.9-28.3-20.2-41.6-29.6l1.3-2.1c13.4 9.4 27.3 19.2 41.6 29.3"/>
			<path class="s0" d="m613.2 469c2.4 1.3 3.9 2.1 5.8 3.2"/>
			<path class="s0" d="m554.2 436.8c16.7 9.1 33.5 18.4 45.5 24.9"/>
			<path class="s0" d="m504.9 409.8c12.3 6.7 24.1 13.2 35.2 19.3"/>
			<path class="s0" d="m397.9 351.2c31.9 17.5 63.4 34.7 92.5 50.6"/>
			<path class="s0" d="m196.7 241l28.6 15.7"/>
			<path class="s0" d="m466.7 564.3c34 17.9 61.4 32.5 79.8 42.2"/>
			<path class="s0" d="m200.1 423.3c24.3 12.9 50.1 26.6 75.8 40.2"/>
			<path class="s0" d="m180.9 413.2c3.9 2.1 7.9 4.2 11.9 6.3"/>
			<path class="s0" d="m170.2 407.5c-38.9-20.6-71.2-38.5-97.9-52.6l1.3-2.4 98.3 52.2"/>
			<path class="s0" d="m384.8 546.4l5.1 2.7-5.9 10.4-11.5-6.2 5.3-10.3c-35.1-18.7-58.1-31-94.4-50.5l-5.9 10.3-12.3-7 5.6-10.3 5 2.9c0 0 3.4-6 5.5-7.2 3.9-2.3 7.7 0.7 7.7 0.7l-5.1 8.6"/>
			<path class="s0" d="m184.1 438.4c2.1 1.2 6.2 3.4 6.2 3.4"/>
			<path class="s0" d="m82.3 488.8l44.2-81.4 4 2.1"/>
			<path class="s0" d="m576.6 648.3c0 0-37.1-19.5-92.4-48.7l-5.4 9.9-13.3-6.8 5.3-10.2 6.1 3.2"/>
			<path class="s0" d="m82.3 488.3c164.2 86.9 409.7 217.2 409.7 217.2l43-79"/>
			<path class="s1" d="m626.7 457.6l-80.7 148.7"/>
			<path fill-rule="evenodd" class="s0" d="m440.4 550.6l19.2 10 1.8-3.1-19.3-10.2z"/>
			<path class="s0" d="m623.5 455l-79.3 146.1-75.8-40-1.8 3.5c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3"/>
			<path class="s1" d="m459.7 385.1l16.2-30.6"/>
			<path class="s1" d="m597.4 461l7.4-15.7"/>
			<path class="s0" d="m441.2 377.7l11.3-20.6-53.4-35.5-12.5 23.4"/>
			<path class="s4" d="m394.1 296.8l-29.4 56"/>
			<path class="s0" d="m231.8 370.2l-29.1 54.6"/>
			<path class="s0" d="m252.6 331l-17.1 32.3"/>
			<path class="s0" d="m264.6 308.6l-6.2 11.7"/>
			<path class="s0" d="m304.7 234.2l-34.6 64.7"/>
			<path class="s0" d="m203.2 335.1l-36.9 66.8"/>
			<path class="s0" d="m265.1 222.9l-49.6 90"/>
			<path class="s0" d="m240 355.1l-81.5-43.4"/>
			<path class="s0" d="m127.8 369.2l-6.7 12.4"/>
			<path class="s0" d="m145.9 335.6l-13.8 25.7"/>
			<path class="s0" d="m180.7 271l-26.8 49.7"/>
			<path class="s0" d="m229.3 180.8l-43.7 81.1"/>
			<path class="s0" d="m206 289l-21.5 36.5"/>
			<path class="s0" d=""/>
			<path class="s0" d="m199.3 267.4l-12.9-6.9"/>
			<path class="s0" d="m224.8 256.4l-10.9 18.8-8.2-4.4"/>
			<path class="s0" d="m191.1 209.8l-32.4-17.2 25.4-46.7c19.6 13.9 56.6 40 101.6 71.7l-1.4 2c-44.1-31.1-80.9-57-101.6-71.7"/>
			<path class="s0" d="m187.5 279.5l-8.8-4.7"/>
			<path class="s0" d="m205.7 289.3l-12.3-6.6"/>
			<path class="s0" d="m214.8 313l36.8 20.4"/>
			<path class="s0" d="m507.1 450.1l-56.2 105.9"/>
			<path class="s0" d="m523.1 419.8l-16 30.3"/>
			<path class="s4" d="m352.3 360.6l-30.1 55.3"/>
			<path class="s4" d="m361.9 351l-42.1 79.1"/>
			<path class="s4" d="m316.2 425.6c0 0-1.3-4.2-1.5-5.8-0.2-1.6 1.2-3.8 1.2-3.8 0 0 31.9-60.9 33.3-62.8 1.4-1.9 5.7-1.6 5.7-1.6l6.5 0.5"/>
			<path class="s4" d="m362.5 341.6c-6.8 1.1-14.7 1.7-18.4 8.6-3.7 6.9-4 7.6-6 11.4q-9.7 18.3-19.5 36.6c-2.3 4.3-4.6 8.7-7 13-2.6 4.9-4.2 8.4-2.9 14 1.3 5.6 2.5 7.8 3.7 11.1"/>
			<path fill-rule="evenodd" class="s4" d="m373.6 320.7l6.4 3.3-14.7 28.4-6.4-3.3z"/>
			<path fill-rule="evenodd" class="s4" d="m374.2 323.2l3.2 1.7-12.9 25-3.2-1.7z"/>
			<path fill-rule="evenodd" class="s4" d="m379.8 324l-6.4-3.3 14.6-28.1 6.1 4.2z"/>
			<path fill-rule="evenodd" class="s4" d="m379 321.6l-3.3-1.7 12.7-24.4 3 2.1z"/>
			<path class="s2" d="m516.5 416.4l11.8 6.4-5.9 10.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m528.1 422.8l11.8 6.4-6.4 11.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m504.6 410l11.8 6.4-6.4 11.8-11.8-6.4z"/>
			<path class="s0" d="m398.7 369.8l23.9 13.8-4.5 8.4-10.1 2.4-4.7-3.1 8.8-13.8"/>
			<path class="s0" d="m399.4 368.4l24.4 14 2.3-3.9-2.1-1.1-2.1 3.6"/>
			<path class="s0" d="m441.6 378l-45-24.6 1.1-2"/>
			<path class="s0" d="m408.3 360l-5.5 10.3"/>
			<path class="s0" d="m410.6 361.4l-5.5 10.3"/>
			<path class="s0" d="m413 362.3l-5.5 10.3"/>
			<path class="s0" d="m415.2 363.7l-5.5 10.3"/>
			<path class="s0" d="m417.3 365.1l-5.4 10.3"/>
			<path class="s0" d="m405.3 371.4l12-6.3"/>
			<path class="s4" d="m405.3 375.4l-51.2 97.9"/>
			<path class="s0" d="m422.6 383.6c0 0 1.6 0.6 1.6 3.4 0 2.8-0.6 6-0.8 7-0.2 1-0.2 0.6-0.3 0.8-3 5.7-39.5 74.7-44.4 84.1-4.9 9.4-4.8 10-6.8 10.2-2 0.2-5.1 1-5.1 1l-2.6 5.1-1.6-0.9 6.4-13.2-2.9-8.8-3.5-1.5-8.4 14.7-16.1-8.5 8.5-15.8"/>
			<path class="s4" d="m366 472.2c0 0 2.8 0 3.9-1.5 3.2-4.6 37.7-71.4 37.8-71.6 0.5-0.8 1.9-3.4 0.3-4.7"/>
			<path class="s4" d="m367.7 477c0 0 4.6 0.4 5.6-1.3 1-1.7 39.6-75.3 39.6-75.3 0 0 1-2.1 1-4.5v-3"/>
			<path class="s2" d="m346.6 465.9l11.8 6.4-5.9 10.8-11.8-6.4z"/>
			<path class="s0" d="m358.2 478.4l9.5 5.1"/>
			<path class="s0" d="m317.8 466.5l-16.8-9.4 16.1-29.1 6.1 3.7-6.9 13.1 19.6 11-8.7 15.9-2.5-1.4"/>
			<path class="s0" d="m328.8 468.8l10.4 6"/>
			<path class="s0" d="m330 466.6l10.4 6.1"/>
			<path class="s0" d="m331.4 464.7l10.3 6"/>
			<path class="s0" d="m332.6 462.5l10.4 6.1"/>
			<path class="s0" d="m334 459.7l10.4 6.1"/>
			<path class="s0" d="m335.2 457.6l10.4 6"/>
			<path class="s0" d="m344.4 465.8l-14.4 0.8"/>
			<path fill-rule="evenodd" class="s0" d="m321.8 415.3l3.2 1.6-5.9 11.5-3.2-1.7z"/>
			<path class="s4" d="m408.3 306.8l-8.9 13.9-21.2 39.9"/>
			<path class="s4" d="m441.3 330.1l-9.7 13.1"/>
			<path class="s4" d="m454.2 339.2l-3.7 4.6"/>
			<path class="s1" d="m450.4 343.4c2.9 1.7 4.8 3.3 5.5 5 2 4.1-1.2 7.6-1.2 7.6l-8.5-5.5-1.4 1.6"/>
			<path class="s1" d="m397.7 351.5c1.8-2.9 2.7-5.1 2.6-7-0.2-4.5-4.6-6.2-4.6-6.2l-5 8.8-4.2-2.1"/>
			<path class="s1" d="m294.2 469.4l1.1-2.3-8.8-5c0 0 1.7-4.4 6.2-4.6 4.5-0.2 3.7 0.4 6.5 2.2l1.7-2.6"/>
			<path class="s1" d="m326.4 471.2l-1.7-1-5 8.8c0 0-4.4-1.7-4.6-6.2-0.2-4.5 0.4-3.7 2.2-6.5"/>
			<path class="s0" d="m447.7 554.1c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3l1.4-2.7-150.2-79.2-1.6 2.9c52.1 27.6 104.6 55.4 150.3 79.6"/>
			<path class="s0" d="m194.4 416.7l-12.1-6.4"/>
			<path class="s0" d="m290.7 471.4c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3l1.3-2.8-75.2-39.7"/>
			<path class="s0" d="m540.3 428.8l-4.8 8.7c0 0 3.7 2.9 7.7 0.7 4-2.2 3.1-2.8 4.7-6.1"/>
			<path class="s0" d="m554.7 436.7l-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path class="s0" d="m613.3 469.7l5-8.6c0 0-3.7-3-7.6-0.8-3.9 2.2-2.9 2.6-4.6 5.9"/>
			<path class="s0" d="m599.1 461.8l4.6-9c0 0 4.4 1.6 4.7 6.1 0.3 4.5-0.5 4.1-2.4 7.2"/>
			<path class="s4" d="m622 481.4l-6-3.5"/>
			<path class="s0" d="m614.8 480l6 3.6"/>
			<path class="s0" d="m613.5 482.3l6.1 3.5"/>
			<path class="s0" d="m612.3 484.4l6.1 3.6"/>
			<path class="s0" d="m611.5 486.7l6 3.5"/>
			<path class="s0" d="m610.3 488.9l6 3.5"/>
			<path class="s0" d="m490.4 401.3l-4.8 8.7c0 0 3.7 2.9 7.7 0.7 4-2.2 3.1-2.8 4.7-6.1"/>
			<path class="s0" d="m504.8 409.2l-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path class="s0" d="m454.7 373.3c1.7-3.2 2.9-4.9 4.6-5.9 4-2.2 7.6 0.8 7.6 0.8l-4.7 8.7 1.4 0.7"/>
			<path class="s0" d="m454.7 373.3c1.9-3.1 2.5-5.3 2.4-7.2-0.2-4.5-4.7-6.1-4.7-6.1l-4.8 8.8-1.2-0.7"/>
			<path class="s0" d="m400.1 319.6l-13.5-7.8"/>
			<path class="s0" d="m379.4 357.1l-13.4-6.5"/>
			<path class="s0" d="m532 624.8l-41.7 75.2-402.4-213.1 41.8-77.8 47.8 25.9-3.7 6.9-47.8-25.8"/>
			<path class="s0" d="m330.6 517.9l-42.8 79.6"/>
			<path class="s0" d=""/>
			<path class="s1" d=""/>
			<path class="s1" d="m531.7 624.7l-47.1-24.7-3.7 6.9 47.1 24.8"/>
			<path class="s1" d="m495.6 614.3l3.5-6.7"/>
			<path class="s1" d="m488.5 610.6l3.5-6.7"/>
			<path class="s1" d="m502.4 617.9l3.5-6.7"/>
			<path class="s1" d="m507.8 620.7l3.5-6.7"/>
			<path class="s1" d="m495.4 610.4l34.3 18.1"/>
			<path class="s1" d="m482.6 603.7l9 4.7"/>
			<path fill-rule="evenodd" class="s1" d="m492.9 607l4 2.1-2.4 4.5-4-2.1z"/>
			<path class="s1" d="m512.1 622.8l3.5-6.7"/>
			<path class="s1" d="m521.8 624.5l2.1-3.9"/>
			<path class="s0" d="m462.3 595.2l5.5 3.1"/>
			<path class="s1" d=""/>
			<path class="s1" d="m330.3 517.8l-46.8-25.4-3.7 6.9 46.7 25.5"/>
			<path class="s1" d="m294.4 506.9l3.6-6.6"/>
			<path class="s1" d="m287.3 503.1l3.6-6.7"/>
			<path class="s1" d="m301 510.5l3.6-6.6"/>
			<path class="s1" d="m306.4 513.5l3.6-6.7"/>
			<path class="s1" d="m294.4 503.1l33.8 18.5"/>
			<path class="s1" d="m281.5 496.1l9.4 5.1"/>
			<path fill-rule="evenodd" class="s1" d="m291 499.6l4 2.2-2.4 4.5-4-2.2z"/>
			<path class="s1" d="m310.7 515.6l3.6-6.6"/>
			<path class="s1" d="m320.3 517.5l2.2-3.9"/>
			<path class="s1" d="m330.7 518l46.8 25.4-3.7 6.8-46.8-25.2"/>
			<path class="s1" d="m359.5 542.2l3.6-6.7"/>
			<path class="s1" d="m366.5 546l3.6-6.6"/>
			<path class="s1" d="m352.8 538.6l3.6-6.7"/>
			<path class="s1" d="m347.4 535.6l3.6-6.6"/>
			<path class="s0" d="m362.7 540.1l-34-18.3"/>
			<path class="s0" d="m375.5 547.1l-9-4.9"/>
			<path fill-rule="evenodd" class="s1" d="m365 545.4l-3.9-2.2 2.4-4.5 4 2.2z"/>
			<path class="s0" d="m386.8 554.6l5.8 3.4"/>
			<path class="s0" d="m260.7 488.3l6.4 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m926.6 468.5h-8.7-1v-8.5h9.7z"/>
			<path class="s0" d="m917.8 536.9v-68.4"/>
			<path class="s0" d="m921.7 493.3v-18.4"/>
			<path class="s0" d="m921.7 536.9v-27.3"/>
			<path class="s0" d="m918.3 476.8h8.3"/>
			<path class="s0" d="m918.3 484.9h8.3"/>
			<path class="s0" d="m918.3 493.1h8.3"/>
			<path class="s0" d="m918.3 509.8h8.3"/>
			<path class="s0" d="m918.3 518h8.3"/>
			<path class="s0" d="m918.3 526h8.3"/>
			<path class="s0" d="m918.3 501.3h8.3"/>
			<path class="s0" d="m923.9 468.5v68.9"/>
			<path class="s0" d="m923.9 530.8c-0.3-0.1-79.1 0-79.1 0v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m918.5 474.9v-4.5h5.1v4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m853.9 536.1v-4.5h5.1v4.5z"/>
			<path class="s0" d="m909.8 530.8v6.1"/>
			<path class="s0" d="m901.6 530.8v6.1"/>
			<path class="s0" d="m893.3 530.8v6.1"/>
			<path class="s0" d="m884.9 530.8v6.1"/>
			<path class="s0" d="m876.4 530.8v6.1"/>
			<path class="s0" d="m868.3 530.8v6.1"/>
			<path class="s0" d="m788.8 488.8l30.1-42.2h76v5.3h5.7"/>
			<path class="s0" d="m815.1 556.8l-49.4-35.6 18.2-25.5"/>
			<path class="s0" d="m778.1 503.4l5.3 3.6"/>
			<path class="s0" d="m822.2 532.8l-12.6 16.9 5.2 3.8 12.3-16.8"/>
			<path class="s0" d="m811.7 547.7l4.7 3.6"/>
			<g>
				<path class="s0" d="m1145.9 308.4v3.8"/>
				<path class="s0" d="m1148.6 308.4v3.8"/>
				<path class="s0" d="m1151.4 308.4v3.8"/>
				<path class="s0" d="m1154.1 308.4v3.8"/>
				<path class="s0" d="m1156.8 308.4v3.8"/>
				<path class="s0" d="m1159.5 308.4v3.8"/>
				<path class="s0" d="m1162.2 308.4v3.8"/>
				<path class="s0" d="m1164.9 308.4v3.8"/>
				<path class="s0" d="m1167.6 308.4v3.8"/>
				<path class="s0" d="m1170.3 308.4v3.8"/>
				<path class="s0" d="m1173.1 308.4v3.8"/>
				<path class="s0" d="m1175.8 308.4v3.8"/>
				<path class="s0" d="m1178.5 308.4v3.8"/>
				<path class="s0" d="m1181.2 308.4v3.8"/>
				<path class="s0" d="m1183.9 308.4v3.8"/>
				<path class="s0" d="m1186.6 308.4v3.8"/>
				<path class="s0" d="m1189.3 308.4v3.8"/>
				<path class="s0" d="m1192.1 308.4v3.8"/>
			</g>
			<g>
				<path class="s0" d="m1033 308.4v3.8"/>
				<path class="s0" d="m1035.7 308.4v3.8"/>
				<path class="s0" d="m1038.4 308.4v3.8"/>
				<path class="s0" d="m1041.1 308.4v3.8"/>
				<path class="s0" d="m1043.8 308.4v3.8"/>
				<path class="s0" d="m1046.6 308.4v3.8"/>
				<path class="s0" d="m1049.3 308.4v3.8"/>
				<path class="s0" d="m1052 308.4v3.8"/>
				<path class="s0" d="m1054.7 308.4v3.8"/>
				<path class="s0" d="m1057.4 308.4v3.8"/>
				<path class="s0" d="m1060.1 308.4v3.8"/>
				<path class="s0" d="m1062.8 308.4v3.8"/>
				<path class="s0" d="m1065.6 308.4v3.8"/>
				<path class="s0" d="m1068.3 308.4v3.8"/>
				<path class="s0" d="m1071 308.4v3.8"/>
				<path class="s0" d="m1073.7 308.4v3.8"/>
				<path class="s0" d="m1076.4 308.4v3.8"/>
				<path class="s0" d="m1079.1 308.4v3.8"/>
			</g>
			<g>
				<path class="s0" d="m984.4 308.4v3.8"/>
				<path class="s0" d="m987.1 308.4v3.8"/>
				<path class="s0" d="m989.8 308.4v3.8"/>
				<path class="s0" d="m992.5 308.4v3.8"/>
				<path class="s0" d="m995.2 308.4v3.8"/>
				<path class="s0" d="m997.9 308.4v3.8"/>
				<path class="s0" d="m1000.6 308.4v3.8"/>
				<path class="s0" d="m1003.3 308.4v3.8"/>
				<path class="s0" d="m1006.1 308.4v3.8"/>
				<path class="s0" d="m1008.8 308.4v3.8"/>
				<path class="s0" d="m1011.5 308.4v3.8"/>
				<path class="s0" d="m1014.2 308.4v3.8"/>
				<path class="s0" d="m1016.9 308.4v3.8"/>
				<path class="s0" d="m1019.6 308.4v3.8"/>
				<path class="s0" d="m1022.3 308.4v3.8"/>
				<path class="s0" d="m1025.1 308.4v3.8"/>
				<path class="s0" d="m1027.8 308.4v3.8"/>
				<path class="s0" d="m1030.5 308.4v3.8"/>
			</g>
			<g>
				<path class="s0" d="m869.2 308.4v3.8"/>
				<path class="s0" d="m872 308.4v3.8"/>
				<path class="s0" d="m874.7 308.4v3.8"/>
				<path class="s0" d="m877.4 308.4v3.8"/>
				<path class="s0" d="m880.1 308.4v3.8"/>
				<path class="s0" d="m882.8 308.4v3.8"/>
				<path class="s0" d="m885.5 308.4v3.8"/>
				<path class="s0" d="m888.2 308.4v3.8"/>
				<path class="s0" d="m890.9 308.4v3.8"/>
				<path class="s0" d="m893.7 308.4v3.8"/>
				<path class="s0" d="m896.4 308.4v3.8"/>
				<path class="s0" d="m899.1 308.4v3.8"/>
				<path class="s0" d="m901.8 308.4v3.8"/>
				<path class="s0" d="m904.5 308.4v3.8"/>
				<path class="s0" d="m907.2 308.4v3.8"/>
				<path class="s0" d="m909.9 308.4v3.8"/>
				<path class="s0" d="m912.7 308.4v3.8"/>
				<path class="s0" d="m915.4 308.4v3.8"/>
			</g>
			<g>
				<path class="s0" d="m820.6 308.4v3.8"/>
				<path class="s0" d="m823.3 308.4v3.8"/>
				<path class="s0" d="m826 308.4v3.8"/>
				<path class="s0" d="m828.7 308.4v3.8"/>
				<path class="s0" d="m831.4 308.4v3.8"/>
				<path class="s0" d="m834.1 308.4v3.8"/>
				<path class="s0" d="m836.8 308.4v3.8"/>
				<path class="s0" d="m839.6 308.4v3.8"/>
				<path class="s0" d="m842.3 308.4v3.8"/>
				<path class="s0" d="m845 308.4v3.8"/>
				<path class="s0" d="m847.7 308.4v3.8"/>
				<path class="s0" d="m850.4 308.4v3.8"/>
				<path class="s0" d="m853.1 308.4v3.8"/>
				<path class="s0" d="m855.8 308.4v3.8"/>
				<path class="s0" d="m858.6 308.4v3.8"/>
				<path class="s0" d="m861.3 308.4v3.8"/>
				<path class="s0" d="m864 308.4v3.8"/>
				<path class="s0" d="m866.7 308.4v3.8"/>
				<path class="s0" d="m818.1 308.4v3.8"/>
			</g>
			<path class="s0" d="m752.1 312.4h-49.6l0.1-6.9"/>
			<g>
				<path class="s0" d="m705.5 308.5v3.7"/>
				<path class="s0" d="m708.2 308.5v3.7"/>
				<path class="s0" d="m710.9 308.5v3.7"/>
				<path class="s0" d="m713.6 308.5v3.7"/>
				<path class="s0" d="m716.3 308.5v3.7"/>
				<path class="s0" d="m719.1 308.5v3.7"/>
				<path class="s0" d="m721.8 308.5v3.7"/>
				<path class="s0" d="m724.5 308.5v3.7"/>
				<path class="s0" d="m727.2 308.5v3.7"/>
				<path class="s0" d="m729.9 308.5v3.7"/>
				<path class="s0" d="m732.6 308.5v3.7"/>
				<path class="s0" d="m735.3 308.5v3.7"/>
				<path class="s0" d="m738 308.5v3.7"/>
				<path class="s0" d="m740.8 308.5v3.7"/>
				<path class="s0" d="m743.5 308.5v3.7"/>
				<path class="s0" d="m746.2 308.5v3.7"/>
				<path class="s0" d="m748.9 308.5v3.7"/>
				<path class="s0" d="m751.6 308.5v3.7"/>
			</g>
			<path class="s0" d="m982 308.4v3.8"/>
			<g>
				<path class="s0" d="m648.5 304.3l-48.9-8.2 1.2-6.7"/>
				<path class="s0" d="m603.2 292.8l-0.7 3.7"/>
				<path class="s0" d="m605.8 293.2l-0.6 3.7"/>
				<path class="s0" d="m608.5 293.7l-0.6 3.7"/>
				<path class="s0" d="m611.2 294.1l-0.6 3.7"/>
				<path class="s0" d="m613.9 294.5l-0.7 3.8"/>
				<path class="s0" d="m616.5 295l-0.6 3.7"/>
				<path class="s0" d="m619.2 295.4l-0.6 3.8"/>
				<path class="s0" d="m621.9 295.9l-0.6 3.7"/>
				<path class="s0" d="m624.6 296.3l-0.6 3.8"/>
				<path class="s0" d="m627.3 296.8l-0.7 3.7"/>
				<path class="s0" d="m629.9 297.2l-0.6 3.7"/>
				<path class="s0" d="m632.6 297.7l-0.6 3.7"/>
				<path class="s0" d="m635.3 298.1l-0.6 3.7"/>
				<path class="s0" d="m638 298.5l-0.7 3.8"/>
				<path class="s0" d="m640.6 299l-0.6 3.7"/>
				<path class="s0" d="m643.3 299.4l-0.6 3.8"/>
				<path class="s0" d="m646 299.9l-0.6 3.7"/>
				<path class="s0" d="m648.7 300.3l-0.7 3.8"/>
			</g>
			<g>
				<path class="s0" d="m537.1 285.5l-48.9-8.1 1.2-6.8"/>
				<path class="s0" d="m491.8 274l-0.6 3.7"/>
				<path class="s0" d="m494.5 274.5l-0.7 3.7"/>
				<path class="s0" d="m497.1 274.9l-0.6 3.7"/>
				<path class="s0" d="m499.8 275.3l-0.6 3.8"/>
				<path class="s0" d="m502.5 275.8l-0.6 3.7"/>
				<path class="s0" d="m505.2 276.2l-0.6 3.8"/>
				<path class="s0" d="m507.9 276.7l-0.7 3.7"/>
				<path class="s0" d="m510.5 277.1l-0.6 3.8"/>
				<path class="s0" d="m513.2 277.6l-0.6 3.7"/>
				<path class="s0" d="m515.9 278l-0.6 3.7"/>
				<path class="s0" d="m518.6 278.5l-0.7 3.7"/>
				<path class="s0" d="m521.2 278.9l-0.6 3.7"/>
				<path class="s0" d="m523.9 279.3l-0.6 3.8"/>
				<path class="s0" d="m526.6 279.8l-0.6 3.7"/>
				<path class="s0" d="m529.3 280.2l-0.7 3.8"/>
				<path class="s0" d="m531.9 280.7l-0.6 3.7"/>
				<path class="s0" d="m534.6 281.1l-0.6 3.8"/>
				<path class="s0" d="m537.3 281.6l-0.6 3.7"/>
			</g>
			<g>
				<path class="s0" d="m1159 401.7v-53.8h6.8"/>
				<g>
					<path class="s0" d="m1162.9 355.1h-3.7"/>
					<path class="s0" d="m1162.9 357.8h-3.7"/>
					<path class="s0" d="m1162.9 360.5h-3.7"/>
					<path class="s0" d="m1162.9 363.2h-3.7"/>
					<path class="s0" d="m1162.9 365.9h-3.7"/>
					<path class="s0" d="m1162.9 368.7h-3.7"/>
					<path class="s0" d="m1162.9 371.4h-3.7"/>
					<path class="s0" d="m1162.9 374.1h-3.7"/>
					<path class="s0" d="m1162.9 376.8h-3.7"/>
					<path class="s0" d="m1162.9 379.5h-3.7"/>
					<path class="s0" d="m1162.9 382.2h-3.7"/>
					<path class="s0" d="m1162.9 384.9h-3.7"/>
					<path class="s0" d="m1162.9 387.7h-3.7"/>
					<path class="s0" d="m1162.9 390.4h-3.7"/>
					<path class="s0" d="m1162.9 393.1h-3.7"/>
					<path class="s0" d="m1162.9 395.8h-3.7"/>
					<path class="s0" d="m1162.9 398.5h-3.7"/>
					<path class="s0" d="m1162.9 401.2h-3.7"/>
				</g>
			</g>
			<path class="s0" d="m522.8 614.5l8.7 4.7c0 0 2.9-3.9 0.6-7.8-2.3-3.9-2.1-2.4-4.2-3.5"/>
			<path class="s0" d="m531 600.8l8.8 4.6c0 0-1.5 4.5-6 4.8-4.5 0.3-3.2-0.8-5.7-2.2"/>
			<path class="s0" d="m378.5 541l-94-50.8"/>
			<path class="s0" d="m378.5 541.7l4.6-9c0 0 4.4 1.6 4.7 6.1 0.3 4.5-0.5 4.1-2.4 7.2"/>
			<path class="s0" d="m484.6 597.7l4.5-8.7c0 0-3.9-2.7-7.7-0.3-3.8 2.4-3.3 3.1-4.8 6.5"/>
			<path class="s0" d="m184.3 439.1c1.9-3.1 2.5-4.7 2.4-6.6-0.2-4.5-4.7-6.1-4.7-6.1l-10.8 20.4 12.2 6.5 6.5-11.7"/>
			<g>
				<path class="s0" d="m404.4 557.2c18.6 9.9 36.1 19.3 52.4 27.9l1.2-2.2-42.2-22.3"/>
				<path class="s0" d="m415.8 560.5c-3.4-1.8-6.6-3.5-10.2-5.3"/>
				<path class="s0" d="m406.2 554.9l-11.9 22.2"/>
				<path class="s0" d="m415 600.1l-10.3 19.4"/>
				<path class="s0" d="m456.9 585l-10.6 19.6"/>
				<g>
					<path fill-rule="evenodd" class="s0" d="m375.5 632.8l7.1 3.8-2.6 4.8-7-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m382.5 636.5l7.1 3.7-2.6 4.9-7.1-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m389.6 640.2l7.1 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m396.7 644l7 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m403.8 647.7l7.1 3.7-2.6 4.9-7.1-3.7z"/>
				</g>
				<g>
					<path fill-rule="evenodd" class="s0" d="m386.3 611.4l7.4 3.9-2.6 4.9-7.4-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m393.7 615.3l7.4 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m401 619.2l7.4 3.9-2.6 4.8-7.3-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m408.4 623l7.3 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m415.6 626.9l7.3 3.9-2.5 4.8-7.4-3.8z"/>
				</g>
				<path class="s0" d="m372.7 637.4l6.4-12"/>
				<path class="s0" d="m407.9 656.2l6.6-12.3"/>
				<path class="s0" d="m381.9 618.9l15-27.7-8.6-4.8 1.2-2.2 9 4.7c0 0 2.7-3.9 0.3-7.7-2.4-3.8-1.8-2.4-5.1-4.1"/>
				<path class="s0" d="m386.8 609.4l36.8 19.5"/>
				<path fill-rule="evenodd" class="s4" d="m407.7 612.5c-0.3-0.2-0.6-0.4-0.9-0.5-2.4-1.3-4.8-1.5-5.4-0.4-0.6 1.1 0.9 3 3.3 4.3 2.4 1.3 0.6 0.3 1 0.5l2.1-3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m392.2 600.1l5.8 3.2-4.2 7.9-5.9-3.2z"/>
					<path class="s2" d="m391.3 604c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m390.5 605.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m393.8 606.2c-0.7 1.5-2.1 2.2-3.1 1.6-1-0.5-1.2-2.1-0.4-3.5 0.8-1.4 2.2-2.1 3.1-1.6 1 0.6 1.2 2.1 0.4 3.5z"/>
				</g>
				<path class="s0" d="m405.8 595l18.3 10.1"/>
				<path fill-rule="evenodd" class="s4" d="m406.5 617c0.3 0.2 0.6 0.4 0.9 0.5 2.4 1.3 4.8 1.5 5.4 0.4 0.6-1.1-0.9-3-3.3-4.3-2.4-1.3-0.6-0.3-1-0.5l-2.1 3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m424.4 627.4l-5.9-3.2 4.2-7.9 5.9 3.2z"/>
					<path class="s2" d="m425.2 624.6c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m426.1 623c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m426.2 623.5c-0.8 1.4-2.2 2.1-3.1 1.6-1-0.6-1.2-2.1-0.4-3.5 0.8-1.5 2.2-2.2 3.1-1.6 1 0.5 1.2 2 0.4 3.5z"/>
				</g>
				<path class="s0" d="m392 618.3l21.8 11.4"/>
				<path class="s0" d="m413 626.2l-1.3 2.5"/>
				<path class="s0" d="m395.3 616.9l-1.3 2.5"/>
				<path class="s0" d="m462.2 595.7c1.8-3.2 2.5-5.1 2.4-7-0.2-4.5-4.7-6.1-4.7-6.1l-4.6 9-1.3-0.7"/>
				<path class="s0" d="m392.7 558.6c1.9-3.3 3.1-4.8 4.7-5.8 4-2.2 7.7 0.7 7.7 0.7l-4.9 8.6 1.8 0.9"/>
				<path class="s0" d="m424.6 604.9c-1.9 3.1-1.6 5.2-1.6 5.8 0.2 4.5 4.7 6.1 4.7 6.1l4-7.8 2.9 1.7"/>
				<path class="s0" d="m405.9 594.5c-1.8 3-2.6 4.5-4.2 5.6-3.8 2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
				<path class="s0" d="m446.5 605.3c-3.4-1.9-4.9-2.5-6.8-2.5-4.5 0-6.3 4.5-6.3 4.5l8.9 4.9-1.1 1.9-7.6-4-14.7 27.6"/>
				<path class="s0" d="m418.9 637.1l8.9 4.8c0 0-1.7 4.4-6.2 4.5-4.5 0.1-4.3-1.1-7.5-2.8"/>
				<path class="s0" d="m381.9 618.3l-9-4.6c0 0-2.7 3.9-0.2 7.7 2.5 3.8 3.3 3 6.7 4.7"/>
				<path class="s0" d="m398.4 569.5l4.5 2.6 4.8-8.6 42.3 22.5-4.6 8.5 4.4 2.6"/>
				<path class="s0" d="m401.6 570.8l5.3-9.7 46 23.9-5.8 10.7"/>
				<path class="s0" d="m399.9 567.3l2.4 1.4"/>
				<path class="s0" d="m401.2 565.1l2.4 1.4"/>
				<path class="s0" d="m402.4 562.6l2.5 1.4"/>
				<path class="s0" d="m403.6 560.4l2.5 1.4"/>
				<path class="s0" d="m448.7 593.3l2.4 1.4"/>
				<path class="s0" d="m450 591.1l2.4 1.4"/>
				<path class="s0" d="m451.2 588.6l2.5 1.4"/>
				<path class="s0" d="m452.4 586.4l2.5 1.4"/>
			</g>
			<path class="s2" d="m540.6 605.3l-8.1-4.2-1.3-0.7 0.7-1.3 9.4 4.9z"/>
			<path class="s2" d="m531.3 621.1l-8-4.2-1.4-0.7 0.7-1.3 9.4 4.9z"/>
			<path class="s0" d="m199.9 423.7l5-8.8c0 0-3.8-2.8-7.7-0.5-3.9 2.3-3.1 2.2-4.7 5.5"/>
			<path class="s0" d="m180.7 413.7l6.7-11.9c0 0-5.4-4-10.7-1-5.3 3-4.3 2.9-6.4 7.4"/>
			<path class="s0" d="m228.2 377l-37.2-19.8"/>
			<path class="s0" d="m223.6 384.8l-37.3-19.9"/>
			<path class="s0" d="m225.7 380.8l-37.3-19.8"/>
			<path class="s0" d="m196.5 360.4l-4.2 7.7"/>
			<path class="s0" d="m203.9 364.3l-4.2 7.7"/>
			<path class="s0" d="m206.7 365.7l-4.2 7.7"/>
			<path class="s0" d="m222 373.9l-13.4 23.9"/>
			<path class="s0" d="m224.7 375.3l-12.9 24.1"/>
			<path class="s0" d="m210.7 367.6l-2.3 4.1"/>
			<path class="s0" d="m217.7 371.7l-2.2 4"/>
			<path class="s0" d="m214.1 369.9l-2.3 4.1"/>
			<path class="s0" d="m215 401.5l-19.7-10.8-11.3 20.5"/>
			<path fill-rule="evenodd" class="s4" d="m197.6 392.5c-0.2 0.3-0.4 0.6-0.5 0.9-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.3-3.3 1.3-2.4 0.3-0.6 0.5-1l-3.9-2.1z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m213.7 401.1l-3.2 5.8-7.9-4.2 3.2-5.9z"/>
				<path class="s2" d="m210.3 400.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m208.7 399.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m211.1 402.4c-0.5 0.9-2.1 1.1-3.5 0.3-1.4-0.7-2.1-2.1-1.6-3.1 0.5-1 2.1-1.1 3.5-0.4 1.4 0.8 2.1 2.2 1.6 3.2z"/>
			</g>
			<path class="s0" d="m191.8 396l-8.2-4.3"/>
			<path class="s0" d="m184 391.9c1.2-2.2 1.3-3.8 1.3-5.5-0.2-4.7-4.4-6.6-4.4-6.6l-5.2 9.2-1.8-1"/>
			<path class="s0" d="m215 386.7l2.8 1.6"/>
			<path class="s0" d="m218.7 387l2.8 1.6"/>
			<path class="s0" d="m213.6 396.7l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m262.2 228.3l2.6 1.4-20.4 37.4-2.6-1.4z"/>
			<path class="s0" d="m353.6 268.7l5.2-7c0 0-5.1-6.6-12 1.4"/>
			<path class="s0" d="m339.3 259.2l6.4-8.2c0 0 7.5 3.8 0.9 12"/>
			<path class="s0" d="m278.9 212.8c2.6-2.8 6.9-3.2 10.2-1.3 3.3 1.9 5.2 7.3 3.2 11"/>
			<path class="s0" d="m292.3 222.3c2.6-2.8 6.8-3.4 10.1-1.5 3.3 1.9 4.8 7 3.2 11"/>
			<path class="s0" d="m264.7 309.3c-5.9-4.9-6.5-10.1-4.2-14.9 2.3-4.8 9.2-7.6 15-5.8"/>
			<path class="s0" d="m264.8 222.3c10.6 6.8 14.2-2.4 14.2-2.4l-9.2-6.2 1.9-3"/>
			<path class="s0" d="m200.9 213.5l-6.7 10.5c0 0-9.1-3.8-2.7-14.5"/>
			<path class="s0" d="m199 266.8l-4.4 8.7c0 0 6.9 3.7 11.3-5.2"/>
			<path class="s0" d="m187.2 279.1l-4.1 8.2c0 0 6.2 4.8 10.6-4.1"/>
			<path class="s0" d="m186.4 262.7l-11.9-6c0 0-6.1 8.8 6 14.7"/>
			<path class="s0" d="m219.3 199.4l14.6 7.9"/>
			<path class="s0" d="m205.2 225.7l12.2 6.6"/>
			<path fill-rule="evenodd" class="s0" d="m247.9 332.9l2.7 1.5-7.3 13.2-2.6-1.4z"/>
			<path class="s0" d="m253.2 331.1l-10.1-5.5c0 0 4.3-11.2 15.6-4.9"/>
			<path class="s0" d="m150.2 328.7c-3.2-1.7-4.9-2.9-5.9-4.6-2.2-4 0.8-7.6 0.8-7.6l8.7 4.7 0.7-1.4"/>
			<path class="s0" d="m150.2 328.7c-3.1-1.9-5.3-2.5-7.2-2.4-4.5 0.2-6.1 4.7-6.1 4.7l9.3 5.3"/>
			<path class="s0" d="m707.7 455.3l30.2 21 20.9-28.8"/>
			<path class="s0" d="m693.3 470.3l50.1 34.8 33.9-47"/>
			<path class="s0" d="m697.8 473.4l12.4-16.4"/>
			<path class="s0" d="m699.7 474.8l12.4-16.4"/>
			<path class="s0" d="m701.6 476.2l12.4-16.4"/>
			<path class="s0" d="m703.5 477.7l12.4-16.4"/>
			<path class="s0" d="m705.7 478.6l12.3-16.4"/>
			<path class="s0" d="m707.6 480l12.4-16.4"/>
			<path class="s0" d="m709.5 481.4l12.4-16.4"/>
			<path class="s0" d="m711.4 482.9l12.4-16.4"/>
			<path class="s0" d="m713.6 484.2l12.3-16.4"/>
			<path class="s0" d="m715.5 485.6l12.4-16.4"/>
			<path class="s0" d="m717.4 487l12.4-16.4"/>
			<path class="s0" d="m719.3 488.5l12.4-16.4"/>
			<path class="s0" d="m721.4 489.4l12.4-16.4"/>
			<path class="s0" d="m723.4 490.8l12.4-16.4"/>
			<path class="s0" d="m725.3 492.2l12.4-16.4"/>
			<path class="s0" d="m741.5 471.7l17.6 11.5"/>
			<path class="s0" d="m742.8 469.7l17.6 11.5"/>
			<path class="s0" d="m744 467.8l17.7 11.6"/>
			<path class="s0" d="m745.8 466.1l17.2 11.3"/>
			<path class="s0" d="m747.1 464.2l17.3 11.2"/>
			<path class="s0" d="m748.5 462.1l17.6 11.6"/>
			<path class="s0" d="m750 460.2l17.2 11.2"/>
			<path class="s0" d="m751.3 458.2l17.3 11.3"/>
			<path class="s0" d="m752.9 456.3l17.2 11.3"/>
			<path class="s0" d="m754.2 454.5l17.3 11.3"/>
			<path class="s0" d="m755.2 452.3l17.7 11.6"/>
			<path class="s0" d="m757 450.6l17.2 11.3"/>
			<path class="s0" d="m758.4 448.7l17.2 11.2"/>
			<path class="s0" d="m784.3 495.9l-7.9-5.9c0 0 5.5-5.9 12.6-0.6"/>
			<path class="s0" d="m783.1 507.4l6-8c0 0 6.7 4.6 1.4 11.7l-1.3 1.7"/>
			<path class="s0" d="m797.5 515.5l4.7-6.2c0 0-6.3-5.2-11.6 1.8l-1.3 1.7"/>
			<path class="s4" d="m930 531.6h329.6"/>
			<path class="s0" d="m1172.8 402.6h-9.5c0 0-1.6 8.2 8.9 8.1"/>
			<path class="s0" d="m1125.4 451.2v-12.4h50.9v7.6"/>
			<g>
				<path class="s0" d="m1173.3 442.7v-3.8"/>
				<path class="s0" d="m1170.6 442.7v-3.8"/>
				<path class="s0" d="m1167.9 442.7v-3.8"/>
				<path class="s0" d="m1165.2 442.7v-3.8"/>
				<path class="s0" d="m1162.5 442.7v-3.8"/>
				<path class="s0" d="m1159.8 442.7v-3.8"/>
				<path class="s0" d="m1157.1 442.7v-3.8"/>
				<path class="s0" d="m1154.3 442.7v-3.8"/>
				<path class="s0" d="m1151.6 442.7v-3.8"/>
				<path class="s0" d="m1148.9 442.7v-3.8"/>
				<path class="s0" d="m1146.2 442.7v-3.8"/>
				<path class="s0" d="m1143.5 442.7v-3.8"/>
				<path class="s0" d="m1140.8 442.7v-3.8"/>
				<path class="s0" d="m1138.1 442.7v-3.8"/>
				<path class="s0" d="m1135.3 442.7v-3.8"/>
				<path class="s0" d="m1132.6 442.7v-3.8"/>
				<path class="s0" d="m1129.9 442.7v-3.8"/>
				<path class="s0" d="m1127.2 442.7v-3.8"/>
			</g>
			<path class="s0" d="m956.6 451.6v-12.5h108.4v11.1"/>
			<g>
				<path class="s0" d="m1062.1 443.1v-3.8"/>
				<path class="s0" d="m1059.4 443.1v-3.8"/>
				<path class="s0" d="m1056.7 443.1v-3.8"/>
				<path class="s0" d="m1053.9 443.1v-3.8"/>
				<path class="s0" d="m1051.2 443.1v-3.8"/>
				<path class="s0" d="m1048.5 443.1v-3.8"/>
				<path class="s0" d="m1045.8 443.1v-3.8"/>
				<path class="s0" d="m1043.1 443.1v-3.8"/>
				<path class="s0" d="m1040.4 443.1v-3.8"/>
				<path class="s0" d="m1037.7 443.1v-3.8"/>
				<path class="s0" d="m1034.9 443.1v-3.8"/>
				<path class="s0" d="m1032.2 443.1v-3.8"/>
				<path class="s0" d="m1029.5 443.1v-3.8"/>
				<path class="s0" d="m1026.8 443.1v-3.8"/>
				<path class="s0" d="m1024.1 443.1v-3.8"/>
				<path class="s0" d="m1021.4 443.1v-3.8"/>
				<path class="s0" d="m1018.7 443.1v-3.8"/>
				<path class="s0" d="m1016 443.1v-3.8"/>
			</g>
			<path class="s0" d="m1013.1 443.2v-3.7"/>
			<path class="s0" d="m1010.1 443.2v-3.7"/>
			<path class="s0" d="m1007.3 443.2v-3.7"/>
			<path class="s0" d="m1004.6 443.2v-3.7"/>
			<path class="s0" d="m1001.8 443.2v-3.7"/>
			<path class="s0" d="m999.1 443.2v-3.7"/>
			<path class="s0" d="m996.4 443.2v-3.7"/>
			<path class="s0" d="m993.7 443.2v-3.7"/>
			<path class="s0" d="m991 443.2v-3.7"/>
			<path class="s0" d="m988.3 443.2v-3.7"/>
			<path class="s0" d="m985.5 443.2v-3.7"/>
			<path class="s0" d="m982.8 443.2v-3.7"/>
			<path class="s0" d="m980.1 443.2v-3.7"/>
			<path class="s0" d="m977.4 443.2v-3.7"/>
			<path class="s0" d="m974.7 443.2v-3.7"/>
			<path class="s0" d="m972 443.2v-3.7"/>
			<path class="s0" d="m969.2 443.2v-3.7"/>
			<path class="s0" d="m966.5 443.2v-3.7"/>
			<path class="s0" d="m963.8 443.1v-3.8"/>
			<path class="s0" d="m961.1 443.1v-3.8"/>
			<path class="s0" d="m854 446.7v-4h40.9v7.6"/>
			<path class="s0" d="m892 446.7v-3.8"/>
			<path class="s0" d="m889.2 446.7v-3.8"/>
			<path class="s0" d="m886.5 446.7v-3.8"/>
			<path class="s0" d="m883.8 446.7v-3.8"/>
			<path class="s0" d="m881.1 446.7v-3.8"/>
			<path class="s0" d="m878.4 446.7v-3.8"/>
			<path class="s0" d="m875.7 446.7v-3.8"/>
			<path class="s0" d="m873 446.7v-3.8"/>
			<path class="s0" d="m870.2 446.7v-3.8"/>
			<path class="s0" d="m867.5 446.7v-3.8"/>
			<path class="s0" d="m864.8 446.7v-3.8"/>
			<path class="s0" d="m862.1 446.7v-3.8"/>
			<path class="s0" d="m859.4 446.7v-3.8"/>
			<path class="s0" d="m856.7 446.7v-3.8"/>
			<path class="s0" d="m908.4 451.9v-8.4c0 0-8.2-1.6-8.1 8.9"/>
			<path class="s0" d="m908 451.9h2.7"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s4" d="m663.3 212.5l-159.7-27.5"/>
			<path class="s0" d="m827.3 407.3c8.9 0 8.5 7.3 8.5 7.3h-8.6v1.4"/>
			<path class="s0" d="m820.2 405.3h7.6v1.9"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m897.4 410.4h4.8v4.8h-4.8z"/>
				<path class="s2" d="m899.5 413.7h0.7v1.8h-0.7z"/>
				<path class="s2" d="m898.8 415.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m901 415.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path class="s0" d="m902.5 412.7h8.9v3.2"/>
			<path class="s0" d="m776.4 562.5l49.5 34.2"/>
			<path class="s0" d="m875.4 711l31.3-59"/>
			<path class="s0" d="m627.2 649.5l219.6 115.5 24.8-47.2"/>
			<path class="s0" d="m886 662.2l11.2 7.9"/>
			<path class="s0" d="m813.3 610.4l66.8 47.6"/>
			<path fill-rule="evenodd" class="s0" d="m834.1 603.9l66.4 46.5-1.7 2.3-66.3-46.5z"/>
			<path class="s0" d="m903.8 650.5l-3.9 6.3-71.3-50.5 3.8-5.1 74.1 51.2"/>
			<path class="s0" d="m825.3 618.8l7.5-9.3"/>
			<path class="s0" d="m827.6 620.5l7.5-9.3"/>
			<path class="s0" d="m829.8 622.3l7.4-9.4"/>
			<path class="s0" d="m832.1 623.5l7.5-9.3"/>
			<path class="s0" d="m834.2 625.2l7.5-9.3"/>
			<path class="s0" d="m836.6 626.9l7.4-9.3"/>
			<path class="s0" d="m838.8 628.6l7.5-9.3"/>
			<path class="s0" d="m847.5 634.3l7.5-9.3"/>
			<path class="s0" d="m848.7 635.5l7.5-9.3"/>
			<path class="s0" d="m849.8 636.6l7.5-9.3"/>
			<path class="s0" d="m878.2 656.2l7.5-9.3"/>
			<path class="s0" d="m854.5 630.9l28 20"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m876 701.4l-29.3-16 1.3-2.6 1.4-2.5 29.4 16z"/>
				<path class="s0" d="m877.4 698.8l-29.6-16.1"/>
				<path class="s0" d="m857.5 684.7l-2.7 5.1"/>
				<path class="s0" d="m864.1 688.3l-2.7 5.1"/>
				<path class="s0" d="m871 692l-2.8 5.1"/>
			</g>
			<path class="s0" d="m695.3 604.3l-33.7-18"/>
			<path class="s0" d="m734 625.1l-16-8.6"/>
			<path class="s0" d="m744.2 630.7l-3.5-1.9"/>
			<path class="s0" d="m787.2 662.8l-40-21.5"/>
			<path class="s0" d="m879.7 703.4l-79.6-42.8-4.2 7.1-1.8-1"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m893.3 667.8l-15.7 27.7-2.5-1.4-2.6-1.4 16-28.2z"/>
				<path class="s0" d="m891 665.9l-16.1 28.5"/>
				<path class="s0" d="m876.9 684.9l5.1 2.9"/>
				<path class="s0" d="m875.4 688.3l2.5 1.4"/>
				<path class="s0" d="m880.5 678.6l5.1 2.8"/>
				<path class="s0" d="m884.2 672l5.1 2.9"/>
				<path class="s0" d="m885.5 675.8l2.5 1.5"/>
				<path class="s0" d="m888.4 671.2l2.6 1.5"/>
			</g>
			<path class="s0" d="m812.4 655.5l18.2-32.9"/>
			<path class="s0" d="m715.1 598.5l-3-1.6"/>
			<path class="s0" d="m736.1 609.6l-14.1-7.4"/>
			<path class="s0" d="m775.6 630.4l-26.8-14.1"/>
			<path class="s0" d="m806.6 646.9l-24.1-12.9"/>
			<path class="s0" d="m822.2 594.2l-25.1 47.6"/>
			<path class="s3" d="m792.1 573.4l-26.6 51.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m835.4 626.1l-15.1 27.3-2.5-1.4-2.5-1.4 15.3-27.7z"/>
				<path class="s0" d="m833.1 624.3l-15.4 27.9"/>
				<path class="s0" d="m819.5 642.9l5.1 2.9"/>
				<path class="s0" d="m818 646.2l2.6 1.4"/>
				<path class="s0" d="m822.9 636.7l5.1 2.8"/>
				<path class="s0" d="m826.5 630.3l5.1 2.8"/>
				<path class="s0" d="m827.8 634l2.5 1.4"/>
				<path class="s0" d="m830.6 629.5l2.6 1.4"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m795.4 606.6l16.3 8.7-3.4 6.4-16.4-8.6z"/>
				<path class="s2" d="m794.1 609.3l16.5 8.7-0.7 1.5-16.6-8.8z"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m789.1 633.2l10.2 5.5-1.5 2.8-10.2-5.5z"/>
				<path class="s0" d="m790.7 634.9l-1.4 2.5"/>
			</g>
			<path class="s0" d="m798.3 577.5l-26.4 51.1"/>
			<path class="s0" d="m790.8 577.9l5.5 3.1"/>
			<path class="s0" d="m788.2 582.2l5.9 3.5"/>
			<path class="s0" d="m784.6 589.9l5.4 3.2"/>
			<path class="s0" d="m780.8 597.2l5.4 3.1"/>
			<path class="s0" d="m777 604.7l5.4 3.1"/>
			<path class="s0" d="m772.9 612.2l5.4 3.1"/>
			<path class="s0" d="m770.6 616.9l5.4 3.2"/>
			<path class="s0" d="m806.5 583.5l-1.5 4.6-1.3 3.6 14.7 9"/>
			<path class="s0" d="m820.3 597.2l-15.2-9.9"/>
			<path class="s0" d="m754.5 606.4l-5.3 10.2"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s0" d="m766.4 583l-8.3 16.3"/>
			<path class="s0" d="m776.9 562.3l-7.1 14"/>
			<path class="s2" d="m791.7 575.1l-15.8-11.1 0.8-1.2 16.2 10.6z"/>
			<path class="s2" d="m750.8 615l15.5 8.1-0.6 1.2-15.5-8.2z"/>
			<path class="s0" d="m751.7 612.6l15.4 8.3"/>
			<path class="s0" d="m765.6 614l3.7 2"/>
			<path class="s0" d="m753.9 607.7l3.9 2.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m755.3 615l3.2-5.9 7.9 4.3-3.2 5.9z"/>
				<path class="s2" d="m758.5 616c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m760.1 616.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m763 616.5c-0.6 1-2.1 1.2-3.5 0.4-1.5-0.8-2.2-2.2-1.6-3.1 0.5-1 2.1-1.2 3.5-0.4 1.4 0.8 2.1 2.2 1.6 3.1z"/>
			</g>
			<path class="s0" d="m763.4 589.8l15.4 8.3"/>
			<path class="s0" d="m777.2 591.2l3.8 2"/>
			<path class="s0" d="m765.6 584.9l3.9 2.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m767.1 592.1l3.2-5.9 7.9 4.3-3.2 5.9z"/>
				<path class="s2" d="m770.2 593.1c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m771.8 594c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m774.6 593.7c-0.5 0.9-2.1 1.1-3.5 0.3-1.4-0.7-2.1-2.1-1.6-3.1 0.6-1 2.1-1.1 3.5-0.4 1.5 0.8 2.2 2.2 1.6 3.2z"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m773.5 595.4q-0.3 0.4-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<path fill-rule="evenodd" class="s4" d="m785.3 570.9q-0.3 0.4-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<path class="s4" d="m699.5 517.1l37.2 18.5"/>
			<path class="s2" d="m734.5 533.6l30.7 21.1-1.2 1.8-30.7-21.1z"/>
			<path fill-rule="evenodd" class="s0" d="m727.9 531.9l14.6 10-3.8 5.6-14.6-10z"/>
			<path class="s0" d="m726.1 534.9l14.3 9.9"/>
			<path class="s0" d="m735 537.4l-3.8 5.4"/>
			<path class="s0" d="m742.2 540.9l-29.5 56"/>
			<path class="s0" d="m736.8 583.7l9.5 5.2"/>
			<path fill-rule="evenodd" class="s4" d="m757.8 552.8q-0.3 0.5-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m749.6 546.2l-3.5 5.7-7.6-4.6 3.5-5.8z"/>
				<path class="s2" d="m746.7 546.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m745.1 545.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m747.7 548.6c-0.6 0.9-2.2 1-3.6 0.2-1.3-0.9-2-2.3-1.4-3.2 0.6-1 2.2-1.1 3.5-0.2 1.4 0.8 2 2.2 1.5 3.2z"/>
			</g>
			<path class="s0" d="m740.8 566.3l13.7 7.4"/>
			<path class="s0" d="m745.7 569.3l-4 7.2 9 4.9"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m731.9 573.6l-7.9 15.1-2.7-1.5-2.7-1.4 7.9-15z"/>
				<path class="s0" d="m729.7 572.5l-7.9 15"/>
				<path class="s0" d="m725.4 573.2l3.3 1.7"/>
				<path class="s0" d="m724.1 575.7l3.3 1.7"/>
				<path class="s0" d="m719.9 583.7l3.3 1.8"/>
				<path class="s0" d="m724.6 581.1l3.2 1.7"/>
			</g>
			<path class="s0" d="m667.3 576.5l-53.9 98.1"/>
			<path class="s0" d="m671.6 568.7l31-57.2 62.9 43.5"/>
			<path class="s0" d="m645.8 615.5l37.8 20"/>
			<path class="s0" d="m690.3 613.4l-11.1 20.1"/>
			<path class="s0" d="m708.8 611.6l-34.2 62.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m698 648.8l-16.2 29.2-3.6-2-3.5-2 16.1-29.2z"/>
				<path class="s0" d="m694.4 646.8l-16.3 29.5"/>
				<path class="s0" d="m679.1 666l7.2 3.9"/>
				<path class="s0" d="m677.7 669.5l3.5 2"/>
				<path class="s0" d="m682.7 659.4l7.2 4"/>
				<path class="s0" d="m686.5 652.6l7.2 4"/>
				<path class="s0" d="m688.8 657.1l3.6 2"/>
				<path class="s0" d="m691.9 652.4l3.6 2"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m736.8 641.6l-28 50.5-3.6-2-3.6-2 27.9-50.4z"/>
				<path class="s0" d="m733.1 639.7l-28.1 50.9"/>
				<path class="s0" d="m709.3 674.2l7.2 4"/>
				<path class="s0" d="m706.5 680.2l3.6 2"/>
				<path class="s0" d="m715.6 662.9l7.2 4"/>
				<path class="s0" d="m722.1 651.1l7.2 4"/>
				<path class="s0" d="m723.4 657.4l3.6 2"/>
				<path class="s0" d="m728.5 649.1l3.6 2"/>
			</g>
			<path class="s0" d="m731.6 618.1l-8.7 15.6 14.5 7.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m782.4 660.1l-29.4-15.9 2-3.6 1.9-3.6 29.3 15.9z"/>
				<path class="s0" d="m784.3 656.5l-29.6-16.1"/>
				<path class="s0" d="m765 641.4l-3.9 7.2"/>
				<path class="s0" d="m761.5 640l-2 3.6"/>
				<path class="s0" d="m771.6 644.9l-3.9 7.2"/>
				<path class="s0" d="m778.2 648.2l-8.6 15.6"/>
				<path class="s0" d="m773.9 651l-1.9 3.6"/>
				<path class="s0" d="m778.7 654l-1.9 3.6"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m767.5 685.5l-16.2 29.2-3.6-2-3.6-2 16.1-29.2z"/>
				<path class="s0" d="m763.8 683.5l-16.2 29.4"/>
				<path class="s0" d="m748.6 702.7l7.1 3.9"/>
				<path class="s0" d="m747.1 706.2l3.6 2"/>
				<path class="s0" d="m752.2 696.1l7.2 4"/>
				<path class="s0" d="m756 689.3l7.1 4"/>
				<path class="s0" d="m758.3 693.8l3.5 2"/>
				<path class="s0" d="m761.3 689.1l3.6 1.9"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m777.3 667l-5.5 10.2-3.6-1.9-3.7-1.9 5.5-10.2z"/>
			<path class="s0" d="m768.6 666.5l7.2 4"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m764.7 673.4l6 3.1-4.2 7.9-5.9-3.1z"/>
				<path class="s2" d="m763.5 677.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m762.6 679c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m766 679c-0.8 1.4-2.2 2.2-3.1 1.7-1-0.6-1.2-2.1-0.5-3.5 0.8-1.5 2.2-2.2 3.2-1.7 0.9 0.5 1.1 2.1 0.4 3.5z"/>
			</g>
			<path class="s0" d="m773.7 726.3l2.2-4.3 65.1 34-2.2 4.6"/>
			<path class="s0" d="m667.9 576.6l-9.4-5c0 0 2.6-8.8 13.5-2.5"/>
			<path class="s0" d="m755.1 606.3l-9.2-5.4c0 0 3.7-7.1 11.4-2.7l1.4 0.8"/>
			<path class="s0" d="m766.7 583.3l-9.2-5.4c0 0 3.7-7.1 11.4-2.7l1.4 0.8"/>
			<path class="s0" d="m760.3 564l1.8 1 5.1-9.4c0 0 7.2 3.5 3 11.3l-0.8 1.4 3.4 1.9"/>
			<path class="s0" d="m741.1 566.9l0.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6 8.9-2.5-1.4"/>
			<path class="s0" d="m722.2 602.8l0.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6 8.9"/>
			<path class="s0" d="m733.6 625.5l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-10.5 19.6"/>
			<path class="s0" d="m775.4 630.9l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.7 8.5"/>
			<path class="s0" d="m806 647l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.7 8.5 1.5 0.8"/>
			<path class="s0" d="m787.2 663.4l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.9 8.7"/>
			<path class="s0" d="m812 655.2l1.4 0.8c7.7 4.3 3.5 11.2 3.5 11.2l-8.7-4.9-1 1.8"/>
			<path class="s0" d="m886.6 661.9l-0.9 1.3c-5 7.3-11.4 2.4-11.4 2.4l5.7-8.2"/>
			<path class="s0" d="m871.2 717.6l1.4 0.8c7.8 4.2 11.3-3 11.3-3l-8.8-4.8"/>
			<path class="s0" d="m835.5 759l-1.2 2.3-208.5-109.4"/>
			<path class="s3" d="m604 631.9l10.2 5.5"/>
			<path class="s0" d="m590.9 622.9l-4.7 8.7c0 0 3.9 2.9 7.8 0.6 3.9-2.3 2.4-2.1 3.5-4.2"/>
			<path class="s0" d="m604.6 631.1l-4.6 8.8c0 0-4.5-1.5-4.8-6-0.3-4.5 0.8-3.2 2.2-5.7"/>
			<path class="s0" d="m589.2 624.1l-11.7 21.9c0 0-37.5-19.5-92.8-48.7"/>
			<path class="s0" d="m614.3 636.3l-4.7 8.7c0 0 4.2 3 8.3 0.6 4.1-2.4 2.5-2.1 3.7-4.2"/>
			<path class="s0" d="m629.1 644.4l-4.8 8.9c0 0-4.8-1.5-5.1-6.1-0.1-1.7 0.9-3.2 2.3-5.7"/>
			<path class="s3" d="m591.8 655.8l10.2 5.6"/>
			<path class="s0" d="m577.4 646.1l-4.7 8.7c0 0 4.7 3.4 8.9 1.2 4.2-2.2 2.5-2 3.7-4.1"/>
			<path class="s0" d="m592.4 655l-4.6 8.8c0 0-4.5-1.5-4.8-6-0.3-4.5 0.8-3.2 2.2-5.7"/>
			<path class="s0" d="m602 660.3l-4.7 8.7c0 0 4.2 3 8.3 0.6 4.1-2.4 2.5-2.1 3.7-4.2"/>
			<path class="s0" d="m616.8 668.4l-4.8 8.9c0 0-4.8-1.5-5.1-6.1-0.1-1.7 0.9-3.2 2.3-5.7"/>
			<path class="s0" d="m471 592.2l0.9-1.7 5.5 2.8"/>
			<path class="s0" d="m362 494.1c3.5 1.8 5.2 2.8 6.2 4.4 2.5 3.8-0.2 7.7-0.2 7.7l-8.9-4.8-0.9 1.5"/>
			<path class="s0" d="m231.2 370.4l8.9 4.8c0 0 2.8-3.8 0.4-7.7-2.4-3.9-2-2.6-5.3-4.5"/>
			<path class="s0" d="m127.5 368.7l8.9 4.8c0 0 3-2.5 1.3-7-1.7-4.5-2-3.5-6.1-5.4"/>
			<path class="s0" d="m166.8 406l-2.9 4.9c-3-2-5.2-2.8-7.1-2.7-4.5 0-6.3 4.4-6.3 4.4l8.8 5-3 5.5"/>
			<path class="s0" d="m147.4 395.6l-2.9 4.9c-3-2-5.2-2.8-7.1-2.7-4.5 0-6.3 4.4-6.3 4.4l8.8 5-3 5.5"/>
			<path class="s0" d="m217.2 295.2l6 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m215.1 307.8l3.4-6.3 2.3 1.3-3.4 6.2z"/>
			<path class="s0" d="m225.3 281l6.1 3.4"/>
			<path class="s0" d="m251.5 196.4l-8.3 15.1 2.9 1.6 2.5 1.3"/>
			<path class="s0" d="m254.2 198.3l-7.8 14.4"/>
			<path class="s0" d="m250 199.4l2.7 1.6"/>
			<path class="s0" d="m248.4 202.1l2.8 1.5"/>
			<path class="s0" d="m246.9 205l2.7 1.5"/>
			<path class="s0" d="m244.8 208.4l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m584.8 431.7l14.9 10.6-2.9 4.1-14.9-10.6z"/>
			<path class="s0" d="m506.7 450l-8.5-5c0 0 1.7-4.4 6.3-4.5 4.6-0.1 3.4 0.4 6.4 2.4"/>
			<path fill-rule="evenodd" class="s0" d="m529 425.4l8.4 4.6-4.5 8.3-8.4-4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m505.4 412.7l8.4 4.6-4.5 8.3-8.4-4.5z"/>
			<path class="s0" d="m226.2 203.1l11.5-16.4"/>
			<path class="s0" d="m221.3 200.2l9.9-18.1"/>
			<path class="s0" d="m223.8 202l6.2-10.6 2.3-4"/>
			<path class="s0" d="m229.4 185.3l6.2 4.3"/>
			<path class="s0" d="m232.9 193.4l-2.9-2"/>
			<path class="s0" d="m223.8 196.3l2.4 1.6"/>
			<path class="s0" d="m226.4 282.1c0 0-2.7 4.3 1.4 8.4"/>
			<path class="s0" d="m144 339.2c-0.4-0.2-47.9-26.6-47.9-26.6l-8.8 15.2"/>
			<path class="s0" d="m82.3 337.2l-8.9 15.7"/>
			<path class="s0" d="m83.1 337.1l-10.9-5.8c0 0 0.4-4.7 6.2-6.1 2.3-0.5 4.9-0.4 9.7 2.4"/>
			<path class="s4" d="m577.6 590.1v6.7l22.9 3.1 8.9-16.3c0 0 16.4-94.4 17.7-100.8 1.3-6.4-1.3-4.1-2.8-3.6-1.5 0.5-1.5 0.9-1.9 1.7-3 5.9-18.3 35.4-18.7 36.1-0.4 0.7-1.7 11-1.7 11l10.6 1.2-5.7 35.1-15.8 28.2-34.7-5.3"/>
			<path class="s4" d="m559.5 581.5l29.1 5.4 13.4-25.4 5.6-32.8"/>
			<path class="s4" d="m602 528.1l-5.5 32-11 20.6-23.1-4.2"/>
			<path class="s4" d="m563.6 573.9l9.1 1.6 0.3 3"/>
			<path class="s4" d="m561.1 579.1l9.3 1.6 0.4 3"/>
			<path fill-rule="evenodd" class="s4" d="m591.9 596.6l16.2-30.8h2.5l-3 17.2-8.5 14.8z"/>
			<path fill-rule="evenodd" class="s4" d="m604.8 526.4l12.2 1.3 7.4-42.4-1.4-0.5-16.7 31.6c-0.3 0.6-0.6 1.3-0.6 2l-0.9 7.9z"/>
			<path class="s0" d="m158.4 433.3l3.6-6.7"/>
			<path class="s0" d="m151.8 429.6l3.6-6.6"/>
			<path class="s0" d="m146.4 426.7l3.6-6.6"/>
			<path class="s0" d="m161.6 431.2l-33.9-18.3"/>
			<path fill-rule="evenodd" class="s0" d="m164 436.5l-4-2.2 2.5-4.5 3.9 2.2z"/>
			<path class="s0" d="m135.1 420.5l3.6-6.6"/>
			<g>
				<path class="s0" d="m202.9 450.3c18.6 9.9 36.1 19.3 52.4 27.9l1.2-2.2-42.2-22.3"/>
				<path class="s0" d="m214.3 453.7c-3.4-1.8-6.6-3.5-10.2-5.3"/>
				<path class="s0" d="m204.6 448.1l-11.9 22.1"/>
				<path class="s0" d="m213.5 493.2l-10.3 19.4"/>
				<path class="s0" d="m255.4 478.1l-10.6 19.7"/>
				<g>
					<path fill-rule="evenodd" class="s0" d="m173.9 525.9l7 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m180.9 529.7l7.1 3.8-2.6 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m188 533.5l7.1 3.7-2.6 4.9-7-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m195.2 537.2l7 3.7-2.5 4.9-7.1-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m202.1 540.9l7.1 3.8-2.6 4.8-7-3.7z"/>
				</g>
				<g>
					<path fill-rule="evenodd" class="s0" d="m184.7 504.7l7.3 3.8-2.5 4.9-7.4-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m192.1 508.5l7.3 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m199.3 512.4l7.3 3.9-2.5 4.8-7.4-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m206.7 516.3l7.4 3.9-2.6 4.8-7.3-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m214 520.2l7.4 3.8-2.6 4.9-7.3-3.9z"/>
				</g>
				<path class="s0" d="m171.1 530.5l6.4-11.9"/>
				<path class="s0" d="m206.4 549.3l6.6-12.2"/>
				<path class="s0" d="m180.4 512l15-27.7-8.6-4.8 1.2-2.2 9 4.7c0 0 2.7-3.9 0.3-7.7-2.4-3.8-1.8-2.4-5.1-4.1"/>
				<path class="s0" d="m185.2 502.6l36.9 19.4"/>
				<path fill-rule="evenodd" class="s4" d="m206.1 505.7c-0.3-0.2-0.6-0.4-0.9-0.5-2.4-1.3-4.8-1.5-5.4-0.4-0.6 1.1 0.9 3 3.3 4.3 2.4 1.3 0.6 0.3 1 0.5l2.1-3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m190.6 493.2l5.9 3.2-4.2 7.9-5.9-3.2z"/>
					<path class="s2" d="m189.8 497.2c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m188.9 498.8c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m192.3 499.3c-0.7 1.4-2.1 2.1-3.1 1.6-1-0.5-1.1-2.1-0.4-3.5 0.8-1.4 2.2-2.1 3.2-1.6 0.9 0.5 1.1 2.1 0.3 3.5z"/>
				</g>
				<path class="s0" d="m204.3 488.2l18.3 10.1"/>
				<path fill-rule="evenodd" class="s4" d="m205 510.2c0.3 0.2 0.6 0.4 0.9 0.5 2.4 1.3 4.8 1.5 5.4 0.4 0.6-1.1-0.9-3-3.3-4.3-2.4-1.3-0.6-0.3-1-0.5l-2.1 3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m222.8 520.5l-5.9-3.2 4.3-7.9 5.9 3.2z"/>
					<path class="s2" d="m223.7 517.8c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m224.6 516.2c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m224.6 516.6c-0.7 1.4-2.1 2.1-3.1 1.6-1-0.6-1.1-2.1-0.4-3.5 0.8-1.5 2.2-2.2 3.2-1.6 0.9 0.5 1.1 2.1 0.3 3.5z"/>
				</g>
				<path class="s0" d="m190.4 511.5l21.9 11.4"/>
				<path class="s0" d="m211.4 519.3l-1.2 2.6"/>
				<path class="s0" d="m193.7 510l-1.2 2.6"/>
				<path class="s0" d="m260.7 488.9c1.8-3.2 2.5-5.1 2.4-7-0.2-4.5-4.7-6.1-4.7-6.1l-4.6 9-1.3-0.7"/>
				<path class="s0" d="m200.4 456.2l-1.8-0.9 4.9-8.6c0 0-3.7-2.9-7.7-0.7-4 2.2-2.8 2.5-4.7 5.8l-5.2-3"/>
				<path class="s0" d="m223.1 498c-1.9 3.1-1.6 5.2-1.6 5.8 0.2 4.5 4.7 6.1 4.7 6.1l4-7.8 2.9 1.7"/>
				<path class="s0" d="m204.4 487.6c-1.8 3-2.6 4.5-4.2 5.6-3.8 2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
				<path class="s0" d="m245 498.4c-3.4-1.9-4.9-2.5-6.8-2.5-4.5 0-6.3 4.5-6.3 4.5l8.9 4.9-1.1 1.9-7.6-4-14.7 27.6"/>
				<path class="s0" d="m217.4 530.2l8.9 4.8c0 0-1.7 4.4-6.2 4.5-4.5 0.1-4.3-1.1-7.5-2.8"/>
				<path class="s0" d="m180.4 511.4l-9-4.6c0 0-2.7 3.9-0.2 7.7 2.5 3.8 3.3 3 6.7 4.7"/>
				<path class="s0" d="m196.8 462.6l4.6 2.6 4.7-8.5 42.4 22.5-4.6 8.5 4.4 2.6"/>
				<path class="s0" d="m200.1 463.9l5.3-9.6 45.9 23.9-5.8 10.6"/>
				<path class="s0" d="m198.3 460.4l2.5 1.4"/>
				<path class="s0" d="m199.7 458.2l2.4 1.4"/>
				<path class="s0" d="m200.9 455.8l2.4 1.4"/>
				<path class="s0" d="m202.1 453.6l2.4 1.3"/>
				<path class="s0" d="m247.1 486.4l2.5 1.4"/>
				<path class="s0" d="m248.5 484.2l2.4 1.4"/>
				<path class="s0" d="m249.7 481.8l2.4 1.4"/>
				<path class="s0" d="m250.9 479.6l2.4 1.3"/>
			</g>
			<path class="s0" d="m797.6 544.2l-5.9 7.4 8.8 6.1c0 0-4.3 6.8-11.6 1.8l-2-1.4-5.6 8"/>
			<path class="s0" d="m815 556.8l-5.9 7.4 8.8 6.1c0 0-4.3 6.8-11.6 1.8l-2-1.4-5.6 8"/>
			<path class="s0" d="m834.1 602.3l-1.7-1.1 6-8.6c0 0-6.4-4.9-11.5 2.3l-1.5 2.1"/>
			<path class="s0" d="m736.9 636.5l2.8 1.5 5.1-9.4c0 0 7.2 3.5 3 11.3l-1 1.8"/>
			<path class="s0" d="m731.7 618.6l-1.4-0.8c-7.7-4.4-3.4-11.2-3.4-11.2l8 4.4 0.7-1.1 29.4-55.2"/>
			<path class="s0" d="m693.4 640.2l-2.8-1.5-5.1 9.4c0 0-7.2-3.6-3-11.3l1-1.8"/>
			<path class="s0" d="m708.4 611.3l2.8 1.6-4.8 8.1c0 0 6.8 4.3 11.2-3.3l0.8-1.5"/>
			<path class="s0" d="m695.9 604.1l-1.6 2.8-9.3-5.2c0 0-4.2 6.9 3.5 11.1l1.8 1"/>
			<path class="s0" d="m200.3 213.5l9.3 5"/>
			<path class="s0" d="m184.9 149.4l-23.5 44.4"/>
		</g>
		<g id="areas">
			<path id="room_145" class="s5" d="m766.5 520.1l48.6 34.9 13.5-17.4h98.7v-77.6h-16.5v-8.1h-16.3v-5.3h-76.1z"/>
			<path id="room_132" class="s6" d="m1177.6 331.5v17.4h-18.6v51.5h13.8v16.9h88.3v-85.3z"/>
			<path id="middle_east_wing" class="s6" d="m874.7 331.4h261.5v85.4h-261.5z"/>
			<path id="room_114" class="s6" d="m702.6 331.4h170.4v85.4h-170.4z"/>
			<path id="room_142" class="s7" d="m944.2 452.2h16.4v-12.8h49v98.2h-79.2v-76.8h13.8z"/>
			<path id="room_133" class="s6" d="m1192.1 452.2h16.4v-12.8h49v98.2h-79.3v-76.8h13.9z"/>
			<path id="room_135" class="s6" d="m1109.5 452.2h16.3v-12.8h49v98.2h-79.2v-76.8h13.9z"/>
			<path id="room_139" class="s6" d="m1078.7 452.2h-16.3v-12.8h-49v98.2h79.2v-76.8h-13.9z"/>
			<path id="room_129" class="s6" d="m1126.7 300h16.4v12.8h49v-98.2h-79.3v76.8h13.9z"/>
			<path id="room_127" class="s6" d="m1096 300h-16.4v12.8h-49v-98.2h79.2v76.8h-13.8z"/>
			<path id="room_124" class="s6" d="m962.7 300h16.4v12.8h49v-98.2h-79.2v76.8h13.8z"/>
			<path id="room_119" class="s6" d="m932.5 300h-16.3v12.8h-49v-98.2h79.2v76.8h-13.9z"/>
			<path id="room_113" class="s7" d="m799 300h16.4v12.8h49v-98.2h-79.2v76.8h13.8z"/>
			<path id="room_108" class="s6" d="m585.8 280.5l16.1 2.7-2.1 12.7 48.3 8.1 16.2-96.9-78.1-13.1-12.7 75.8 13.7 2.3z"/>
			<path id="room_111" class="s8" d="m768.7 300h-16.3v12.8h-49v-98.2h79.2v76.8h-13.9z"/>
			<path id="room_105" class="s5" d="m555.5 275.6l-16.1-2.7-2.1 12.7-48.4-8.1 16.2-96.9 78.2 13-12.7 75.8-13.7-2.3z"/>
			<path id="middle_west_wing" class="s6" d="m489.8 300.6l-2.3 26 114.2 80.2 36.3 6 12.7-83.8-5.9-1.1-1.3 8.5-16.7-3 1.3-7.9z"/>
			<path id="room_175" class="s6" d="m408.4 656.6l81.9 43.4 41.7-75.2-61.1-32.3-3.1 5.8-14-7.5-11.5 21.4-7.5-4.2z"/>
			<path id="room_169" class="s6" d="m207.6 550.6l81.9 43.4 41.7-75.2-61.1-32.3-3 5.7-14.1-7.4-11.5 21.4-7.5-4.2z"/>
			<path id="room_172" class="s6" d="m290.1 594.3l82.6 44 24.1-46.3-7.4-4.1 13-23.6-15.2-8.6 3.1-5.5-58.8-31z"/>
			<path id="room_166" class="s6" d="m87.3 487.3l82.6 43.9 24.2-46.2-7.4-4.1 13-23.7-15.2-8.5 3.1-5.5-58.8-31.1z"/>
			<path id="front_office" class="s6" d="m702.6 511.5l-75.4 138 116.9 61.2 34.1-62.5-21.3-11.2-4.3 8-15.7-8.5 11-20.7 17.6 9.3 26.6-51.7z"/>
			<path id="back_office" class="s6" d="m766.1 625.4l26.7-51.3 113.7 78.3-59.7 112.6-101.4-53.6 40.8-75.2z"/>
			<path id="lunchroom" class="s6" d="m389.7 292.1l-93.5 180.6-223.3-118.8 23.2-41.3 47.4 25.7 64.4-119.2-49.1-26.6 25.3-46.6z"/>
			<path id="multi_purpose_room" class="s9" d="m390.3 292.5l236.1 165.8-80.4 148-249.3-133.3z"/>
			<path id="hallways" fill-rule="evenodd" class="s10" d="m1155.5 418.4h102v20.6h-438.9l-58.2 79.1 53.9 38.9-13 17.2-99.6-69.8-89.2 160.8-72.8-38.9-401.4-213.4 9.1-17.1 401 214.3 82.6-153.5-12.8-7.7-340.3-240.3 13.6-24.2 100 16.6 6.6-38.5 104 17.8-15.9 98.6 164.2 28.3 13.3-80.7 37.1 3.2v86.4h494.2v-102h45.3v114.9h-84.8zm-515.8-3.7l13.3-86.9-165.6-29.5-2.5 28.2 116.2 83.3 38.6 4.8zm497.8-85.7h-436.8v89.1h436.8z"/>
		</g>
		<g id="text">
			<text id="ROOM 133
" style="transform: matrix(1,0,0,1,1200.6,499.4)" >
				<tspan x="0" y="0" class="t11">ROOM 133
</tspan>
			</text>
			<text id="ROOM 135
" style="transform: matrix(1,0,0,1,1117.8,499.4)" >
				<tspan x="0" y="0" class="t11">ROOM 135
</tspan>
			</text>
			<text id="ROOM 139
" style="transform: matrix(1,0,0,1,1031.9,499.4)" >
				<tspan x="0" y="0" class="t11">ROOM 139
</tspan>
			</text>
			<text id="ROOM 142
" style="transform: matrix(1,0,0,1,951.3,499.4)" >
				<tspan x="0" y="0" class="t11">ROOM 142
</tspan>
			</text>
			<g>
				<text id="ROOM 145
" style="transform: matrix(1,0,0,1,841.1,493.3)" >
					<tspan x="0" y="0" class="t11">ROOM 145
</tspan>
				</text>
				<text id="LIBRARY
" style="transform: matrix(1,0,0,1,841.1,503.3)" >
					<tspan x="0" y="0" class="t11">LIBRARY
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 132
" style="transform: matrix(1,0,0,1,1193.9,372.2)" >
					<tspan x="0" y="0" class="t11">ROOM 132
</tspan>
				</text>
				<text id="MULTI-MEDIA
" style="transform: matrix(1,0,0,1,1187.8,381.2)" >
					<tspan x="0" y="0" class="t11">MULTI-MEDIA
</tspan>
				</text>
				<text id="ACTIVITY
" style="transform: matrix(1,0,0,1,1196.5,390.2)" >
					<tspan x="0" y="0" class="t11">ACTIVITY
</tspan>
				</text>
			</g>
			<text id="ROOM 126
" style="transform: matrix(1,0,0,1,1021.4,376.6)" >
				<tspan x="0" y="0" class="t11">ROOM 126
</tspan>
			</text>
			<text id="ELECTRICAL
" style="transform: matrix(0,1,-1,0,998.9,339.1)" >
				<tspan x="0" y="0" class="t12">ELECTRICAL
</tspan>
			</text>
			<text id="DATA
" style="transform: matrix(1,0,0,1,990.4,403.5)" >
				<tspan x="0" y="0" class="t11">DATA
</tspan>
			</text>
			<text id="MECHANICAL
" style="transform: matrix(0,1,-1,0,973.5,377.8)" >
				<tspan x="0" y="0" class="t13">MECHANICAL
</tspan>
			</text>
			<text id="122
" style="transform: matrix(1,0,0,1,939.6,357.3)" >
				<tspan x="0" y="0" class="t11">122
</tspan>
			</text>
			<text id="123
" style="transform: matrix(1,0,0,1,966.5,357.3)" >
				<tspan x="0" y="0" class="t11">123
</tspan>
			</text>
			<g>
				<text id="ROOM 114
" style="transform: matrix(1,0,0,1,731.8,373.3)" >
					<tspan x="0" y="0" class="t11">ROOM 114
</tspan>
				</text>
				<text id="STEM LAB
" style="transform: matrix(1,0,0,1,731.8,385.3)" >
					<tspan x="0" y="0" class="t11">STEM LAB
</tspan>
				</text>
			</g>
			<text id="ROOM 111
" style="transform: matrix(1,0,0,1,723,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 111
</tspan>
			</text>
			<text id="ROOM 113
" style="transform: matrix(1,0,0,1,804.5,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 113
</tspan>
			</text>
			<text id="ROOM 119
" style="transform: matrix(1,0,0,1,887.1,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 119
</tspan>
			</text>
			<text id="ROOM 124
" style="transform: matrix(1,0,0,1,967.8,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 124
</tspan>
			</text>
			<text id="ROOM 127
" style="transform: matrix(1,0,0,1,1051.3,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 127
</tspan>
			</text>
			<text id="ROOM 129
" style="transform: matrix(1,0,0,1,1131.9,262.5)" >
				<tspan x="0" y="0" class="t11">ROOM 129
</tspan>
			</text>
			<g>
				<text id="ROOM 185
" style="transform: matrix(.885,.465,-0.465,.885,799,701.3)" >
					<tspan x="0" y="0" class="t11">ROOM 185
</tspan>
				</text>
				<text id="FACULTY LOUNGE
" style="transform: matrix(.885,.465,-0.465,.885,782.067,702.575)" >
					<tspan x="0" y="0" class="t11">FACULTY LOUNGE
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 187
" style="transform: matrix(.885,.465,-0.465,.885,832.4,652.9)" >
					<tspan x="0" y="0" class="t11">ROOM 187
</tspan>
				</text>
				<text id="WORKROOM
" style="transform: matrix(.885,.465,-0.465,.885,824.498,658.916)" >
					<tspan x="0" y="0" class="t11">WORKROOM
</tspan>
				</text>
			</g>
			<g>
				<text id="183
" style="transform: matrix(.885,.465,-0.465,.885,738,667.9)" >
					<tspan x="0" y="0" class="t11">183
</tspan>
				</text>
				<text id="CONF
" style="transform: matrix(.885,.465,-0.465,.885,730.452,674.102)" >
					<tspan x="0" y="0" class="t11">CONF
</tspan>
				</text>
			</g>
			<g>
				<text id="179
" style="transform: matrix(.885,.465,-0.465,.885,655.4,642.4)" >
					<tspan x="0" y="0" class="t11">179
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,655.4,642.4)" >
					<tspan x="0" y="0" class="t11">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="178
" style="transform: matrix(.885,.465,-0.465,.885,663.1,608.9)" >
					<tspan x="0" y="0" class="t11">178
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,663.1,608.9)" >
					<tspan x="0" y="0" class="t11">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="177
" style="transform: matrix(.885,.465,-0.465,.885,698.8,556.1)" >
					<tspan x="0" y="0" class="t11">177
</tspan>
				</text>
				<text id="FRONT
" style="transform: matrix(.885,.465,-0.465,.885,698.8,556.1)" >
					<tspan x="0" y="0" class="t11">FRONT
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,698.8,556.1)" >
					<tspan x="0" y="0" class="t11">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 147
" style="transform: matrix(.885,.465,-0.465,.885,426.8,449.6)" >
					<tspan x="0" y="0" class="t11">ROOM 147
</tspan>
				</text>
				<text id="MULTI-PURPOSE
" style="transform: matrix(.885,.465,-0.465,.885,412.346,452.176)" >
					<tspan x="0" y="0" class="t11">MULTI-PURPOSE
</tspan>
				</text>
				<text id="ROOM
" style="transform: matrix(.885,.465,-0.465,.885,425.87,469.442)" >
					<tspan x="0" y="0" class="t11">ROOM
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 149
" style="transform: matrix(.885,.465,-0.465,.885,515.6,495.9)" >
					<tspan x="0" y="0" class="t11">ROOM 149
</tspan>
				</text>
				<text id="MULTI-PURPOSE
" style="transform: matrix(.885,.465,-0.465,.885,500.438,498.105)" >
					<tspan x="0" y="0" class="t11">MULTI-PURPOSE
</tspan>
				</text>
				<text id="ROOM
" style="transform: matrix(.885,.465,-0.465,.885,513.962,515.37)" >
					<tspan x="0" y="0" class="t11">ROOM
</tspan>
				</text>
			</g>
			<text id="ROOM 175
" style="transform: matrix(.885,.465,-0.465,.885,453.6,640.8)" >
				<tspan x="0" y="0" class="t11">ROOM 175
</tspan>
			</text>
			<text id="ROOM 172
" style="transform: matrix(.885,.465,-0.465,.885,329.9,574.5)" >
				<tspan x="0" y="0" class="t11">ROOM 172
</tspan>
			</text>
			<text id="ROOM 169
" style="transform: matrix(.885,.465,-0.465,.885,249.6,530.4)" >
				<tspan x="0" y="0" class="t11">ROOM 169
</tspan>
			</text>
			<text id="ROOM 166
" style="transform: matrix(.885,.465,-0.465,.885,126,466.6)" >
				<tspan x="0" y="0" class="t11">ROOM 166
</tspan>
			</text>
			<g>
				<text id="ROOM 156
" style="transform: matrix(.885,.465,-0.465,.885,276.9,345.9)" >
					<tspan x="0" y="0" class="t11">ROOM 156
</tspan>
				</text>
				<text id="LUNCHROOM
" style="transform: matrix(.885,.465,-0.465,.885,266.9,353.9)" >
					<tspan x="0" y="0" class="t11">LUNCHROOM
</tspan>
				</text>
			</g>
			<text id="KITCHEN
" style="transform: matrix(.466,-0.885,.885,.466,259.1,283.4)" >
				<tspan x="0" y="0" class="t11">KITCHEN
</tspan>
			</text>
			<text id="STORAGE
" style="transform: matrix(.466,-0.885,.885,.466,157.8,376)" >
				<tspan x="0" y="0" class="t11">STORAGE
</tspan>
			</text>
			<text id="KITCHEN
" style="transform: matrix(.466,-0.885,.885,.466,232,252.2)" >
				<tspan x="0" y="0" class="t11">KITCHEN
</tspan>
			</text>
			<text id="STORAGE
" style="transform: matrix(.879,.477,-0.477,.879,509.9,402.5)" >
				<tspan x="0" y="0" class="t11">STORAGE
</tspan>
			</text>
			<text id="ROOM 108
" style="transform: matrix(.985,.174,-0.174,.985,598.5,241.9)" >
				<tspan x="0" y="0" class="t11">ROOM 108
</tspan>
			</text>
			<text id="ROOM 105
" style="transform: matrix(.985,.174,-0.174,.985,518.6,229.7)" >
				<tspan x="0" y="0" class="t11">ROOM 105
</tspan>
			</text>
			<text id="DATA
" style="transform: matrix(.992,.125,-0.125,.992,517.4,325.4)" >
				<tspan x="0" y="0" class="t11">DATA
</tspan>
			</text>
			<text id="OFFICE
" style="transform: matrix(.987,.163,-0.163,.987,545.6,350.3)" >
				<tspan x="0" y="0" class="t11">OFFICE
</tspan>
			</text>
			<g>
				<text id="ROOM 139
" style="transform: matrix(.987,.163,-0.163,.987,589.4,354.6)" >
					<tspan x="0" y="0" class="t11">ROOM 139
</tspan>
				</text>
				<text id="READING
" style="transform: matrix(.987,.163,-0.163,.987,590.298,363.871)" >
					<tspan x="0" y="0" class="t11">READING
</tspan>
				</text>
			</g>
			<text id="OFFICE
" style="transform: matrix(.99,.139,-0.139,.99,547.9,332.7)" >
				<tspan x="0" y="0" class="t11">OFFICE
</tspan>
			</text>
			<text id="PANTRY
" style="transform: matrix(.466,-0.885,.885,.466,191,201.2)" >
				<tspan x="0" y="0" class="t11">PANTRY
</tspan>
			</text>
			<text id="ENTRANCE
" style="transform: matrix(1,0,0,1,552.5,686.3)" >
				<tspan x="0" y="0" class="t11">ENTRANCE
</tspan>
			</text>
		</g>
		<g id="status">
			<g id="status_room_142">
				<g id="status_shooting" style="opacity: 0">
					<path class="s14" d="m971.1 463.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="gun" fill-rule="evenodd" class="s15" d="m968.1 441.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
				</g>
				<g id="status_fire">
					<path class="s16" d="m971.6 463.9c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path fill-rule="evenodd" class="s15" d="m977.2 445.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s17" d="m982.7 469.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s18" d="m980.2 465.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s19" d="m958.7 469.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s15" d="m957.1 464.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_114">
				<g id="status_shooting" style="opacity: 0">
					<path class="s14" d="m825.1 229.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="gun" fill-rule="evenodd" class="s15" d="m822.1 207.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
				</g>
				<g id="status_fire">
					<path class="s16" d="m825.6 229.9c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path fill-rule="evenodd" class="s15" d="m831.2 211.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s17" d="m836.7 235.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s18" d="m834.2 231.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter">
					<path class="s19" d="m812.7 235.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s15" d="m811.1 230.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_111">
				<g id="bg_status">
					<path class="bg_status_color" d="m743.1 229.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s6" d="m748.2 210.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s6" d="m737.1 214.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2l2.2-5.3m6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s6" d="m742.2 212.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s6" d="m741.7 203h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9l1.9-1.9m0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s6" d="m740.1 207.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s6" d="m744.5 203.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
					</g>
				<g id="command" style="opacity: 0">
					<path class="s17" d="m754.7 235.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s18" d="m752.2 231.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter">
					<path class="s19" d="m730.7 235.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s15" d="m729.1 230.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
		</g>
	</g>
</svg>`;

    const svgContainer = this.shadowRoot!.getElementById("svg-container");
    if (svgContainer) {
      svgContainer.innerHTML = svgMap;
      this._addClickHandlers();
    }
  }

  private _addClickHandlers() {
    const sections = [
      "room_105",
      "room_111",
      "room_113",
      "room_142",
      "room_145",
      "multi_purpose_room",
    ];

    sections.forEach((sectionId) => {
      const element = this.shadowRoot!.querySelector(
        `#${sectionId}`
      ) as SVGElement;
      if (element) {
        element.addEventListener("click", () => {
          this._changeSectionColor(element, sectionId);
        });
      }
    });
  }

  private _changeSectionColor(sectionElement: SVGElement, sectionId: string) {
    sectionElement.setAttribute("style", "opacity: 1;");

    const sectionAccordionItem = this.shadowRoot!.querySelector(
      ".accordion-item." + sectionId
    );
    if (sectionAccordionItem) {
      this.openAccordionItem(sectionAccordionItem as HTMLElement);
    }

    const rightMenu = this.shadowRoot!.querySelector(".right-menu");
    const svgContainer = this.shadowRoot!.querySelector(".svg-map");

    if (rightMenu) {
      rightMenu.setAttribute("style", "display: flex");
    }

    if (svgContainer) {
      svgContainer.setAttribute("style", "width: 75%");
    }
  }

  private openAccordionItem(accordionItem: HTMLElement): void {
    const header = accordionItem.querySelector(".accordion-header");
    if (header) {
      this.toggleAccordionContent(header as HTMLElement);
    }
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
      // Close the accordion content
      content.style.maxHeight = `${content.scrollHeight}px`; // Set to scrollHeight to trigger the transition
      requestAnimationFrame(() => {
        content.style.maxHeight = "0";
        content.style.padding = "0 10px";
        content.classList.remove("open");
      });
      icon.setAttribute("path", mdiChevronRight);
    } else {
      // Open the accordion content
      content.classList.add("open");
      content.style.maxHeight = "none"; // Remove maxHeight to get the true scrollHeight
      const height = "100%";
      content.style.maxHeight = "0"; // Reset maxHeight to 0 to prepare for transtion
      content.style.padding = "10px";

      requestAnimationFrame(() => {
        content.style.maxHeight = height;
      });

      icon.setAttribute("path", mdiChevronDown);
    }
  }

  static get styles(): CSSResultGroup {
    return css`
      .row {
        display: flex;
        justify-content: space-between;
        margin: 16px;

        .content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .command-button {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80px;
          flex: 1 1 calc(33.333% - 8px);
          margin-right: 8px;
          border: 1px solid #e1e1e11f;
          border-radius: 8px;
          min-width: 120px;
          transition:
            background-color 0.3s,
            border-color 0.3s;
        }
        .command-button:last-child {
          margin-right: 0;
        }
        .command-button:hover {
          background-color: #f0f0f08c;
        }
      }

      .container {
        display: flex;
        height: 100%;

        .svg-map {
          background: #383838;
          margin: 12px;
          border-radius: 8px;
          width: 100%;
          padding: 10px;

          svg {
            cursor: pointer;

            g#areas path:hover {
              fill: #c0cfe06c;
              opacity: 1;
            }
          }

          .map-name {
            display: flex;
            margin: 16px;
            color: #66cccc;
          }
        }

        .right-menu {
          width: 25%;
          padding: 10px;
          background: #383838;
          margin: 12px;
          border-radius: 8px;
          display: none;
          flex-direction: column;
          height: 100%;

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
          }

          .bottom-action{
            margin-top: auto;

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
        }
      }

      .header-map-section {
        height: var(--header-height);
        justify-content: space-between;
        align-items: center;
        display: flex;
        font-size: 20px;
        padding: 0px 12px;
        font-weight: 400;
        box-sizing: border-box;
        border: 1px solid #3f403f;

        .action-button-icon {
          white-space: nowrap;
          display: flex;
          align-items: center;
          color: #66cccc;
        }

        .right-navigation {
          .action-button {
            background: #feca57;
            border-radius: 8px;
          }

          .action-button-icon {
            color: #000000;
            margin: 0;

            .button-text {
              margin: 0;

              .icon {
                margin-right: 4px;
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
    "map-view": MapView;
  }
}

customElements.define("map-view", MapView);
