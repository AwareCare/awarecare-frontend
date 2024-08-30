import { property } from "lit/decorators";
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

class MapView extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, attribute: "dialog-open" }) dialogOpen = false;

  @property({ type: String, attribute: "dialog-title" }) dialogTitle = "";

  @property({ type: String, attribute: "dialog-type" }) dialogType = "";

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

        <div class="right-navigation" @click=${this._openDialog}>
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
                  <div class="section-send-command" @click=${this._openDialog}>
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

          <div class="bottom-action" @click=${this._openDialog}>
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
          <mwc-button class="command-button" dialogAction="send">
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

          <mwc-button class="command-button" dialogAction="send">
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

          <mwc-button class="command-button" dialogAction="send">
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

  private _openDialog(type: string) {
    this.dialogTitle = "Send Command";
    this.dialogType = type === "entire" ? "Entire Campus" : "Selected Room/s";
    this.dialogOpen = true;
  }

  private _closeDialog() {
    this.dialogOpen = false;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    this.addAccordionListeners();
    this._addSvgMap();
  }

  private _addSvgMap() {
    const svgMap = `<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1368 792">
  <defs>
    <style>
      .cls-1 {
        stroke-width: 1px;
      }

      .cls-1, .cls-2, .cls-3, .cls-4, .cls-5, .cls-6, .cls-7, .cls-8, .cls-9, .cls-10 {
        fill: none;
        stroke: #6bc4c7;
        stroke-miterlimit: 10;
      }

      .cls-2 {
        stroke-width: 1px;
      }

      .cls-3 {
        stroke-width: 1px;
      }

      .cls-4 {
        stroke-width: 1px;
      }

      .cls-5 {
        stroke-width: 1px;
      }

      .cls-11 {
        font-size: 7px;
        letter-spacing: 0em;
      }

      .cls-11, .cls-12, .cls-13, .cls-14, .cls-15, .cls-16 {
        fill: #ffffff;
      }

      .cls-opacity {
        opacity: 0.8;
      }

      .cls-11, .cls-12, .cls-14, .cls-15, .cls-16 {
        font-family: SourceSansPro-Bold, 'Source Sans Pro';
        font-weight: 700;
      }

      .cls-6 {
        stroke-width: 2px;
      }

      .cls-12, .cls-15, .cls-16 {
        font-size: 9px;
      }

      .cls-17 {
        fill: #6bc4c7;
      }

      .cls-7 {
        stroke-width: .8px;
      }

      .cls-8 {
        stroke-width: 1.1px;
      }

      .cls-9 {
        stroke-width: 1.1px;
      }

      .cls-13, .cls-18 {
        opacity: 0;
      }

      .cls-14 {
        font-size: 6px;
        letter-spacing: 0em;
      }

      .cls-15, .cls-19 {
        letter-spacing: 0em;
      }

      .cls-16, .cls-20 {
        letter-spacing: 0em;
      }

      .cls-18 {
        fill: #68cef5;
      }
    </style>
  </defs>
  <!-- Generator: Adobe Illustrator 28.6.0, SVG Export Plug-In . SVG Version: 1.2.0 Build 709)  -->
  <g>
    <g id="floorplan" class="cls-21">
      <g>
        <path class="cls-10" d="M1136.2,299.5"/>
        <polyline class="cls-10" points="1128.5 299.5 1125.4 299.5 1125.4 292 1112 292 1112 214 1192.1 214 1192.1 308.2 1143.1 308.2 1143.1 299.5"/>
        <rect class="cls-9" x="1143.1" y="300.2" width="39.3" height="7.8"/>
        <rect class="cls-10" x="1182.4" y="299.1" width="9" height="8.3"/>
        <line class="cls-9" x1="1159.5" y1="300.4" x2="1159.5" y2="308"/>
        <line class="cls-9" x1="1151.5" y1="300.4" x2="1151.5" y2="308"/>
        <line class="cls-9" x1="1167.1" y1="300.4" x2="1167.1" y2="308"/>
        <line class="cls-9" x1="1173.3" y1="300.4" x2="1173.3" y2="308"/>
        <line class="cls-9" x1="1157.7" y1="303.8" x2="1182.4" y2="303.8"/>
        <line class="cls-9" x1="1143.1" y1="303.8" x2="1153.2" y2="303.8"/>
        <rect class="cls-8" x="1153.2" y="300.2" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="1128.5 300.8 1125.4 300.8 1124.9 300.8 1124.9 299.1 1128.5 299.1 1128.5 300.8"/>
        <polygon class="cls-17" points="1143.6 300.8 1136.8 300.8 1135.7 300.8 1135.7 299.1 1143.6 299.1 1143.6 300.8"/>
        <path class="cls-10" d="M1128,300.2v8.4s8.2,1.6,8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M972.4,299.5"/>
        <polyline class="cls-10" points="964.7 299.5 961.6 299.5 961.6 292 948.2 292 948.2 214 1028.3 214 1028.3 308.2 979.3 308.2 979.3 299.5"/>
        <rect class="cls-9" x="979.3" y="300.2" width="39.3" height="7.8"/>
        <rect class="cls-10" x="1018.6" y="299.1" width="9" height="8.3"/>
        <line class="cls-9" x1="995.7" y1="300.4" x2="995.7" y2="308"/>
        <line class="cls-9" x1="987.7" y1="300.4" x2="987.7" y2="308"/>
        <line class="cls-9" x1="1003.3" y1="300.4" x2="1003.3" y2="308"/>
        <line class="cls-9" x1="1009.5" y1="300.4" x2="1009.5" y2="308"/>
        <line class="cls-9" x1="994.2" y1="303.8" x2="1018.6" y2="303.8"/>
        <line class="cls-9" x1="979.3" y1="303.8" x2="989.4" y2="303.8"/>
        <rect class="cls-8" x="989.4" y="300.2" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="964.7 300.8 961.6 300.8 961.1 300.8 961.1 299.1 964.7 299.1 964.7 300.8"/>
        <polygon class="cls-17" points="979.8 300.8 973 300.8 971.9 300.8 971.9 299.1 979.8 299.1 979.8 300.8"/>
        <path class="cls-10" d="M964.3,300.2v8.4s8.2,1.6,8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M808.6,299.5"/>
        <polyline class="cls-10" points="801 299.5 797.8 299.5 797.8 292 784.4 292 784.4 214 864.5 214 864.5 308.2 815.5 308.2 815.5 299.5"/>
        <rect class="cls-9" x="815.5" y="300.2" width="39.3" height="7.8"/>
        <rect class="cls-10" x="854.8" y="299.1" width="9" height="8.3"/>
        <line class="cls-9" x1="831.9" y1="300.4" x2="831.9" y2="308"/>
        <line class="cls-9" x1="823.9" y1="300.4" x2="823.9" y2="308"/>
        <line class="cls-9" x1="839.5" y1="300.4" x2="839.5" y2="308"/>
        <line class="cls-9" x1="845.7" y1="300.4" x2="845.7" y2="308"/>
        <line class="cls-9" x1="830.2" y1="303.8" x2="854.8" y2="303.8"/>
        <line class="cls-9" x1="815.5" y1="303.8" x2="826" y2="303.8"/>
        <rect class="cls-8" x="825.6" y="300.2" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="801 300.8 797.8 300.8 797.3 300.8 797.3 299.1 801 299.1 801 300.8"/>
        <polygon class="cls-17" points="816 300.8 809.2 300.8 808.1 300.8 808.1 299.1 816 299.1 816 300.8"/>
        <path class="cls-10" d="M800.5,300.2v8.4s8.2,1.6,8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M758.4,299.5"/>
        <polyline class="cls-10" points="766.1 299.5 769.2 299.5 769.2 292 782.6 292 782.6 214 702.6 214 702.6 308.2 751.5 308.2 751.5 299.5"/>
        <rect class="cls-9" x="712.2" y="300.2" width="39.3" height="7.8" transform="translate(1463.8 608.2) rotate(-180)"/>
        <rect class="cls-10" x="703.2" y="299.1" width="9" height="8.3" transform="translate(1415.4 606.5) rotate(-180)"/>
        <line class="cls-9" x1="735.1" y1="300.4" x2="735.1" y2="308"/>
        <line class="cls-9" x1="743.1" y1="300.4" x2="743.1" y2="308"/>
        <line class="cls-9" x1="727.5" y1="300.4" x2="727.5" y2="308"/>
        <line class="cls-9" x1="721.3" y1="300.4" x2="721.3" y2="308"/>
        <line class="cls-9" x1="736.9" y1="303.8" x2="712.2" y2="303.8"/>
        <line class="cls-9" x1="751.5" y1="303.8" x2="741.6" y2="303.8"/>
        <rect class="cls-8" x="736.9" y="300.2" width="4.5" height="5.1" transform="translate(1478.3 605.4) rotate(-180)"/>
        <polygon class="cls-17" points="766.1 300.8 769.2 300.8 769.7 300.8 769.7 299.1 766.1 299.1 766.1 300.8"/>
        <polygon class="cls-17" points="751 300.8 757.8 300.8 758.9 300.8 758.9 299.1 751 299.1 751 300.8"/>
        <path class="cls-10" d="M766.6,300.2v8.4s-8.2,1.6-8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M922.2,299.5"/>
        <polyline class="cls-10" points="929.9 299.5 933 299.5 933 292 946.4 292 946.4 214 866.3 214 866.3 308.2 915.3 308.2 915.3 299.5"/>
        <rect class="cls-9" x="876" y="300.2" width="39.3" height="7.8" transform="translate(1791.3 608.2) rotate(-180)"/>
        <rect class="cls-10" x="867" y="299.1" width="9" height="8.3" transform="translate(1743 606.5) rotate(-180)"/>
        <line class="cls-9" x1="898.9" y1="300.4" x2="898.9" y2="308"/>
        <line class="cls-9" x1="906.9" y1="300.4" x2="906.9" y2="308"/>
        <line class="cls-9" x1="891.3" y1="300.4" x2="891.3" y2="308"/>
        <line class="cls-9" x1="885.1" y1="300.4" x2="885.1" y2="308"/>
        <line class="cls-9" x1="900.9" y1="303.8" x2="876" y2="303.8"/>
        <line class="cls-9" x1="915.3" y1="303.8" x2="905.2" y2="303.8"/>
        <polyline class="cls-8" points="905.2 303.8 905.2 300.2 900.6 300.2 900.6 305.2 905.2 305.2 905.2 303.8"/>
        <polygon class="cls-17" points="929.9 300.8 933 300.8 933.5 300.8 933.5 299.1 929.9 299.1 929.9 300.8"/>
        <polygon class="cls-17" points="914.8 300.8 921.6 300.8 922.7 300.8 922.7 299.1 914.8 299.1 914.8 300.8"/>
        <path class="cls-10" d="M930.4,300.2v8.4s-8.2,1.6-8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M1086,299.5"/>
        <polyline class="cls-10" points="1093.6 299.5 1096.8 299.5 1096.8 292 1110.2 292 1110.2 214 1030.1 214 1030.1 308.2 1079.1 308.2 1079.1 299.5"/>
        <rect class="cls-9" x="1039.8" y="300.2" width="39.3" height="7.8" transform="translate(2118.9 608.2) rotate(-180)"/>
        <rect class="cls-10" x="1030.8" y="299.1" width="9" height="8.3" transform="translate(2070.6 606.5) rotate(-180)"/>
        <line class="cls-9" x1="1062.7" y1="300.4" x2="1062.7" y2="308"/>
        <line class="cls-9" x1="1070.7" y1="300.4" x2="1070.7" y2="308"/>
        <line class="cls-9" x1="1055.1" y1="300.4" x2="1055.1" y2="308"/>
        <line class="cls-9" x1="1048.9" y1="300.4" x2="1048.9" y2="308"/>
        <line class="cls-9" x1="1064.4" y1="303.8" x2="1039.8" y2="303.8"/>
        <line class="cls-9" x1="1079.1" y1="303.8" x2="1068.9" y2="303.8"/>
        <rect class="cls-8" x="1064.4" y="300.2" width="4.5" height="5.1" transform="translate(2133.4 605.4) rotate(-180)"/>
        <polygon class="cls-17" points="1093.6 300.8 1096.8 300.8 1097.3 300.8 1097.3 299.1 1093.6 299.1 1093.6 300.8"/>
        <polygon class="cls-17" points="1078.6 300.8 1085.4 300.8 1086.5 300.8 1086.5 299.1 1078.6 299.1 1078.6 300.8"/>
        <path class="cls-10" d="M1094.1,300.2v8.4s-8.2,1.6-8.1-8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M1069,451.4"/>
        <polyline class="cls-10" points="1076.6 451.4 1079.7 451.4 1079.7 458.9 1093.1 458.9 1093.1 536.9 1013.1 536.9 1013.1 442.7 1062.1 442.7 1062.1 451.4"/>
        <rect class="cls-10" x="1022.8" y="443" width="39.3" height="7.8" transform="translate(2084.8 893.7) rotate(-180)"/>
        <rect class="cls-10" x="1013.8" y="443.6" width="9" height="8.3" transform="translate(2036.5 895.4) rotate(-180)"/>
        <line class="cls-10" x1="1045.6" y1="450.5" x2="1045.6" y2="443"/>
        <line class="cls-10" x1="1053.7" y1="450.5" x2="1053.7" y2="443"/>
        <line class="cls-10" x1="1038" y1="450.5" x2="1038" y2="443"/>
        <line class="cls-10" x1="1031.9" y1="450.5" x2="1031.9" y2="443"/>
        <line class="cls-10" x1="1047.4" y1="447.1" x2="1022.8" y2="447.1"/>
        <line class="cls-10" x1="1062.1" y1="447.1" x2="1052.3" y2="447.1"/>
        <rect class="cls-10" x="1047.4" y="445.7" width="4.5" height="5.1" transform="translate(2099.3 896.5) rotate(-180)"/>
        <polygon class="cls-17" points="1076.6 450.1 1079.7 450.1 1080.2 450.1 1080.2 451.9 1076.6 451.9 1076.6 450.1"/>
        <polygon class="cls-17" points="1061.5 450.1 1068.3 450.1 1069.5 450.1 1069.5 451.9 1061.5 451.9 1061.5 450.1"/>
        <path class="cls-10" d="M1077.1,450.8v-8.4s-8.2-1.6-8.1,8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M1203.3,451.4"/>
        <polyline class="cls-10" points="1195.7 451.4 1192.6 451.4 1192.6 458.9 1179.2 458.9 1179.2 536.9 1259.2 536.9 1259.2 442.7 1210.2 442.7 1210.2 451.4"/>
        <rect class="cls-9" x="1210.2" y="443" width="39.3" height="7.8"/>
        <rect class="cls-10" x="1249.5" y="443.6" width="9" height="8.3"/>
        <line class="cls-9" x1="1226.7" y1="450.5" x2="1226.7" y2="443"/>
        <line class="cls-9" x1="1218.6" y1="450.5" x2="1218.6" y2="443"/>
        <line class="cls-9" x1="1234.3" y1="450.5" x2="1234.3" y2="443"/>
        <line class="cls-9" x1="1240.4" y1="450.5" x2="1240.4" y2="443"/>
        <line class="cls-10" x1="1224.9" y1="447.1" x2="1249.5" y2="447.1"/>
        <rect class="cls-8" x="1220.3" y="445.7" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="1195.7 450.1 1192.6 450.1 1192.1 450.1 1192.1 451.9 1195.7 451.9 1195.7 450.1"/>
        <polygon class="cls-17" points="1210.7 450.1 1203.9 450.1 1202.8 450.1 1202.8 451.9 1210.7 451.9 1210.7 450.1"/>
        <path class="cls-10" d="M1195.2,450.8v-8.4s8.2-1.6,8.1,8.9"/>
        <line class="cls-10" x1="1209.8" y1="447.1" x2="1220.2" y2="447.1"/>
      </g>
      <g>
        <path class="cls-10" d="M1120.3,451.4"/>
        <polyline class="cls-10" points="1112.6 451.4 1109.5 451.4 1109.5 458.9 1096.1 458.9 1096.1 536.9 1176.2 536.9 1176.2 442.7 1127.2 442.7 1127.2 451.4"/>
        <rect class="cls-9" x="1127.2" y="443" width="39.3" height="7.8"/>
        <rect class="cls-10" x="1166.5" y="443.6" width="9" height="8.3"/>
        <line class="cls-9" x1="1143.6" y1="450.5" x2="1143.6" y2="443"/>
        <line class="cls-9" x1="1135.6" y1="450.5" x2="1135.6" y2="443"/>
        <line class="cls-9" x1="1151.2" y1="450.5" x2="1151.2" y2="443"/>
        <line class="cls-9" x1="1157.4" y1="450.5" x2="1157.4" y2="443"/>
        <line class="cls-10" x1="1127.2" y1="447.1" x2="1137.5" y2="447.1"/>
        <line class="cls-10" x1="1141.6" y1="447.1" x2="1175.6" y2="447.1"/>
        <rect class="cls-8" x="1137.3" y="445.7" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="1112.6 450.1 1109.5 450.1 1109 450.1 1109 451.9 1112.6 451.9 1112.6 450.1"/>
        <polygon class="cls-17" points="1127.7 450.1 1120.9 450.1 1119.8 450.1 1119.8 451.9 1127.7 451.9 1127.7 450.1"/>
        <path class="cls-10" d="M1112.1,450.8v-8.4s8.2-1.6,8.1,8.9"/>
      </g>
      <g>
        <path class="cls-10" d="M954.2,451.4"/>
        <polyline class="cls-10" points="946.6 451.4 940.6 451.4 940.6 460 930 460 930 536.9 1010.1 536.9 1010.1 442.7 961.1 442.7 961.1 451.4"/>
        <rect class="cls-9" x="961.1" y="443" width="39.3" height="7.8"/>
        <rect class="cls-10" x="1000.4" y="443.6" width="9" height="8.3"/>
        <line class="cls-9" x1="977.5" y1="450.5" x2="977.5" y2="443"/>
        <line class="cls-9" x1="969.5" y1="450.5" x2="969.5" y2="443"/>
        <line class="cls-9" x1="985.1" y1="450.5" x2="985.1" y2="443"/>
        <line class="cls-9" x1="991.3" y1="450.5" x2="991.3" y2="443"/>
        <line class="cls-10" x1="961.1" y1="447.1" x2="971" y2="447.1"/>
        <line class="cls-10" x1="975.7" y1="447.1" x2="1009.4" y2="447.1"/>
        <rect class="cls-8" x="971.2" y="445.7" width="4.5" height="5.1"/>
        <polygon class="cls-17" points="946.6 450.1 943.5 450.1 942.9 450.1 942.9 451.9 946.6 451.9 946.6 450.1"/>
        <polygon class="cls-17" points="961.6 450.1 954.8 450.1 953.7 450.1 953.7 451.9 961.6 451.9 961.6 450.1"/>
        <path class="cls-10" d="M946.1,450.8v-8.4s8.2-1.6,8.1,8.9"/>
      </g>
      <polyline class="cls-10" points="1172.3 402.8 1172.3 401.2 1162.7 401.2 1162.7 347.9 1177.5 347.9 1177.5 332 1261.6 332 1261.6 417.3 1172.3 417.3 1172.3 410.3"/>
      <rect class="cls-10" x="1162.7" y="347.9" width="9.6" height="53.3"/>
      <line class="cls-10" x1="1163" y1="356.9" x2="1172.1" y2="356.9"/>
      <line class="cls-10" x1="1163" y1="366.5" x2="1172.1" y2="366.5"/>
      <line class="cls-10" x1="1163" y1="375.1" x2="1172.1" y2="375.1"/>
      <line class="cls-10" x1="1163" y1="382.3" x2="1172.1" y2="382.3"/>
      <line class="cls-10" x1="1163" y1="391.2" x2="1172.1" y2="391.2"/>
      <rect class="cls-10" x="1166.8" y="384.6" width="5.6" height="4.7"/>
      <line class="cls-10" x1="1168.6" y1="356.9" x2="1168.6" y2="382.3"/>
      <line class="cls-10" x1="1168.6" y1="391.2" x2="1168.6" y2="401.3"/>
      <polyline class="cls-10" points="1026 341.1 1032.3 341.2 1032.3 331.4 1067.5 331.4 1067.5 415.9 1015.7 415.9 1015.7 341.1 1017.7 341.1"/>
      <path class="cls-10" d="M1026,341.1"/>
      <path class="cls-10" d="M1017.7,341.1"/>
      <rect class="cls-10" x="1015.7" y="408.2" width="9.2" height="7.7"/>
      <line class="cls-10" x1="1067.5" y1="409.2" x2="1025.2" y2="409.2"/>
      <line class="cls-10" x1="1067.5" y1="412.7" x2="1025.2" y2="412.7"/>
      <line class="cls-10" x1="1034.4" y1="409.2" x2="1034.4" y2="415.9"/>
      <line class="cls-10" x1="1032.6" y1="412.7" x2="1032.6" y2="415.9"/>
      <line class="cls-10" x1="1042.1" y1="409.2" x2="1042.1" y2="415.9"/>
      <line class="cls-10" x1="1059" y1="409.2" x2="1059" y2="412.7"/>
      <line class="cls-6" x1="1032.6" y1="336" x2="1067.5" y2="336"/>
      <polygon class="cls-17" points="1017.9 340.1 1015.6 340.1 1015.2 340.1 1015.2 341.8 1017.9 341.8 1017.9 340.1"/>
      <polygon class="cls-17" points="1032.8 340.1 1026.1 340.1 1025 340.1 1025 341.8 1032.8 341.8 1032.8 340.1"/>
      <path class="cls-10" d="M1017.4,340.7v-8.4s8.2-1.6,8.1,8.9"/>
      <line class="cls-10" x1="985.8" y1="331.4" x2="985.8" y2="415.9"/>
      <line class="cls-10" x1="869.2" y1="331.4" x2="869.2" y2="415.9"/>
      <polyline class="cls-10" points="996 331.4 1015.2 331.4 1015.2 415.9 996.6 415.9"/>
      <rect class="cls-17" x="985.8" y="380.8" width="29.4" height="2.5"/>
      <rect class="cls-17" x="945.7" y="392.5" width="19" height="2.5"/>
      <rect class="cls-17" x="931.7" y="369.8" width="54.1" height="2.5"/>
      <rect class="cls-17" x="869.2" y="369.8" width="52.4" height="2.5"/>
      <rect class="cls-17" x="938.7" y="376.5" width="12.2" height="2.5" transform="translate(1322.6 -567.1) rotate(90)"/>
      <rect class="cls-17" x="937.1" y="397.4" width="15.4" height="2.5" transform="translate(1343.5 -546.1) rotate(90)"/>
      <line class="cls-10" x1="959.3" y1="331.8" x2="959.3" y2="371.1"/>
      <line class="cls-10" x1="932.1" y1="331.4" x2="932.1" y2="371.1"/>
      <rect class="cls-10" x="1193.8" y="214" width="44.9" height="25.5"/>
      <line class="cls-10" x1="1216.3" y1="236.6" x2="1216.3" y2="273.7"/>
      <line class="cls-10" x1="1227.9" y1="236.6" x2="1227.9" y2="273.7"/>
      <line class="cls-10" x1="1238.7" y1="236.6" x2="1238.7" y2="307.4"/>
      <line class="cls-10" x1="1216.3" y1="241.9" x2="1238.2" y2="241.9"/>
      <line class="cls-10" x1="1216.3" y1="270.3" x2="1238.7" y2="270.3"/>
      <line class="cls-10" x1="1216.3" y1="267.7" x2="1238.7" y2="267.7"/>
      <line class="cls-10" x1="1216.3" y1="265.1" x2="1238.7" y2="265.1"/>
      <line class="cls-10" x1="1216.3" y1="262.5" x2="1238.7" y2="262.5"/>
      <line class="cls-10" x1="1216.3" y1="259.9" x2="1238.7" y2="259.9"/>
      <line class="cls-10" x1="1216.3" y1="257.4" x2="1238.7" y2="257.4"/>
      <line class="cls-10" x1="1216.3" y1="254.8" x2="1238.7" y2="254.8"/>
      <line class="cls-10" x1="1216.3" y1="252.2" x2="1238.7" y2="252.2"/>
      <line class="cls-10" x1="1216.3" y1="249.6" x2="1238.7" y2="249.6"/>
      <line class="cls-10" x1="1216.3" y1="247" x2="1238.7" y2="247"/>
      <line class="cls-10" x1="1216.3" y1="244.4" x2="1238.7" y2="244.4"/>
      <line class="cls-10" x1="1227.5" y1="257.4" x2="1237.2" y2="252.2"/>
      <line class="cls-10" x1="1218.1" y1="257.4" x2="1227.7" y2="252.2"/>
      <polygon class="cls-17" points="1196.8 273.3 1193.7 273.3 1193.2 273.3 1193.2 271.6 1196.8 271.6 1196.8 273.3"/>
      <polygon class="cls-17" points="1216.7 273.7 1205.8 273.7 1203.9 273.7 1203.9 271.9 1216.7 271.9 1216.7 273.7"/>
      <path class="cls-10" d="M1196.3,272.7v8.4s8.2,1.6,8.1-8.9"/>
      <polygon class="cls-17" points="1219.8 316.7 1219.8 322.4 1219.8 323.4 1218.1 323.4 1218.1 316.7 1219.8 316.7"/>
      <polygon class="cls-17" points="1242.7 308.8 1221.6 308.8 1218.1 308.8 1218.1 307 1242.7 307 1242.7 308.8"/>
      <path class="cls-10" d="M1218.1,331h9.5s1.6-8.2-8.9-8.1"/>
      <path class="cls-10" d="M1218.1,309.1h9.5s1.6,8.2-8.9,8.1"/>
      <polygon class="cls-17" points="1241.2 316 1241.2 321.3 1241.2 322.2 1239.4 322.2 1239.4 316 1241.2 316"/>
      <path class="cls-3" d="M1239.5,329.1h9.5s1.6-7.5-8.9-7.5"/>
      <path class="cls-3" d="M1239.5,309.1h9.5s1.6,7.5-8.9,7.5"/>
      <polygon class="cls-17" points="1262.2 420 1241.5 420 1238.1 420 1238.1 417.5 1262.2 417.5 1262.2 420"/>
      <rect class="cls-17" x="1238.6" y="329.5" width="23.5" height="2.5"/>
      <rect class="cls-17" x="1154.3" y="331.5" width="23.3" height="2.5"/>
      <path class="cls-17" d="M1237.2,430.6v-1c3.4,0,5.8-.8,7.2-2.5,1.4-1.7,1.4-3.8,1.3-4.6h-8v-1h8.9s0,.4,0,.4c0,.1.6,3.3-1.5,5.9-1.6,1.9-4.3,2.9-8,2.9Z"/>
      <path class="cls-17" d="M1260.6,428.5v-1c3.4,0,5.8-.8,7.2-2.5,1.4-1.7,1.4-3.8,1.3-4.6h-8v-1h8.9s0,.4,0,.4c0,.1.6,3.3-1.5,5.9-1.6,1.9-4.3,2.9-8,2.9Z"/>
      <path class="cls-17" d="M1237.2,430.3v1c3.4,0,5.8.8,7.2,2.5,1.4,1.7,1.4,3.8,1.3,4.6h-8v1h8.9s0-.4,0-.4c0-.1.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9Z"/>
      <path class="cls-17" d="M1260.6,432.2v1c3.4,0,5.8.8,7.2,2.5,1.4,1.7,1.4,3.8,1.3,4.6h-8v1h8.9s0-.4,0-.4c0-.1.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9Z"/>
      <rect class="cls-17" x="1236.4" y="438.4" width="2.7" height="3.8"/>
      <rect class="cls-17" x="1236.4" y="417.5" width="2.7" height="5"/>
      <rect class="cls-17" x="1259.4" y="427.5" width="2.4" height="5.7"/>
      <polyline class="cls-6" points="699.7 232.9 699.6 210.4 1242.7 210.4 1242.7 307"/>
      <polyline class="cls-10" points="1079.6 312.4 979.3 312.4 979.3 305.6"/>
      <polyline class="cls-10" points="915.9 312.4 815.5 312.4 815.5 305.5"/>
      <polyline class="cls-10" points="1193.8 239.5 1193.8 312.4 1143 312.4 1143 304.8"/>
      <g>
        <path class="cls-10" d="M1115.2,308.8v8.4s-8.2,1.6-8.1-8.9v-1.7c.1,0-8.4,0-8.4,0v-12.5h25v12.5h-8.4v2.2"/>
        <polyline class="cls-10" points="1096.8 300.8 1096.8 308.7 1107.6 308.7"/>
        <polyline class="cls-10" points="1125.4 300.8 1125.4 308.7 1114.7 308.7"/>
      </g>
      <g>
        <polyline class="cls-10" points="933 300.4 933 308.2 943.3 308.2 943.4 306.1 934.9 306.1 934.9 293.6 959.8 293.6 959.8 306.1 951.1 306.1"/>
        <path class="cls-10" d="M951.4,305.6v11.2s-8.2,1.6-8.1-8.9"/>
        <polyline class="cls-10" points="950.9 308.2 961.6 308.2 961.6 300.4"/>
      </g>
      <g>
        <path class="cls-10" d="M787.7,308.3v-2.2s8.4,0,8.4,0v-12.5h-25v12.5h8.5v1.7c-.2,10.5,8,8.9,8,8.9v-8.4"/>
        <polyline class="cls-10" points="769.2 300.4 769.2 308.2 780 308.2"/>
        <polyline class="cls-10" points="797.9 300.4 797.9 308.2 787.2 308.2"/>
      </g>
      <path class="cls-7" d="M1097.7,360.6c0-.3,0-.7,0-1.1,0-2.7-1-4.9-2.3-4.9s-2.3,2.2-2.3,4.9,0,.7,0,1.1h4.4Z"/>
      <path class="cls-7" d="M1089.5,360.6c0-.3,0-.7,0-1.1,0-2.7-1-4.9-2.3-4.9s-2.3,2.2-2.3,4.9,0,.7,0,1.1h4.4Z"/>
      <path class="cls-7" d="M1105,360.6c0-.3,0-.7,0-1.1,0-2.7-1-4.9-2.3-4.9s-2.3,2.2-2.3,4.9,0,.7,0,1.1h4.4Z"/>
      <path class="cls-7" d="M1081.6,360.6c0-.3,0-.7,0-1.1,0-2.7-1-4.9-2.3-4.9s-2.3,2.2-2.3,4.9,0,.7,0,1.1h4.4Z"/>
      <path class="cls-7" d="M1089.8,347.1c-.9,5.5-5,5.8-5,5.8v-5.7h-1.6v14.3"/>
      <path class="cls-7" d="M1085.3,371.1c0,.3,0,.7,0,1.1,0,2.7,1,4.9,2.3,4.9s2.3-2.2,2.3-4.9,0-.7,0-1.1h-4.4Z"/>
      <path class="cls-7" d="M1077.5,371.1c0,.3,0,.7,0,1.1,0,2.7,1,4.9,2.3,4.9s2.3-2.2,2.3-4.9,0-.7,0-1.1h-4.4Z"/>
      <path class="cls-7" d="M1090.8,347.3h1.6v5.7s4.1-.3,5-5.8"/>
      <path class="cls-7" d="M1098.9,347.3h1.6v5.7s4.1-.3,5-5.8"/>
      <path class="cls-7" d="M1068.9,346.9h1.7v-8.1s8.3.1,8.2,8.4"/>
      <rect class="cls-17" x="1078.4" y="346.6" width="6.1" height="1.1"/>
      <rect class="cls-17" x="1089.4" y="346.6" width="3.4" height="1.1"/>
      <rect class="cls-17" x="1096.9" y="346.6" width="4" height="1.1"/>
      <line class="cls-7" x1="1091.1" y1="347.1" x2="1091.1" y2="361.6"/>
      <line class="cls-7" x1="1098.9" y1="347.1" x2="1098.9" y2="361.6"/>
      <rect class="cls-17" x="1067.4" y="360.9" width="39.6" height="1.5"/>
      <rect class="cls-17" x="1106.2" y="343" width="16.6" height="2"/>
      <rect class="cls-17" x="1106.2" y="383.5" width="16.6" height="2"/>
      <rect class="cls-17" x="1067.4" y="369.3" width="39.6" height="1.5"/>
      <rect class="cls-17" x="1069.2" y="395.3" width="65.1" height="1.5"/>
      <rect class="cls-17" x="1068.5" y="415.4" width="2.3" height="1.1"/>
      <polyline class="cls-10" points="1069 415.9 1069 333 1133.9 333 1133.9 347.1 1135.7 347.1 1135.7 331 1067.5 331 1067.5 415.9"/>
      <rect class="cls-7" x="1092.8" y="370.8" width="4.9" height="2.9" rx="1.4" ry="1.4"/>
      <rect class="cls-7" x="1100.6" y="370.8" width="4.9" height="2.9" rx="1.4" ry="1.4"/>
      <line class="cls-7" x1="1098.9" y1="370.5" x2="1098.9" y2="377.8"/>
      <line class="cls-7" x1="1097.4" y1="376.6" x2="1100.5" y2="376.6"/>
      <rect class="cls-2" x="1106.7" y="343.7" width="2.3" height="40.8"/>
      <path class="cls-2" d="M1068.7,385.1h2.4v8.6s8,.1,8-8.6h5.3v-.6"/>
      <path class="cls-7" d="M1091.1,370.3v14.9h-1v-.7c-.9-5.5-5-5.8-5-5.8v5.7h-1.6v-14.3"/>
      <g>
        <path class="cls-10" d="M1098.2,442.1v2.2h8.8s0,12.5,0,12.5h-25s0-12.5,0-12.5h8v-1.7c0-10.5,8.1-8.9,8.1-8.9v8.4"/>
        <polyline class="cls-10" points="1079.7 451.4 1079.7 442.2 1090.5 442.2"/>
        <polyline class="cls-10" points="1109.5 451.4 1109.5 442.2 1097.7 442.2"/>
      </g>
      <g>
        <path class="cls-10" d="M929.3,442.6v2.2h8.8s0,12.5,0,12.5h-25s0-12.5,0-12.5h8.1s0-1.7,0-1.7c0-10.5,8.1-8.9,8.1-8.9v8.4"/>
        <line class="cls-10" x1="784.3" y1="505.8" x2="779.3" y2="502.2"/>
        <polyline class="cls-10" points="921.6 442.7 910.8 442.7 910.8 460 926.5 460 926.9 536.9 827.6 536.5 797.3 514.9"/>
        <polyline class="cls-10" points="940.6 451.9 940.6 442.7 928.8 442.7"/>
      </g>
      <path class="cls-10" d="M1187.1,443c0-8.9-8.1-8.5-8.1-8.5v8.2s-3.4,0-3.4,0"/>
      <polyline class="cls-10" points="1193.5 451.7 1193.5 442.5 1187.1 442.5"/>
      <polyline class="cls-10" points="1133.8 396.5 1133.8 380.3 1135.7 380.3 1135.7 417.6 1103.1 417.6 1103.1 415.9 1133.9 415.9 1133.9 412.5"/>
      <rect class="cls-10" x="1130.1" y="400.5" width="5.5" height="6"/>
      <rect class="cls-10" x="1130.1" y="406.5" width="5.5" height="6"/>
      <path class="cls-10" d="M1122.6,397.1s7.6,0,7.6,0v3.4c0,.7,0,1.5,0,2.2,0,1.3-1,1.1-2,1-3.6-.3-5.7-3-5.6-6.6Z"/>
      <rect class="cls-17" x="1126.3" y="399.3" width="1.2" height="1.2"/>
      <line class="cls-10" x1="1095.3" y1="417.6" x2="1078.5" y2="417.6"/>
      <line class="cls-10" x1="1071.5" y1="417.6" x2="996.6" y2="417.6"/>
      <polyline class="cls-10" points="931.7 417.6 966.6 417.6 966.6 371.7"/>
      <line class="cls-10" x1="988.4" y1="417.6" x2="975" y2="417.6"/>
      <line class="cls-10" x1="989" y1="415.9" x2="975" y2="415.9"/>
      <polyline class="cls-10" points="923.2 415.9 820.2 415.9 820.2 404.2"/>
      <polyline class="cls-10" points="801.6 415.9 703.1 415.9 703.1 333.4 801.5 333.4 801.5 340 710.4 340"/>
      <polyline class="cls-10" points="931.3 415.9 965 415.9 965 371.7"/>
      <rect class="cls-10" x="1093.2" y="396.7" width="18.4" height="4.1"/>
      <polyline class="cls-10" points="1091.8 396.5 1091.7 415.9 1078.6 415.9"/>
      <polyline class="cls-10" points="1093.2 396 1093.2 415.9 1095 415.9"/>
      <path class="cls-10" d="M1094.8,417.6v-10.1s8.6.5,8.6,8.4"/>
      <path class="cls-4" d="M1071.1,417.6v-10.1s8,.4,8,8.4"/>
      <rect class="cls-17" x="1078.5" y="415.4" width="1" height="2.2"/>
      <path class="cls-10" d="M1154.9,333.6s-.5,8.5,8.7,8.5v5.8"/>
      <path class="cls-10" d="M988.4,331.1v-8.4s8.1-.4,8.1,8.5"/>
      <path class="cls-10" d="M830.2,331.2c0-8.9,8.1-8.5,8.1-8.5v8.4h10.3v23.3"/>
      <path class="cls-10" d="M969.5,331.2c0,8.9-8.1,8.5-8.1,8.5v-8.4"/>
      <path class="cls-10" d="M942.9,331.2c0,8.9-8.1,8.5-8.1,8.5v-8.4h-4.4v8.4s-8.1.4-8.1-8.5"/>
      <path class="cls-10" d="M859.5,331.2c0,8.9-8.1,8.5-8.1,8.5v-8.5h-2.5"/>
      <line class="cls-10" x1="988.9" y1="331.4" x2="968.9" y2="331.4"/>
      <line class="cls-10" x1="961.8" y1="331.4" x2="942.3" y2="331.4"/>
      <line class="cls-10" x1="922.8" y1="331.4" x2="859" y2="331.4"/>
      <polyline class="cls-10" points="809.6 341 803.6 341 803.6 331.4 701.3 331.4 701.3 417.6 803.5 417.6 803.5 408.6"/>
      <line class="cls-7" x1="702.6" y1="221.5" x2="1191.4" y2="221.5"/>
      <path class="cls-10" d="M967.5,415.5v8.4s8.1.5,8.1-8.4"/>
      <path class="cls-10" d="M988.5,415.5v8.4s8.1.4,8.1-8.5"/>
      <path class="cls-10" d="M944.4,391.5h-8.4s-.4-8.1,8.5-8.1"/>
      <path class="cls-10" d="M944.4,405.9c-8.9,0-8.5,8.1-8.5,8.1h8.4v2.1"/>
      <path class="cls-7" d="M964.3,374.5c-.3,0-.7,0-1.1,0-2.7,0-4.9,1-4.9,2.3s2.2,2.3,4.9,2.3.7,0,1.1,0v-4.4Z"/>
      <path class="cls-7" d="M964.3,396.7c-.3,0-.7,0-1.1,0-2.7,0-4.9,1-4.9,2.3s2.2,2.3,4.9,2.3.7,0,1.1,0v-4.4Z"/>
      <rect class="cls-7" x="1109.5" y="358.2" width="6.7" height="12.4"/>
      <rect class="cls-7" x="1109.5" y="360.3" width="4.8" height="8.2" rx="2.4" ry="2.4"/>
      <circle class="cls-17" cx="1110.2" cy="363.3" r=".6"/>
      <circle class="cls-17" cx="1110.2" cy="365.4" r=".6"/>
      <g>
        <rect class="cls-7" x="957.8" y="384" width="6.7" height="9" transform="translate(1922.4 777.1) rotate(180)"/>
        <circle class="cls-17" cx="963.8" cy="389.7" r=".6"/>
        <circle class="cls-17" cx="963.8" cy="387.8" r=".6"/>
        <ellipse class="cls-7" cx="962.3" cy="388.5" rx="2" ry="2.9"/>
      </g>
      <g>
        <rect class="cls-7" x="957.6" y="403.2" width="6.7" height="9" transform="translate(1921.9 815.5) rotate(180)"/>
        <circle class="cls-17" cx="963.6" cy="408.9" r=".6"/>
        <circle class="cls-17" cx="963.6" cy="407" r=".6"/>
        <ellipse class="cls-7" cx="962.1" cy="407.7" rx="2" ry="2.9"/>
      </g>
      <path class="cls-10" d="M809.1,341c0-10.8,7.7-9.8,7.7-9.8v8.4h1.7"/>
      <path class="cls-10" d="M818.1,403.8h9.5s.4-8.1-8.5-8.1"/>
      <path class="cls-10" d="M808.9,408.1c0,8.9,8.1,8.5,8.1,8.5v-8.4s1.8,0,1.8,0"/>
      <polyline class="cls-10" points="923.2 417.6 818.6 417.6 818.6 403.8"/>
      <path class="cls-10" d="M931.4,418.1v-10.7s-8.1-.4-8.1,8.5v2.1"/>
      <g>
        <rect class="cls-10" x="885.8" y="391" width="27.4" height="7.1"/>
        <line class="cls-10" x1="903.6" y1="391.5" x2="903.6" y2="398.1"/>
        <line class="cls-10" x1="894.5" y1="391" x2="894.5" y2="398.1"/>
      </g>
      <g>
        <rect class="cls-10" x="885.3" y="348.4" width="26.1" height="7.1"/>
        <line class="cls-10" x1="902.3" y1="348.9" x2="902.3" y2="355.6"/>
        <line class="cls-10" x1="893.6" y1="348.4" x2="893.6" y2="355.6"/>
      </g>
      <line class="cls-10" x1="875.9" y1="412.7" x2="875.9" y2="372.3"/>
      <line class="cls-10" x1="872.4" y1="415.9" x2="872.4" y2="372.3"/>
      <line class="cls-10" x1="875.9" y1="381.6" x2="869.2" y2="381.6"/>
      <line class="cls-10" x1="872.4" y1="379.7" x2="869.2" y2="379.7"/>
      <line class="cls-10" x1="875.9" y1="389.2" x2="869.2" y2="389.2"/>
      <line class="cls-10" x1="875.9" y1="406.2" x2="872.4" y2="406.2"/>
      <polyline class="cls-10" points="869.2 412.7 889 412.7 897.3 412.7 897.3 415.9"/>
      <line class="cls-10" x1="889" y1="415.5" x2="889" y2="412.7"/>
      <line class="cls-10" x1="880.7" y1="412.7" x2="880.7" y2="415.9"/>
      <line class="cls-10" x1="874.2" y1="370.9" x2="874.2" y2="331.8"/>
      <line class="cls-10" x1="871.5" y1="375.4" x2="871.5" y2="331.8"/>
      <line class="cls-10" x1="874.5" y1="341" x2="869.2" y2="341"/>
      <polyline class="cls-10" points="869.2 337.8 907.6 337.8 907.6 331.6"/>
      <line class="cls-10" x1="874.5" y1="348.6" x2="869.2" y2="348.6"/>
      <polyline class="cls-10" points="871.2 366.2 907.6 366.2 919.2 366.2 919.2 370.4"/>
      <line class="cls-10" x1="896.4" y1="331.6" x2="896.4" y2="337.8"/>
      <line class="cls-10" x1="885.3" y1="331.4" x2="885.3" y2="337.5"/>
      <line class="cls-10" x1="907.3" y1="370.4" x2="907.3" y2="366.7"/>
      <line class="cls-10" x1="896.4" y1="366.4" x2="896.4" y2="370.4"/>
      <line class="cls-10" x1="885.3" y1="366.4" x2="885.3" y2="370.1"/>
      <polygon class="cls-10" points="851.4 391 837.7 391 837.7 373.3 844.5 373.3 851.4 373.3 851.4 391"/>
      <line class="cls-10" x1="845" y1="391" x2="845" y2="373.3"/>
      <line class="cls-10" x1="837.7" y1="382.6" x2="851.4" y2="382.6"/>
      <polygon class="cls-10" points="869.2 415.9 861.3 415.9 861.3 373.7 869.2 373.7 869.2 385 869.2 415.9"/>
      <line class="cls-10" x1="860.9" y1="384.6" x2="869.2" y2="384.6"/>
      <line class="cls-10" x1="861.3" y1="398.9" x2="869.2" y2="398.9"/>
      <line class="cls-7" x1="1253" y1="332" x2="1253" y2="417.3"/>
      <path class="cls-10" d="M699.6,252.6v-8.4s-8.1-.4-8.1,8.5"/>
      <path class="cls-10" d="M698.7,233.1l-4.4-7.2s-3.7,2.1-4,6.1"/>
      <line class="cls-10" x1="710.4" y1="333.6" x2="710.4" y2="415.9"/>
      <line class="cls-10" x1="703.1" y1="349" x2="710.4" y2="349"/>
      <line class="cls-10" x1="703.1" y1="357.4" x2="710.4" y2="357.4"/>
      <line class="cls-10" x1="703.1" y1="361.6" x2="710.4" y2="361.6"/>
      <line class="cls-10" x1="703.1" y1="365.8" x2="710.4" y2="365.8"/>
      <line class="cls-10" x1="703.1" y1="369.7" x2="710.4" y2="369.7"/>
      <line class="cls-10" x1="703.1" y1="379.4" x2="710.4" y2="379.4"/>
      <line class="cls-10" x1="703.1" y1="383.6" x2="710.4" y2="383.6"/>
      <line class="cls-10" x1="703.1" y1="387.8" x2="710.4" y2="387.8"/>
      <line class="cls-10" x1="703.1" y1="391.7" x2="710.4" y2="391.7"/>
      <line class="cls-10" x1="703.1" y1="400.1" x2="710.4" y2="400.1"/>
      <polyline class="cls-10" points="710.4 408.8 714.6 408.8 801.1 408.8 801.1 415.9"/>
      <line class="cls-10" x1="714.6" y1="415.9" x2="714.6" y2="408.8"/>
      <line class="cls-10" x1="723.9" y1="415.9" x2="723.9" y2="408.8"/>
      <g>
        <rect class="cls-7" x="716.4" y="408.9" width="4.8" height="4.8"/>
        <rect class="cls-17" x="718.5" y="412.2" width=".7" height="1.8"/>
        <circle class="cls-17" cx="717.8" cy="413.3" r=".5"/>
        <circle class="cls-17" cx="720" cy="413.3" r=".5"/>
      </g>
      <line class="cls-10" x1="738.6" y1="415.9" x2="738.6" y2="408.8"/>
      <line class="cls-10" x1="748" y1="415.9" x2="748" y2="408.8"/>
      <g>
        <rect class="cls-7" x="740.5" y="408.9" width="4.8" height="4.8"/>
        <rect class="cls-17" x="742.5" y="412.2" width=".7" height="1.8"/>
        <circle class="cls-17" cx="741.8" cy="413.3" r=".5"/>
        <circle class="cls-17" cx="744.1" cy="413.3" r=".5"/>
      </g>
      <line class="cls-10" x1="764.6" y1="415.9" x2="764.6" y2="408.8"/>
      <line class="cls-10" x1="773.9" y1="415.9" x2="773.9" y2="408.8"/>
      <g>
        <rect class="cls-7" x="766.4" y="408.9" width="4.8" height="4.8"/>
        <rect class="cls-17" x="768.5" y="412.2" width=".7" height="1.8"/>
        <circle class="cls-17" cx="767.8" cy="413.3" r=".5"/>
        <circle class="cls-17" cx="770" cy="413.3" r=".5"/>
      </g>
      <line class="cls-10" x1="788.9" y1="415.9" x2="788.9" y2="408.8"/>
      <line class="cls-10" x1="798.2" y1="415.9" x2="798.2" y2="408.8"/>
      <g>
        <rect class="cls-7" x="790.7" y="408.9" width="4.8" height="4.8"/>
        <rect class="cls-17" x="792.8" y="412.2" width=".7" height="1.8"/>
        <circle class="cls-17" cx="792.1" cy="413.3" r=".5"/>
        <circle class="cls-17" cx="794.3" cy="413.3" r=".5"/>
      </g>
      <line class="cls-10" x1="797" y1="332.9" x2="797" y2="340"/>
      <line class="cls-10" x1="787.7" y1="332.9" x2="787.7" y2="340"/>
      <g>
        <rect class="cls-7" x="790.3" y="335.1" width="4.8" height="4.8" transform="translate(1585.5 675) rotate(180)"/>
        <rect class="cls-17" x="792.4" y="334.8" width=".7" height="1.8" transform="translate(1585.5 671.5) rotate(180)"/>
        <circle class="cls-17" cx="793.8" cy="335.5" r=".5"/>
        <circle class="cls-17" cx="791.6" cy="335.5" r=".5"/>
      </g>
      <line class="cls-10" x1="772.9" y1="332.9" x2="772.9" y2="340"/>
      <line class="cls-10" x1="763.6" y1="332.9" x2="763.6" y2="340"/>
      <g>
        <rect class="cls-7" x="766.3" y="335.1" width="4.8" height="4.8" transform="translate(1537.4 675) rotate(180)"/>
        <rect class="cls-17" x="768.3" y="334.8" width=".7" height="1.8" transform="translate(1537.4 671.5) rotate(180)"/>
        <circle class="cls-17" cx="769.8" cy="335.5" r=".5"/>
        <circle class="cls-17" cx="767.5" cy="335.5" r=".5"/>
      </g>
      <line class="cls-10" x1="747" y1="332.9" x2="747" y2="340"/>
      <line class="cls-10" x1="737.7" y1="332.9" x2="737.7" y2="340"/>
      <g>
        <rect class="cls-7" x="740.3" y="335.1" width="4.8" height="4.8" transform="translate(1485.5 675) rotate(180)"/>
        <rect class="cls-17" x="742.4" y="334.8" width=".7" height="1.8" transform="translate(1485.5 671.5) rotate(180)"/>
        <circle class="cls-17" cx="743.8" cy="335.5" r=".5"/>
        <circle class="cls-17" cx="741.6" cy="335.5" r=".5"/>
      </g>
      <line class="cls-10" x1="722.7" y1="332.9" x2="722.7" y2="340"/>
      <line class="cls-10" x1="713.4" y1="332.9" x2="713.4" y2="340"/>
      <g>
        <rect class="cls-7" x="716" y="335.1" width="4.8" height="4.8" transform="translate(1436.9 675) rotate(180)"/>
        <rect class="cls-17" x="718.1" y="334.8" width=".7" height="1.8" transform="translate(1436.9 671.5) rotate(180)"/>
        <circle class="cls-17" cx="719.5" cy="335.5" r=".5"/>
        <circle class="cls-17" cx="717.3" cy="335.5" r=".5"/>
      </g>
      <line class="cls-10" x1="735.4" y1="408.9" x2="735.4" y2="415.9"/>
      <line class="cls-10" x1="752.1" y1="408.9" x2="752.1" y2="415.9"/>
      <line class="cls-10" x1="760.7" y1="408.9" x2="760.7" y2="415.9"/>
      <line class="cls-10" x1="777.3" y1="408.9" x2="777.3" y2="415.9"/>
      <rect class="cls-17" x="801.2" y="407.7" width="8.2" height="1.6"/>
      <line class="cls-10" x1="734.8" y1="333.1" x2="734.8" y2="340.1"/>
      <line class="cls-10" x1="751.4" y1="333.1" x2="751.4" y2="340.1"/>
      <line class="cls-10" x1="760.1" y1="333.1" x2="760.1" y2="340.1"/>
      <line class="cls-10" x1="776.7" y1="333.1" x2="776.7" y2="340.1"/>
      <g>
        <rect class="cls-10" x="785.2" y="370.3" width="26.1" height="7.1" transform="translate(1172.1 -424.4) rotate(90)"/>
        <line class="cls-10" x1="801.3" y1="377.8" x2="794.6" y2="377.8"/>
        <line class="cls-10" x1="801.8" y1="369.2" x2="794.6" y2="369.2"/>
      </g>
      <polyline class="cls-10" points="818.6 396.2 818.6 331.4 830.6 331.4"/>
      <line class="cls-10" x1="818.6" y1="354.7" x2="869.2" y2="354.7"/>
      <line class="cls-10" x1="827.1" y1="362.4" x2="868.6" y2="362.4"/>
      <line class="cls-10" x1="859.8" y1="355" x2="859.8" y2="362.4"/>
      <line class="cls-10" x1="851.4" y1="354.7" x2="851.4" y2="362"/>
      <g>
        <rect class="cls-7" x="837.4" y="357.3" width="4.8" height="4.8" transform="translate(1679.7 719.5) rotate(180)"/>
        <rect class="cls-17" x="839.5" y="357.1" width=".7" height="1.8" transform="translate(1679.7 716) rotate(180)"/>
        <circle class="cls-17" cx="840.9" cy="357.8" r=".5"/>
        <circle class="cls-17" cx="838.7" cy="357.8" r=".5"/>
      </g>
      <line class="cls-10" x1="842.3" y1="358.7" x2="869.2" y2="358.7"/>
      <polyline class="cls-10" points="837.4 358.7 822.8 358.7 822.8 389.2"/>
      <polyline class="cls-10" points="827.1 355 827.1 369.8 827.1 389.2 818.9 389.2"/>
      <line class="cls-10" x1="818.9" y1="369.8" x2="827.1" y2="369.8"/>
      <line class="cls-10" x1="818.6" y1="379.4" x2="826.8" y2="379.4"/>
      <line class="cls-10" x1="818.6" y1="381.6" x2="822.8" y2="381.6"/>
      <line class="cls-10" x1="856.7" y1="355" x2="856.7" y2="358.9"/>
      <line class="cls-10" x1="834.5" y1="355" x2="834.5" y2="358.7"/>
      <line class="cls-10" x1="846" y1="355" x2="846" y2="358.7"/>
      <polyline class="cls-10" points="1261.6 440.8 1261.6 539.8 827.6 539.8 814.3 557.8"/>
      <polyline class="cls-10" points="701.3 340.1 695.5 340.1 695.5 409.2 701.3 409.2"/>
      <g>
        <path class="cls-9" d="M595,282.4"/>
        <polyline class="cls-9" points="587.5 281.2 584.4 280.7 585.6 273.3 572.4 271.1 585.2 194.2 664.1 207.5 648.7 300.2 600.4 292.1 601.8 283.6"/>
        <rect class="cls-9" x="600.8" y="287.4" width="39.3" height="7.8" transform="translate(56.2 -97.9) rotate(9.4)"/>
        <rect class="cls-9" x="639.9" y="290.3" width="9" height="8.3" transform="translate(57 -101.7) rotate(9.4)"/>
        <line class="cls-9" x1="617.9" y1="287.1" x2="616.6" y2="294.6"/>
        <line class="cls-9" x1="610" y1="285.8" x2="608.7" y2="293.3"/>
        <line class="cls-9" x1="625.4" y1="288.4" x2="624.1" y2="295.8"/>
        <line class="cls-9" x1="631.4" y1="289.4" x2="630.2" y2="296.8"/>
        <line class="cls-9" x1="615.6" y1="290.2" x2="639.9" y2="294.2"/>
        <line class="cls-9" x1="601.1" y1="287.8" x2="611.2" y2="289.5"/>
        <polygon class="cls-17" points="587.3 282.5 584.2 282 583.7 281.9 584 280.1 587.5 280.7 587.3 282.5"/>
        <polygon class="cls-17" points="602.1 284.9 595.4 283.8 594.3 283.6 594.6 281.9 602.4 283.2 602.1 284.9"/>
        <path class="cls-9" d="M586.9,281.7l-1.4,8.3s7.8,2.9,9.5-7.5"/>
        <rect class="cls-10" x="611.2" y="286.2" width="4.5" height="5.1" transform="translate(55.7 -96.8) rotate(9.4)"/>
      </g>
      <g>
        <path class="cls-10" d="M545.4,274.1"/>
        <polyline class="cls-10" points="553 275.3 556.1 275.9 557.3 268.5 570.5 270.7 583.3 193.9 504.4 180.6 488.9 273.5 537.2 281.5 538.7 273"/>
        <rect class="cls-9" x="498.9" y="270.3" width="39.3" height="7.8" transform="translate(985 629.8) rotate(-170.6)"/>
        <rect class="cls-10" x="490.3" y="265.3" width="9" height="8.3" transform="translate(938.7 616.4) rotate(-170.6)"/>
        <line class="cls-9" x1="522.3" y1="271.1" x2="521" y2="278.6"/>
        <line class="cls-9" x1="530.2" y1="272.5" x2="529" y2="279.9"/>
        <line class="cls-9" x1="514.8" y1="269.9" x2="513.6" y2="277.3"/>
        <line class="cls-9" x1="508.7" y1="268.9" x2="507.5" y2="276.3"/>
        <line class="cls-9" x1="523.5" y1="274.8" x2="499.2" y2="270.7"/>
        <line class="cls-9" x1="538" y1="277.2" x2="527.7" y2="275.5"/>
        <rect class="cls-8" x="523.6" y="271.5" width="4.5" height="5.1" transform="translate(999.7 630.7) rotate(-170.6)"/>
        <polygon class="cls-17" points="552.8 276.6 555.9 277.2 556.4 277.2 556.6 275.5 553.1 274.9 552.8 276.6"/>
        <polygon class="cls-17" points="537.9 274.2 544.6 275.3 545.8 275.5 546 273.7 538.2 272.4 537.9 274.2"/>
        <path class="cls-10" d="M553.4,276.1l-1.4,8.3s-8.4.2-6.6-10.1"/>
      </g>
      <path class="cls-7" d="M473.7,205.4c.3,0,.7.2,1,.2,2.7.4,5-.2,5.2-1.4s-1.8-2.6-4.5-3-.7,0-1-.1l-.7,4.4Z"/>
      <path class="cls-7" d="M475.1,197.3c.3,0,.7.2,1,.2,2.7.4,5-.2,5.2-1.4s-1.8-2.6-4.5-3-.7,0-1-.1l-.7,4.4Z"/>
      <path class="cls-7" d="M472.5,212.7c.3,0,.7.2,1,.2,2.7.4,5-.2,5.2-1.4s-1.8-2.6-4.5-3-.7,0-1-.1l-.7,4.4Z"/>
      <path class="cls-7" d="M476.4,189.6c.3,0,.7.2,1,.2,2.7.4,5-.2,5.2-1.4s-1.8-2.6-4.5-3-.7,0-1-.1l-.7,4.4Z"/>
      <path class="cls-7" d="M488.3,199.9c-5.3-1.8-4.9-5.9-4.9-5.9l5.6.9.3-1.6-14.1-2.4"/>
      <path class="cls-7" d="M465.3,191.5c-.3,0-.7-.2-1-.2-2.7-.4-5,.2-5.2,1.4s1.8,2.6,4.5,3,.7,0,1,.1l.7-4.4Z"/>
      <path class="cls-7" d="M466.6,183.8c-.3,0-.7-.2-1-.2-2.7-.4-5,.2-5.2,1.4s1.8,2.6,4.5,3,.7,0,1,.1l.7-4.4Z"/>
      <path class="cls-7" d="M487.9,200.8l-.3,1.6-5.6-.9s-.4,4.1,4.9,5.9"/>
      <path class="cls-7" d="M486.6,208.9l-.3,1.6-5.6-.9s-.4,4.1,4.9,5.9"/>
      <path class="cls-7" d="M492.1,178.5l-.4,2.5,8,1.3s-1.5,8.2-9.6,6.7"/>
      <rect class="cls-17" x="486.6" y="191.1" width="6.1" height="1.1" transform="translate(759.3 -259.8) rotate(99.5)"/>
      <rect class="cls-17" x="486.4" y="200.6" width="3.4" height="1.1" transform="translate(766.9 -247.1) rotate(99.5)"/>
      <rect class="cls-17" x="484.8" y="208.3" width="4" height="1.1" transform="translate(773 -236.8) rotate(99.5)"/>
      <rect class="cls-17" x="484.7" y="215.4" width="1.8" height="1.1" transform="translate(778.6 -227.5) rotate(99.5)"/>
      <line class="cls-7" x1="488.1" y1="201.2" x2="473.7" y2="198.8"/>
      <line class="cls-7" x1="486.8" y1="208.9" x2="472.4" y2="206.5"/>
      <rect class="cls-17" x="454.8" y="194.5" width="39" height="1.5" transform="translate(745 -240.4) rotate(99.5)"/>
      <rect class="cls-17" x="471.8" y="251.5" width="16.6" height="2" transform="translate(808.2 -179.5) rotate(99.5)"/>
      <rect class="cls-17" x="431.8" y="244.8" width="16.6" height="2" transform="translate(755 -147.8) rotate(99.5)"/>
      <rect class="cls-17" x="446.5" y="193.1" width="39" height="1.5" transform="translate(734.1 -233.9) rotate(99.5)"/>
      <rect class="cls-17" x="436.2" y="225.5" width="25.3" height="1.5" transform="translate(746 -179.2) rotate(99.5)"/>
      <rect class="cls-17" x="471.8" y="236.3" width="14" height="1.5" transform="translate(791.6 -196.2) rotate(99.5)"/>
      <rect class="cls-7" x="460.2" y="199.7" width="4.9" height="2.9" rx="1.4" ry="1.4" transform="translate(737.2 -222) rotate(99.5)"/>
      <rect class="cls-7" x="458.9" y="207.4" width="4.9" height="2.9" rx="1.4" ry="1.4" transform="translate(743.3 -211.8) rotate(99.5)"/>
      <line class="cls-7" x1="463.7" y1="205" x2="456.5" y2="203.9"/>
      <line class="cls-7" x1="457.9" y1="202.5" x2="457.4" y2="205.6"/>
      <rect class="cls-2" x="460.2" y="222.1" width="2.3" height="40.8" transform="translate(776.6 -172.5) rotate(99.5)"/>
      <rect class="cls-2" x="466.6" y="195" width="2.3" height="40.8" transform="translate(757.3 -210.4) rotate(99.5)"/>
      <path class="cls-2" d="M454.4,172.1l-.5,3-8.5-1.4s-1.4,7.9,7.2,9.3l-.9,5.2h.5"/>
      <path class="cls-7" d="M465.2,197.3l-14.7-2.5.2-1h.7c5.6.2,6.6-3.8,6.6-3.8l-5.6-.9.3-1.6,14.1,2.4"/>
      <rect class="cls-7" x="456.9" y="241.3" width="6.7" height="12.4" transform="translate(780.2 -165.7) rotate(99.5)"/>
      <rect class="cls-7" x="458" y="242.4" width="4.8" height="8.2" rx="2.4" ry="2.4" transform="translate(779.4 -167) rotate(99.5)"/>
      <circle class="cls-17" cx="461.7" cy="245.1" r=".6"/>
      <circle class="cls-17" cx="459.7" cy="244.7" r=".6"/>
      <line class="cls-10" x1="448" y1="234.7" x2="478.1" y2="239.8"/>
      <path class="cls-10" d="M479.3,229.7l8.3,1.4s1.7-8-7-9.4l.5-3"/>
      <polyline class="cls-10" points="358.6 195.7 291.4 184.2 276.5 210.9"/>
      <path class="cls-10" d="M358.3,195.7"/>
      <polyline class="cls-10" points="373.8 198.2 389.1 200.8 395.7 159.1 668 205 651.8 304.9 648.2 304.2"/>
      <polyline class="cls-10" points="391.4 204.1 398 162.4 443.1 170.2"/>
      <polyline class="cls-10" points="471.7 267.7 486.9 270.4 502 180.2 443.1 170.2 428.7 259.6 444.7 262.4"/>
      <line class="cls-10" x1="394.3" y1="185.8" x2="415.1" y2="189.2"/>
      <line class="cls-10" x1="394.3" y1="188.7" x2="415.1" y2="192.1"/>
      <line class="cls-10" x1="393.3" y1="191" x2="414.1" y2="194.4"/>
      <line class="cls-10" x1="392.9" y1="193.3" x2="413.7" y2="196.6"/>
      <line class="cls-10" x1="392.9" y1="196" x2="413.7" y2="199.4"/>
      <line class="cls-10" x1="392.1" y1="198.3" x2="413" y2="201.6"/>
      <line class="cls-10" x1="391.4" y1="200.8" x2="412.2" y2="204.2"/>
      <line class="cls-10" x1="391.4" y1="203.4" x2="412.2" y2="206.7"/>
      <line class="cls-10" x1="390.6" y1="205.7" x2="411.4" y2="209.1"/>
      <line class="cls-10" x1="390.1" y1="208.3" x2="410.9" y2="211.7"/>
      <line class="cls-10" x1="389.4" y1="210.9" x2="410.3" y2="214.3"/>
      <line class="cls-10" x1="389.1" y1="213.1" x2="409.9" y2="216.4"/>
      <line class="cls-10" x1="388.9" y1="216.1" x2="409.7" y2="219.5"/>
      <rect class="cls-17" x="411.8" y="187" width="2.3" height="36.1" transform="translate(39.4 -65.2) rotate(9.5)"/>
      <line class="cls-10" x1="404.7" y1="184.2" x2="398.4" y2="220.3"/>
      <line class="cls-10" x1="391.6" y1="202.5" x2="401.6" y2="199.8"/>
      <line class="cls-10" x1="401.6" y1="204.7" x2="412.5" y2="202"/>
      <line class="cls-10" x1="416" y1="189.4" x2="439" y2="193.6"/>
      <line class="cls-10" x1="409.9" y1="222" x2="422.6" y2="224.4"/>
      <path class="cls-10" d="M422.1,224.1c-1.5,8.7,6.6,9.7,6.6,9.7l1.4-8.3,4,.6"/>
      <polyline class="cls-6" points="664.3 227.6 685.6 231.1 685.6 283.4"/>
      <polyline class="cls-6" points="654.7 287.8 685.6 293.3 685.6 290.5"/>
      <path class="cls-10" d="M685.4,291l-6.1-5.5s2.5-3.8,7.1-1.7"/>
      <line class="cls-10" x1="691.7" y1="252.2" x2="686.5" y2="252.2"/>
      <line class="cls-10" x1="690.7" y1="232" x2="686.5" y2="232"/>
      <line class="cls-10" x1="702.6" y1="252.2" x2="699.1" y2="252.2"/>
      <polyline class="cls-10" points="565.7 285.2 556.8 283.6 559.1 270.9 583.3 275.1 580.9 287.9 572.7 286.5"/>
      <path class="cls-9" d="M565.1,285.5l-1.4,8.3s7.8,2.9,9.5-7.5"/>
      <polyline class="cls-10" points="370.4 219.2 385.8 221.8 389 201.3"/>
      <polyline class="cls-10" points="344.7 193.3 341.9 214.3 355.2 216.6"/>
      <path class="cls-10" d="M374.3,198l1.6-8.3s-7.7-3.1-9.7,7.2"/>
      <path class="cls-10" d="M358.1,195.3l1.2-8.4s8.3-.5,6.8,10"/>
      <path class="cls-10" d="M371,218.8l1.6-8.3s-7.7-3.1-9.7,7.2"/>
      <path class="cls-10" d="M354.8,216.1l1.2-8.4s8.3-.5,6.8,10"/>
      <line class="cls-9" x1="644.8" y1="327.9" x2="651.2" y2="329.1"/>
      <line class="cls-9" x1="557.6" y1="312.5" x2="628.6" y2="325.6"/>
      <line class="cls-9" x1="523.2" y1="306.5" x2="550.8" y2="311.3"/>
      <line class="cls-9" x1="510.4" y1="304.2" x2="515.9" y2="305.2"/>
      <path class="cls-9" d="M448.4,293.3"/>
      <path class="cls-9" d="M601.7,407.3"/>
      <path class="cls-9" d="M595.2,402.7"/>
      <line class="cls-9" x1="545.5" y1="367.6" x2="595.2" y2="402.7"/>
      <line class="cls-9" x1="523.4" y1="351.9" x2="539.6" y2="363.7"/>
      <polyline class="cls-9" points="517 347.4 467.1 312.1 468.4 310.4"/>
      <line class="cls-9" x1="489.8" y1="300.6" x2="487.5" y2="326.6"/>
      <line class="cls-9" x1="513" y1="304.8" x2="509.8" y2="342.3"/>
      <line class="cls-9" x1="547.1" y1="310.7" x2="539.5" y2="362.8"/>
      <line class="cls-9" x1="582.2" y1="316.7" x2="571.4" y2="385.8"/>
      <line class="cls-10" x1="645.3" y1="327.8" x2="633.1" y2="412.9"/>
      <line class="cls-9" x1="607.9" y1="388.2" x2="605.5" y2="408.7"/>
      <line class="cls-9" x1="593.2" y1="385.1" x2="592.2" y2="400.6"/>
      <path class="cls-10" d="M650.7,329l-12.2,84.8-35.6-5.7-1.1-1.3-5,8.5s-4.4-1.7-4.5-6.3.9-4.1,2.9-7.1"/>
      <line class="cls-9" x1="572" y1="381.9" x2="636" y2="392.8"/>
      <line class="cls-9" x1="572" y1="383.1" x2="592.8" y2="391.7"/>
      <line class="cls-9" x1="510.4" y1="335.5" x2="542.7" y2="340.4"/>
      <line class="cls-9" x1="543.3" y1="338.6" x2="578" y2="343.8"/>
      <polygon class="cls-10" points="580.8 325.2 589.7 326.7 591.1 318.9 582.3 317.2 580.8 325.2"/>
      <g>
        <polyline class="cls-10" points="628.1 325.5 591.1 319.1 589.9 326.8 626.9 333.1 628.1 325.5"/>
        <line class="cls-10" x1="612.6" y1="323.1" x2="611.4" y2="330.5"/>
        <line class="cls-10" x1="620.1" y1="324.4" x2="619" y2="331.8"/>
        <line class="cls-10" x1="605.4" y1="321.8" x2="604.3" y2="329.2"/>
        <line class="cls-10" x1="599.6" y1="320.8" x2="598.5" y2="328.2"/>
        <line class="cls-10" x1="614.1" y1="326.7" x2="590.5" y2="322.7"/>
        <line class="cls-10" x1="627.6" y1="329.1" x2="618" y2="327.4"/>
        <polyline class="cls-10" points="618 327.4 618.6 323.9 614.3 323.1 613.5 328.1 617.8 328.8 618 327.4"/>
      </g>
      <polyline class="cls-9" points="630.4 391.8 629.7 397 627.7 412"/>
      <line class="cls-9" x1="635.2" y1="397.9" x2="607.6" y2="393.7"/>
      <line class="cls-9" x1="635.2" y1="400.4" x2="629.7" y2="399.6"/>
      <line class="cls-9" x1="633.6" y1="406.3" x2="628.1" y2="405.5"/>
      <line class="cls-9" x1="633.6" y1="409.8" x2="628.1" y2="409"/>
      <path class="cls-9" d="M550.3,311.2l-1.7,10.1s4.5,1.3,7.4-2.2,1.8-3.4,2.1-7"/>
      <path class="cls-9" d="M517.4,347.1l-6.5,7.5s3.1,3.6,7.4,2.2,3.6-2.1,5.8-5"/>
      <path class="cls-9" d="M539,363.6l6.6-9.1s4.2,2.2,3.8,6.7-1.5,4.2-3.8,7"/>
      <path class="cls-9" d="M515.4,305.6l1.4-10s4.7-.1,6.5,4,.8,3.9.1,7.4"/>
      <path class="cls-9" d="M469.1,310.4l-8.4-5.5s1.9-4.3,6.5-4.2,4,1.1,6.8,3.1"/>
      <path class="cls-9" d="M510.9,304.6l-1.2,10.2s-4.7.2-6.6-3.9-.8-4.9-.1-8.5"/>
      <polyline class="cls-9" points="492 329.7 494.4 326.6 505.9 334.4 503.3 337.7"/>
      <line class="cls-9" x1="488.1" y1="324.3" x2="510.9" y2="325.4"/>
      <line class="cls-9" x1="505.9" y1="334.4" x2="510.9" y2="329.6"/>
      <path class="cls-7" d="M488.3,321.7c.3,0,.7.1,1,.1,2.7.2,5-.6,5.1-1.8s-2-2.4-4.7-2.7-.7,0-1.1,0l-.4,4.4Z"/>
      <g>
        <rect class="cls-7" x="489.2" y="303.5" width="6.7" height="9" transform="translate(28.4 -41.4) rotate(5)"/>
        <circle class="cls-17" cx="490.1" cy="306.7" r=".6"/>
        <circle class="cls-17" cx="489.9" cy="308.5" r=".6"/>
        <ellipse class="cls-7" cx="491.5" cy="307.9" rx="2.9" ry="2" transform="translate(142.3 771) rotate(-85)"/>
      </g>
      <path class="cls-9" d="M473.5,303.5c.6-1,1.9-3.4,2.8-4.3s2.1-.7,3.3-.5c6,1.1,12.1,2.2,18.1,3.2l5.6,1"/>
      <line class="cls-10" x1="640.2" y1="335.7" x2="644.1" y2="336.4"/>
      <line class="cls-10" x1="626.9" y1="333.1" x2="632.9" y2="334.2"/>
      <path class="cls-9" d="M640.6,336.1l1.7-11.1s-4.5-1.4-7.4,2.1-1.9,3.9-2.2,7.5"/>
      <path class="cls-10" d="M355.5,266.7c103.9,73.2,222,156.3,271.6,191.2"/>
      <path class="cls-10" d="M353.9,268.2c40.2,28.3,82.6,58.5,122,86.2,63.9,44.9,120.5,84.8,149.6,105.3"/>
      <path class="cls-10" d="M339.6,258.8c-14.1-9.9-28.3-20.2-41.6-29.6l1.3-2.1c13.4,9.4,27.3,19.2,41.6,29.3"/>
      <path class="cls-10" d="M613.2,469c2.4,1.3,3.9,2.1,5.8,3.2"/>
      <path class="cls-10" d="M554.2,436.8c16.7,9.1,33.5,18.4,45.5,24.9"/>
      <path class="cls-10" d="M504.9,409.8c12.3,6.7,24.1,13.2,35.2,19.3"/>
      <path class="cls-10" d="M397.9,351.2c31.9,17.5,63.4,34.7,92.5,50.6"/>
      <line class="cls-10" x1="196.7" y1="241" x2="225.3" y2="256.7"/>
      <path class="cls-10" d="M466.7,564.3c34,17.9,61.4,32.5,79.8,42.2"/>
      <path class="cls-10" d="M200.1,423.3c24.3,12.9,50.1,26.6,75.8,40.2"/>
      <path class="cls-10" d="M180.9,413.2c3.9,2.1,7.9,4.2,11.9,6.3"/>
      <path class="cls-10" d="M170.2,407.5c-38.9-20.6-71.2-38.5-97.9-52.6l1.3-2.4,98.3,52.2"/>
      <path class="cls-10" d="M384.8,546.4l5.1,2.7-5.9,10.4-11.5-6.2,5.3-10.3c-35.1-18.7-58.1-31-94.4-50.5l-5.9,10.3-12.3-7,5.6-10.3,5,2.9s3.4-6,5.5-7.2c3.9-2.3,7.7.7,7.7.7l-5.1,8.6"/>
      <path class="cls-10" d="M184.1,438.4c2.1,1.2,6.2,3.4,6.2,3.4"/>
      <polyline class="cls-10" points="82.3 488.8 126.5 407.4 130.5 409.5"/>
      <path class="cls-10" d="M576.6,648.3s-37.1-19.5-92.4-48.7l-5.4,9.9-13.3-6.8,5.3-10.2,6.1,3.2"/>
      <path class="cls-10" d="M82.3,488.3c164.2,86.9,409.7,217.2,409.7,217.2l43-79"/>
      <line class="cls-9" x1="626.7" y1="457.6" x2="546" y2="606.3"/>
      <polygon class="cls-10" points="440.4 550.6 459.6 560.6 461.4 557.5 442.1 547.3 440.4 550.6"/>
      <path class="cls-10" d="M623.5,455l-79.3,146.1-75.8-40-1.8,3.5s-3.8,7-11.6,3-3.3-11.3-3.3-11.3"/>
      <line class="cls-9" x1="459.7" y1="385.1" x2="475.9" y2="354.5"/>
      <line class="cls-9" x1="597.4" y1="461" x2="604.8" y2="445.3"/>
      <polyline class="cls-10" points="441.2 377.7 452.5 357.1 399.1 321.6 386.6 345"/>
      <line class="cls-7" x1="394.1" y1="296.8" x2="364.7" y2="352.8"/>
      <line class="cls-10" x1="231.8" y1="370.2" x2="202.7" y2="424.8"/>
      <line class="cls-10" x1="252.6" y1="331" x2="235.5" y2="363.3"/>
      <line class="cls-10" x1="264.6" y1="308.6" x2="258.4" y2="320.3"/>
      <line class="cls-10" x1="304.7" y1="234.2" x2="270.1" y2="298.9"/>
      <line class="cls-10" x1="203.2" y1="335.1" x2="166.3" y2="401.9"/>
      <line class="cls-10" x1="265.1" y1="222.9" x2="215.5" y2="312.9"/>
      <line class="cls-10" x1="240" y1="355.1" x2="158.5" y2="311.7"/>
      <line class="cls-10" x1="127.8" y1="369.2" x2="121.1" y2="381.6"/>
      <line class="cls-10" x1="145.9" y1="335.6" x2="132.1" y2="361.3"/>
      <line class="cls-10" x1="180.7" y1="271" x2="153.9" y2="320.7"/>
      <line class="cls-10" x1="229.3" y1="180.8" x2="185.6" y2="261.9"/>
      <line class="cls-10" x1="206" y1="289" x2="184.5" y2="325.5"/>
      <path class="cls-10" d="M205.7,289.3"/>
      <line class="cls-10" x1="199.3" y1="267.4" x2="186.4" y2="260.5"/>
      <polyline class="cls-10" points="224.8 256.4 213.9 275.2 205.7 270.8"/>
      <path class="cls-10" d="M191.1,209.8l-32.4-17.2,25.4-46.7c19.6,13.9,56.6,40,101.6,71.7l-1.4,2c-44.1-31.1-80.9-57-101.6-71.7"/>
      <line class="cls-10" x1="187.5" y1="279.5" x2="178.7" y2="274.8"/>
      <line class="cls-10" x1="205.7" y1="289.3" x2="193.4" y2="282.7"/>
      <line class="cls-10" x1="214.8" y1="313" x2="251.6" y2="333.4"/>
      <line class="cls-10" x1="507.1" y1="450.1" x2="450.9" y2="556"/>
      <line class="cls-10" x1="523.1" y1="419.8" x2="507.1" y2="450.1"/>
      <line class="cls-7" x1="352.3" y1="360.6" x2="322.2" y2="415.9"/>
      <line class="cls-7" x1="361.9" y1="351" x2="319.8" y2="430.1"/>
      <path class="cls-7" d="M316.2,425.6s-1.3-4.2-1.5-5.8,1.2-3.8,1.2-3.8c0,0,31.9-60.9,33.3-62.8s5.7-1.6,5.7-1.6l6.5.5"/>
      <path class="cls-7" d="M362.5,341.6c-6.8,1.1-14.7,1.7-18.4,8.6s-4,7.6-6,11.4c-6.5,12.2-13,24.4-19.5,36.6-2.3,4.3-4.6,8.7-7,13-2.6,4.9-4.2,8.4-2.9,14s2.5,7.8,3.7,11.1"/>
      <rect class="cls-7" x="365.6" y="320.6" width="7.2" height="32" transform="translate(196.6 -132.2) rotate(27.4)"/>
      <rect class="cls-7" x="367.2" y="322.6" width="3.6" height="28.2" transform="translate(196.7 -132.2) rotate(27.4)"/>
      <polygon class="cls-7" points="379.8 324 373.4 320.7 388 292.6 394.1 296.8 379.8 324"/>
      <polygon class="cls-7" points="379 321.6 375.7 319.9 388.4 295.5 391.4 297.6 379 321.6"/>
      <rect class="cls-17" x="512.8" y="418.9" width="13.4" height="12.3" transform="translate(265.7 -196.4) rotate(28.5)"/>
      <rect class="cls-10" x="524.2" y="425.2" width="13.4" height="13.4" transform="translate(270.3 -201) rotate(28.5)"/>
      <rect class="cls-10" x="500.7" y="412.4" width="13.4" height="13.4" transform="translate(261.4 -191.3) rotate(28.5)"/>
      <polyline class="cls-10" points="398.7 369.8 422.6 383.6 418.1 392 408 394.4 403.3 391.3 412.1 377.5"/>
      <polyline class="cls-10" points="399.4 368.4 423.8 382.4 426.1 378.5 424 377.4 421.9 381"/>
      <polyline class="cls-10" points="441.6 378 396.6 353.4 397.7 351.4"/>
      <line class="cls-10" x1="408.3" y1="360" x2="402.8" y2="370.3"/>
      <line class="cls-10" x1="410.6" y1="361.4" x2="405.1" y2="371.7"/>
      <line class="cls-10" x1="413" y1="362.3" x2="407.5" y2="372.6"/>
      <line class="cls-10" x1="415.2" y1="363.7" x2="409.7" y2="374"/>
      <line class="cls-10" x1="417.3" y1="365.1" x2="411.9" y2="375.4"/>
      <line class="cls-10" x1="405.3" y1="371.4" x2="417.3" y2="365.1"/>
      <line class="cls-7" x1="405.3" y1="375.4" x2="354.1" y2="473.3"/>
      <path class="cls-10" d="M422.6,383.6s1.6.6,1.6,3.4-.6,6-.8,7-.2.6-.3.8c-3,5.7-39.5,74.7-44.4,84.1s-4.8,10-6.8,10.2-5.1,1-5.1,1l-2.6,5.1-1.6-.9,6.4-13.2-2.9-8.8-3.5-1.5-8.4,14.7-16.1-8.5,8.5-15.8"/>
      <path class="cls-7" d="M366,472.2s2.8,0,3.9-1.5c3.2-4.6,37.7-71.4,37.8-71.6.5-.8,1.9-3.4.3-4.7"/>
      <path class="cls-7" d="M367.7,477s4.6.4,5.6-1.3,39.6-75.3,39.6-75.3c0,0,1-2.1,1-4.5v-3"/>
      <rect class="cls-17" x="342.9" y="468.3" width="13.4" height="12.3" transform="translate(268.7 -109.3) rotate(28.5)"/>
      <line class="cls-10" x1="358.2" y1="478.4" x2="367.7" y2="483.5"/>
      <polyline class="cls-10" points="317.8 466.5 301 457.1 317.1 428 323.2 431.7 316.3 444.8 335.9 455.8 327.2 471.7 324.7 470.3"/>
      <line class="cls-10" x1="328.8" y1="468.8" x2="339.2" y2="474.8"/>
      <line class="cls-10" x1="330" y1="466.6" x2="340.4" y2="472.7"/>
      <line class="cls-10" x1="331.4" y1="464.7" x2="341.7" y2="470.7"/>
      <line class="cls-10" x1="332.6" y1="462.5" x2="343" y2="468.6"/>
      <line class="cls-10" x1="334" y1="459.7" x2="344.4" y2="465.8"/>
      <line class="cls-10" x1="335.2" y1="457.6" x2="345.6" y2="463.6"/>
      <line class="cls-10" x1="344.4" y1="465.8" x2="330" y2="466.6"/>
      <rect class="cls-10" x="318.3" y="415.4" width="3.6" height="12.9" transform="translate(230.4 -100) rotate(27.4)"/>
      <polyline class="cls-7" points="408.3 306.8 399.4 320.7 378.2 360.6"/>
      <line class="cls-7" x1="441.3" y1="330.1" x2="431.6" y2="343.2"/>
      <line class="cls-7" x1="454.2" y1="339.2" x2="450.5" y2="343.8"/>
      <path class="cls-9" d="M450.4,343.4c2.9,1.7,4.8,3.3,5.5,5,2,4.1-1.2,7.6-1.2,7.6l-8.5-5.5-1.4,1.6"/>
      <path class="cls-9" d="M397.7,351.5c1.8-2.9,2.7-5.1,2.6-7-.2-4.5-4.6-6.2-4.6-6.2l-5,8.8-4.2-2.1"/>
      <path class="cls-9" d="M294.2,469.4l1.1-2.3-8.8-5s1.7-4.4,6.2-4.6,3.7.4,6.5,2.2l1.7-2.6"/>
      <path class="cls-9" d="M326.4,471.2l-1.7-1-5,8.8s-4.4-1.7-4.6-6.2.4-3.7,2.2-6.5"/>
      <path class="cls-10" d="M447.7,554.1s-3.8,7-11.6,3-3.3-11.3-3.3-11.3l1.4-2.7-150.2-79.2-1.6,2.9c52.1,27.6,104.6,55.4,150.3,79.6"/>
      <line class="cls-10" x1="194.4" y1="416.7" x2="182.3" y2="410.3"/>
      <path class="cls-10" d="M290.7,471.4s-3.8,7-11.6,3-3.3-11.3-3.3-11.3l1.3-2.8-75.2-39.7"/>
      <path class="cls-10" d="M540.3,428.8l-4.8,8.7s3.7,2.9,7.7.7,3.1-2.8,4.7-6.1"/>
      <path class="cls-10" d="M554.7,436.7l-5,8.5s-4.4-1.7-4.5-6.3.9-4.1,2.9-7.1"/>
      <path class="cls-10" d="M613.3,469.7l5-8.6s-3.7-3-7.6-.8-2.9,2.6-4.6,5.9"/>
      <path class="cls-10" d="M599.1,461.8l4.6-9s4.4,1.6,4.7,6.1-.5,4.1-2.4,7.2"/>
      <line class="cls-7" x1="622" y1="481.4" x2="616" y2="477.9"/>
      <line class="cls-10" x1="614.8" y1="480" x2="620.8" y2="483.6"/>
      <line class="cls-10" x1="613.5" y1="482.3" x2="619.6" y2="485.8"/>
      <line class="cls-10" x1="612.3" y1="484.4" x2="618.4" y2="488"/>
      <line class="cls-10" x1="611.5" y1="486.7" x2="617.5" y2="490.2"/>
      <line class="cls-10" x1="610.3" y1="488.9" x2="616.3" y2="492.4"/>
      <path class="cls-10" d="M490.4,401.3l-4.8,8.7s3.7,2.9,7.7.7,3.1-2.8,4.7-6.1"/>
      <path class="cls-10" d="M504.8,409.2l-5,8.5s-4.4-1.7-4.5-6.3.9-4.1,2.9-7.1"/>
      <path class="cls-10" d="M454.7,373.3c1.7-3.2,2.9-4.9,4.6-5.9,4-2.2,7.6.8,7.6.8l-4.7,8.7,1.4.7"/>
      <path class="cls-10" d="M454.7,373.3c1.9-3.1,2.5-5.3,2.4-7.2-.2-4.5-4.7-6.1-4.7-6.1l-4.8,8.8-1.2-.7"/>
      <line class="cls-10" x1="400.1" y1="319.6" x2="386.6" y2="311.8"/>
      <line class="cls-10" x1="379.4" y1="357.1" x2="366" y2="350.6"/>
      <polyline class="cls-10" points="532 624.8 490.3 700 87.9 486.9 129.7 409.1 177.5 435 173.8 441.9 126 416.1"/>
      <line class="cls-10" x1="330.6" y1="517.9" x2="287.8" y2="597.5"/>
      <path class="cls-10" d="M414.1,664.7"/>
      <path class="cls-9" d="M520,618.6"/>
      <polyline class="cls-9" points="531.7 624.7 484.6 600 480.9 606.9 528 631.7"/>
      <line class="cls-9" x1="495.6" y1="614.3" x2="499.1" y2="607.6"/>
      <line class="cls-9" x1="488.5" y1="610.6" x2="492" y2="603.9"/>
      <line class="cls-9" x1="502.4" y1="617.9" x2="505.9" y2="611.2"/>
      <line class="cls-9" x1="507.8" y1="620.7" x2="511.3" y2="614"/>
      <line class="cls-9" x1="495.4" y1="610.4" x2="529.7" y2="628.5"/>
      <line class="cls-9" x1="482.6" y1="603.7" x2="491.6" y2="608.4"/>
      <rect class="cls-8" x="490.8" y="607.9" width="4.5" height="5.1" transform="translate(339.6 -159.1) rotate(27.6)"/>
      <line class="cls-9" x1="512.1" y1="622.8" x2="515.6" y2="616.1"/>
      <line class="cls-9" x1="521.8" y1="624.5" x2="523.9" y2="620.6"/>
      <line class="cls-10" x1="462.3" y1="595.2" x2="467.8" y2="598.3"/>
      <path class="cls-9" d="M318.6,511.6"/>
      <polyline class="cls-9" points="330.3 517.8 283.5 492.4 279.8 499.3 326.5 524.8"/>
      <line class="cls-9" x1="294.4" y1="506.9" x2="298" y2="500.3"/>
      <line class="cls-9" x1="287.3" y1="503.1" x2="290.9" y2="496.4"/>
      <line class="cls-9" x1="301" y1="510.5" x2="304.6" y2="503.9"/>
      <line class="cls-9" x1="306.4" y1="513.5" x2="310" y2="506.8"/>
      <line class="cls-9" x1="294.4" y1="503.1" x2="328.2" y2="521.6"/>
      <line class="cls-9" x1="281.5" y1="496.1" x2="290.9" y2="501.2"/>
      <rect class="cls-8" x="289.6" y="500.4" width="4.5" height="5.1" transform="translate(275.3 -78.3) rotate(28.5)"/>
      <line class="cls-9" x1="310.7" y1="515.6" x2="314.3" y2="509"/>
      <line class="cls-9" x1="320.3" y1="517.5" x2="322.5" y2="513.6"/>
      <polyline class="cls-9" points="330.7 518 377.5 543.4 373.8 550.2 327 525"/>
      <line class="cls-9" x1="359.5" y1="542.2" x2="363.1" y2="535.5"/>
      <line class="cls-9" x1="366.5" y1="546" x2="370.1" y2="539.4"/>
      <line class="cls-9" x1="352.8" y1="538.6" x2="356.4" y2="531.9"/>
      <line class="cls-9" x1="347.4" y1="535.6" x2="351" y2="529"/>
      <line class="cls-10" x1="362.7" y1="540.1" x2="328.7" y2="521.8"/>
      <line class="cls-10" x1="375.5" y1="547.1" x2="366.5" y2="542.2"/>
      <rect class="cls-8" x="361.8" y="539.6" width="4.5" height="5.1" transform="translate(425.5 1192.2) rotate(-151.5)"/>
      <line class="cls-10" x1="386.8" y1="554.6" x2="392.6" y2="558"/>
      <line class="cls-10" x1="260.7" y1="488.3" x2="267.1" y2="491.8"/>
      <polygon class="cls-10" points="926.6 468.5 917.9 468.5 916.9 468.5 916.9 460 926.6 460 926.6 468.5"/>
      <line class="cls-10" x1="917.8" y1="536.9" x2="917.8" y2="468.5"/>
      <line class="cls-10" x1="921.7" y1="493.3" x2="921.7" y2="474.9"/>
      <line class="cls-10" x1="921.7" y1="536.9" x2="921.7" y2="509.6"/>
      <line class="cls-10" x1="918.3" y1="476.8" x2="926.6" y2="476.8"/>
      <line class="cls-10" x1="918.3" y1="484.9" x2="926.6" y2="484.9"/>
      <line class="cls-10" x1="918.3" y1="493.1" x2="926.6" y2="493.1"/>
      <line class="cls-10" x1="918.3" y1="509.8" x2="926.6" y2="509.8"/>
      <line class="cls-10" x1="918.3" y1="518" x2="926.6" y2="518"/>
      <line class="cls-10" x1="918.3" y1="526" x2="926.6" y2="526"/>
      <line class="cls-10" x1="918.3" y1="501.3" x2="926.6" y2="501.3"/>
      <line class="cls-10" x1="923.9" y1="468.5" x2="923.9" y2="537.4"/>
      <path class="cls-10" d="M923.9,530.8c-.3-.1-79.1,0-79.1,0v6.1"/>
      <rect class="cls-10" x="918.8" y="470.1" width="4.5" height="5.1" transform="translate(448.4 1393.7) rotate(-90)"/>
      <rect class="cls-10" x="854.2" y="531.3" width="4.5" height="5.1" transform="translate(322.6 1390.3) rotate(-90)"/>
      <line class="cls-10" x1="909.8" y1="530.8" x2="909.8" y2="536.9"/>
      <line class="cls-10" x1="901.6" y1="530.8" x2="901.6" y2="536.9"/>
      <line class="cls-10" x1="893.3" y1="530.8" x2="893.3" y2="536.9"/>
      <line class="cls-10" x1="884.9" y1="530.8" x2="884.9" y2="536.9"/>
      <line class="cls-10" x1="876.4" y1="530.8" x2="876.4" y2="536.9"/>
      <line class="cls-10" x1="868.3" y1="530.8" x2="868.3" y2="536.9"/>
      <polyline class="cls-10" points="788.8 488.8 818.9 446.6 894.9 446.6 894.9 451.9 900.6 451.9"/>
      <polyline class="cls-10" points="815.1 556.8 765.7 521.2 783.9 495.7"/>
      <line class="cls-10" x1="778.1" y1="503.4" x2="783.4" y2="507"/>
      <polyline class="cls-10" points="822.2 532.8 809.6 549.7 814.8 553.5 827.1 536.7"/>
      <line class="cls-10" x1="811.7" y1="547.7" x2="816.4" y2="551.3"/>
      <g>
        <line class="cls-10" x1="1145.9" y1="308.4" x2="1145.9" y2="312.2"/>
        <line class="cls-10" x1="1148.6" y1="308.4" x2="1148.6" y2="312.2"/>
        <line class="cls-10" x1="1151.4" y1="308.4" x2="1151.4" y2="312.2"/>
        <line class="cls-10" x1="1154.1" y1="308.4" x2="1154.1" y2="312.2"/>
        <line class="cls-10" x1="1156.8" y1="308.4" x2="1156.8" y2="312.2"/>
        <line class="cls-10" x1="1159.5" y1="308.4" x2="1159.5" y2="312.2"/>
        <line class="cls-10" x1="1162.2" y1="308.4" x2="1162.2" y2="312.2"/>
        <line class="cls-10" x1="1164.9" y1="308.4" x2="1164.9" y2="312.2"/>
        <line class="cls-10" x1="1167.6" y1="308.4" x2="1167.6" y2="312.2"/>
        <line class="cls-10" x1="1170.3" y1="308.4" x2="1170.3" y2="312.2"/>
        <line class="cls-10" x1="1173.1" y1="308.4" x2="1173.1" y2="312.2"/>
        <line class="cls-10" x1="1175.8" y1="308.4" x2="1175.8" y2="312.2"/>
        <line class="cls-10" x1="1178.5" y1="308.4" x2="1178.5" y2="312.2"/>
        <line class="cls-10" x1="1181.2" y1="308.4" x2="1181.2" y2="312.2"/>
        <line class="cls-10" x1="1183.9" y1="308.4" x2="1183.9" y2="312.2"/>
        <line class="cls-10" x1="1186.6" y1="308.4" x2="1186.6" y2="312.2"/>
        <line class="cls-10" x1="1189.3" y1="308.4" x2="1189.3" y2="312.2"/>
        <line class="cls-10" x1="1192.1" y1="308.4" x2="1192.1" y2="312.2"/>
      </g>
      <g>
        <line class="cls-10" x1="1033" y1="308.4" x2="1033" y2="312.2"/>
        <line class="cls-10" x1="1035.7" y1="308.4" x2="1035.7" y2="312.2"/>
        <line class="cls-10" x1="1038.4" y1="308.4" x2="1038.4" y2="312.2"/>
        <line class="cls-10" x1="1041.1" y1="308.4" x2="1041.1" y2="312.2"/>
        <line class="cls-10" x1="1043.8" y1="308.4" x2="1043.8" y2="312.2"/>
        <line class="cls-10" x1="1046.6" y1="308.4" x2="1046.6" y2="312.2"/>
        <line class="cls-10" x1="1049.3" y1="308.4" x2="1049.3" y2="312.2"/>
        <line class="cls-10" x1="1052" y1="308.4" x2="1052" y2="312.2"/>
        <line class="cls-10" x1="1054.7" y1="308.4" x2="1054.7" y2="312.2"/>
        <line class="cls-10" x1="1057.4" y1="308.4" x2="1057.4" y2="312.2"/>
        <line class="cls-10" x1="1060.1" y1="308.4" x2="1060.1" y2="312.2"/>
        <line class="cls-10" x1="1062.8" y1="308.4" x2="1062.8" y2="312.2"/>
        <line class="cls-10" x1="1065.6" y1="308.4" x2="1065.6" y2="312.2"/>
        <line class="cls-10" x1="1068.3" y1="308.4" x2="1068.3" y2="312.2"/>
        <line class="cls-10" x1="1071" y1="308.4" x2="1071" y2="312.2"/>
        <line class="cls-10" x1="1073.7" y1="308.4" x2="1073.7" y2="312.2"/>
        <line class="cls-10" x1="1076.4" y1="308.4" x2="1076.4" y2="312.2"/>
        <line class="cls-10" x1="1079.1" y1="308.4" x2="1079.1" y2="312.2"/>
      </g>
      <g>
        <line class="cls-10" x1="984.4" y1="308.4" x2="984.4" y2="312.2"/>
        <line class="cls-10" x1="987.1" y1="308.4" x2="987.1" y2="312.2"/>
        <line class="cls-10" x1="989.8" y1="308.4" x2="989.8" y2="312.2"/>
        <line class="cls-10" x1="992.5" y1="308.4" x2="992.5" y2="312.2"/>
        <line class="cls-10" x1="995.2" y1="308.4" x2="995.2" y2="312.2"/>
        <line class="cls-10" x1="997.9" y1="308.4" x2="997.9" y2="312.2"/>
        <line class="cls-10" x1="1000.6" y1="308.4" x2="1000.6" y2="312.2"/>
        <line class="cls-10" x1="1003.3" y1="308.4" x2="1003.3" y2="312.2"/>
        <line class="cls-10" x1="1006.1" y1="308.4" x2="1006.1" y2="312.2"/>
        <line class="cls-10" x1="1008.8" y1="308.4" x2="1008.8" y2="312.2"/>
        <line class="cls-10" x1="1011.5" y1="308.4" x2="1011.5" y2="312.2"/>
        <line class="cls-10" x1="1014.2" y1="308.4" x2="1014.2" y2="312.2"/>
        <line class="cls-10" x1="1016.9" y1="308.4" x2="1016.9" y2="312.2"/>
        <line class="cls-10" x1="1019.6" y1="308.4" x2="1019.6" y2="312.2"/>
        <line class="cls-10" x1="1022.3" y1="308.4" x2="1022.3" y2="312.2"/>
        <line class="cls-10" x1="1025.1" y1="308.4" x2="1025.1" y2="312.2"/>
        <line class="cls-10" x1="1027.8" y1="308.4" x2="1027.8" y2="312.2"/>
        <line class="cls-10" x1="1030.5" y1="308.4" x2="1030.5" y2="312.2"/>
      </g>
      <g>
        <line class="cls-10" x1="869.2" y1="308.4" x2="869.2" y2="312.2"/>
        <line class="cls-10" x1="872" y1="308.4" x2="872" y2="312.2"/>
        <line class="cls-10" x1="874.7" y1="308.4" x2="874.7" y2="312.2"/>
        <line class="cls-10" x1="877.4" y1="308.4" x2="877.4" y2="312.2"/>
        <line class="cls-10" x1="880.1" y1="308.4" x2="880.1" y2="312.2"/>
        <line class="cls-10" x1="882.8" y1="308.4" x2="882.8" y2="312.2"/>
        <line class="cls-10" x1="885.5" y1="308.4" x2="885.5" y2="312.2"/>
        <line class="cls-10" x1="888.2" y1="308.4" x2="888.2" y2="312.2"/>
        <line class="cls-10" x1="890.9" y1="308.4" x2="890.9" y2="312.2"/>
        <line class="cls-10" x1="893.7" y1="308.4" x2="893.7" y2="312.2"/>
        <line class="cls-10" x1="896.4" y1="308.4" x2="896.4" y2="312.2"/>
        <line class="cls-10" x1="899.1" y1="308.4" x2="899.1" y2="312.2"/>
        <line class="cls-10" x1="901.8" y1="308.4" x2="901.8" y2="312.2"/>
        <line class="cls-10" x1="904.5" y1="308.4" x2="904.5" y2="312.2"/>
        <line class="cls-10" x1="907.2" y1="308.4" x2="907.2" y2="312.2"/>
        <line class="cls-10" x1="909.9" y1="308.4" x2="909.9" y2="312.2"/>
        <line class="cls-10" x1="912.7" y1="308.4" x2="912.7" y2="312.2"/>
        <line class="cls-10" x1="915.4" y1="308.4" x2="915.4" y2="312.2"/>
      </g>
      <g>
        <line class="cls-10" x1="820.6" y1="308.4" x2="820.6" y2="312.2"/>
        <line class="cls-10" x1="823.3" y1="308.4" x2="823.3" y2="312.2"/>
        <line class="cls-10" x1="826" y1="308.4" x2="826" y2="312.2"/>
        <line class="cls-10" x1="828.7" y1="308.4" x2="828.7" y2="312.2"/>
        <line class="cls-10" x1="831.4" y1="308.4" x2="831.4" y2="312.2"/>
        <line class="cls-10" x1="834.1" y1="308.4" x2="834.1" y2="312.2"/>
        <line class="cls-10" x1="836.8" y1="308.4" x2="836.8" y2="312.2"/>
        <line class="cls-10" x1="839.6" y1="308.4" x2="839.6" y2="312.2"/>
        <line class="cls-10" x1="842.3" y1="308.4" x2="842.3" y2="312.2"/>
        <line class="cls-10" x1="845" y1="308.4" x2="845" y2="312.2"/>
        <line class="cls-10" x1="847.7" y1="308.4" x2="847.7" y2="312.2"/>
        <line class="cls-10" x1="850.4" y1="308.4" x2="850.4" y2="312.2"/>
        <line class="cls-10" x1="853.1" y1="308.4" x2="853.1" y2="312.2"/>
        <line class="cls-10" x1="855.8" y1="308.4" x2="855.8" y2="312.2"/>
        <line class="cls-10" x1="858.6" y1="308.4" x2="858.6" y2="312.2"/>
        <line class="cls-10" x1="861.3" y1="308.4" x2="861.3" y2="312.2"/>
        <line class="cls-10" x1="864" y1="308.4" x2="864" y2="312.2"/>
        <line class="cls-10" x1="866.7" y1="308.4" x2="866.7" y2="312.2"/>
        <line class="cls-10" x1="818.1" y1="308.4" x2="818.1" y2="312.2"/>
      </g>
      <polyline class="cls-10" points="752.1 312.4 702.5 312.4 702.6 305.5"/>
      <g>
        <line class="cls-10" x1="705.5" y1="308.5" x2="705.5" y2="312.2"/>
        <line class="cls-10" x1="708.2" y1="308.5" x2="708.2" y2="312.2"/>
        <line class="cls-10" x1="710.9" y1="308.5" x2="710.9" y2="312.2"/>
        <line class="cls-10" x1="713.6" y1="308.5" x2="713.6" y2="312.2"/>
        <line class="cls-10" x1="716.3" y1="308.5" x2="716.3" y2="312.2"/>
        <line class="cls-10" x1="719.1" y1="308.5" x2="719.1" y2="312.2"/>
        <line class="cls-10" x1="721.8" y1="308.5" x2="721.8" y2="312.2"/>
        <line class="cls-10" x1="724.5" y1="308.5" x2="724.5" y2="312.2"/>
        <line class="cls-10" x1="727.2" y1="308.5" x2="727.2" y2="312.2"/>
        <line class="cls-10" x1="729.9" y1="308.5" x2="729.9" y2="312.2"/>
        <line class="cls-10" x1="732.6" y1="308.5" x2="732.6" y2="312.2"/>
        <line class="cls-10" x1="735.3" y1="308.5" x2="735.3" y2="312.2"/>
        <line class="cls-10" x1="738" y1="308.5" x2="738" y2="312.2"/>
        <line class="cls-10" x1="740.8" y1="308.5" x2="740.8" y2="312.2"/>
        <line class="cls-10" x1="743.5" y1="308.5" x2="743.5" y2="312.2"/>
        <line class="cls-10" x1="746.2" y1="308.5" x2="746.2" y2="312.2"/>
        <line class="cls-10" x1="748.9" y1="308.5" x2="748.9" y2="312.2"/>
        <line class="cls-10" x1="751.6" y1="308.5" x2="751.6" y2="312.2"/>
      </g>
      <line class="cls-10" x1="982" y1="308.4" x2="982" y2="312.2"/>
      <g>
        <polyline class="cls-10" points="648.5 304.3 599.6 296.1 600.8 289.4"/>
        <line class="cls-10" x1="603.2" y1="292.8" x2="602.5" y2="296.5"/>
        <line class="cls-10" x1="605.8" y1="293.2" x2="605.2" y2="296.9"/>
        <line class="cls-10" x1="608.5" y1="293.7" x2="607.9" y2="297.4"/>
        <line class="cls-10" x1="611.2" y1="294.1" x2="610.6" y2="297.8"/>
        <line class="cls-10" x1="613.9" y1="294.5" x2="613.2" y2="298.3"/>
        <line class="cls-10" x1="616.5" y1="295" x2="615.9" y2="298.7"/>
        <line class="cls-10" x1="619.2" y1="295.4" x2="618.6" y2="299.2"/>
        <line class="cls-10" x1="621.9" y1="295.9" x2="621.3" y2="299.6"/>
        <line class="cls-10" x1="624.6" y1="296.3" x2="624" y2="300.1"/>
        <line class="cls-10" x1="627.3" y1="296.8" x2="626.6" y2="300.5"/>
        <line class="cls-10" x1="629.9" y1="297.2" x2="629.3" y2="300.9"/>
        <line class="cls-10" x1="632.6" y1="297.7" x2="632" y2="301.4"/>
        <line class="cls-10" x1="635.3" y1="298.1" x2="634.7" y2="301.8"/>
        <line class="cls-10" x1="638" y1="298.5" x2="637.3" y2="302.3"/>
        <line class="cls-10" x1="640.6" y1="299" x2="640" y2="302.7"/>
        <line class="cls-10" x1="643.3" y1="299.4" x2="642.7" y2="303.2"/>
        <line class="cls-10" x1="646" y1="299.9" x2="645.4" y2="303.6"/>
        <line class="cls-10" x1="648.7" y1="300.3" x2="648" y2="304.1"/>
      </g>
      <g>
        <polyline class="cls-10" points="537.1 285.5 488.2 277.4 489.4 270.6"/>
        <line class="cls-10" x1="491.8" y1="274" x2="491.2" y2="277.7"/>
        <line class="cls-10" x1="494.5" y1="274.5" x2="493.8" y2="278.2"/>
        <line class="cls-10" x1="497.1" y1="274.9" x2="496.5" y2="278.6"/>
        <line class="cls-10" x1="499.8" y1="275.3" x2="499.2" y2="279.1"/>
        <line class="cls-10" x1="502.5" y1="275.8" x2="501.9" y2="279.5"/>
        <line class="cls-10" x1="505.2" y1="276.2" x2="504.6" y2="280"/>
        <line class="cls-10" x1="507.9" y1="276.7" x2="507.2" y2="280.4"/>
        <line class="cls-10" x1="510.5" y1="277.1" x2="509.9" y2="280.9"/>
        <line class="cls-10" x1="513.2" y1="277.6" x2="512.6" y2="281.3"/>
        <line class="cls-10" x1="515.9" y1="278" x2="515.3" y2="281.7"/>
        <line class="cls-10" x1="518.6" y1="278.5" x2="517.9" y2="282.2"/>
        <line class="cls-10" x1="521.2" y1="278.9" x2="520.6" y2="282.6"/>
        <line class="cls-10" x1="523.9" y1="279.3" x2="523.3" y2="283.1"/>
        <line class="cls-10" x1="526.6" y1="279.8" x2="526" y2="283.5"/>
        <line class="cls-10" x1="529.3" y1="280.2" x2="528.6" y2="284"/>
        <line class="cls-10" x1="531.9" y1="280.7" x2="531.3" y2="284.4"/>
        <line class="cls-10" x1="534.6" y1="281.1" x2="534" y2="284.9"/>
        <line class="cls-10" x1="537.3" y1="281.6" x2="536.7" y2="285.3"/>
      </g>
      <g>
        <polyline class="cls-10" points="1159 401.7 1159 347.9 1165.8 347.9"/>
        <g>
          <line class="cls-10" x1="1162.9" y1="355.1" x2="1159.2" y2="355.1"/>
          <line class="cls-10" x1="1162.9" y1="357.8" x2="1159.2" y2="357.8"/>
          <line class="cls-10" x1="1162.9" y1="360.5" x2="1159.2" y2="360.5"/>
          <line class="cls-10" x1="1162.9" y1="363.2" x2="1159.2" y2="363.2"/>
          <line class="cls-10" x1="1162.9" y1="365.9" x2="1159.2" y2="365.9"/>
          <line class="cls-10" x1="1162.9" y1="368.7" x2="1159.2" y2="368.7"/>
          <line class="cls-10" x1="1162.9" y1="371.4" x2="1159.2" y2="371.4"/>
          <line class="cls-10" x1="1162.9" y1="374.1" x2="1159.2" y2="374.1"/>
          <line class="cls-10" x1="1162.9" y1="376.8" x2="1159.2" y2="376.8"/>
          <line class="cls-10" x1="1162.9" y1="379.5" x2="1159.2" y2="379.5"/>
          <line class="cls-10" x1="1162.9" y1="382.2" x2="1159.2" y2="382.2"/>
          <line class="cls-10" x1="1162.9" y1="384.9" x2="1159.2" y2="384.9"/>
          <line class="cls-10" x1="1162.9" y1="387.7" x2="1159.2" y2="387.7"/>
          <line class="cls-10" x1="1162.9" y1="390.4" x2="1159.2" y2="390.4"/>
          <line class="cls-10" x1="1162.9" y1="393.1" x2="1159.2" y2="393.1"/>
          <line class="cls-10" x1="1162.9" y1="395.8" x2="1159.2" y2="395.8"/>
          <line class="cls-10" x1="1162.9" y1="398.5" x2="1159.2" y2="398.5"/>
          <line class="cls-10" x1="1162.9" y1="401.2" x2="1159.2" y2="401.2"/>
        </g>
      </g>
      <path class="cls-10" d="M522.8,614.5l8.7,4.7s2.9-3.9.6-7.8-2.1-2.4-4.2-3.5"/>
      <path class="cls-10" d="M531,600.8l8.8,4.6s-1.5,4.5-6,4.8-3.2-.8-5.7-2.2"/>
      <line class="cls-10" x1="378.5" y1="541" x2="284.5" y2="490.2"/>
      <path class="cls-10" d="M378.5,541.7l4.6-9s4.4,1.6,4.7,6.1-.5,4.1-2.4,7.2"/>
      <path class="cls-10" d="M484.6,597.7l4.5-8.7s-3.9-2.7-7.7-.3-3.3,3.1-4.8,6.5"/>
      <path class="cls-10" d="M184.3,439.1c1.9-3.1,2.5-4.7,2.4-6.6-.2-4.5-4.7-6.1-4.7-6.1l-10.8,20.4,12.2,6.5,6.5-11.7"/>
      <g>
        <path class="cls-10" d="M404.4,557.2c18.6,9.9,36.1,19.3,52.4,27.9l1.2-2.2-42.2-22.3"/>
        <path class="cls-10" d="M415.8,560.5c-3.4-1.8-6.6-3.5-10.2-5.3"/>
        <line class="cls-10" x1="406.2" y1="554.9" x2="394.3" y2="577.1"/>
        <line class="cls-10" x1="415" y1="600.1" x2="404.7" y2="619.5"/>
        <line class="cls-10" x1="456.9" y1="585" x2="446.3" y2="604.6"/>
        <g>
          <rect class="cls-10" x="373.4" y="634.4" width="8" height="5.5" transform="translate(341.1 -102.5) rotate(27.8)"/>
          <rect class="cls-10" x="380.4" y="638.1" width="8" height="5.5" transform="translate(343.6 -105.4) rotate(27.8)"/>
          <rect class="cls-10" x="387.5" y="641.8" width="8" height="5.5" transform="translate(346.2 -108.2) rotate(27.8)"/>
          <rect class="cls-10" x="394.6" y="645.6" width="8" height="5.5" transform="translate(348.7 -111.1) rotate(27.8)"/>
          <rect class="cls-10" x="401.7" y="649.3" width="8" height="5.5" transform="translate(351.3 -114) rotate(27.8)"/>
        </g>
        <g>
          <rect class="cls-10" x="384.2" y="613.1" width="8.3" height="5.5" transform="translate(332.4 -110.1) rotate(27.8)"/>
          <rect class="cls-10" x="391.6" y="617" width="8.3" height="5.5" transform="translate(335.1 -113.1) rotate(27.8)"/>
          <rect class="cls-10" x="398.9" y="620.8" width="8.3" height="5.5" transform="translate(337.7 -116) rotate(27.8)"/>
          <rect class="cls-10" x="406.2" y="624.7" width="8.3" height="5.5" transform="translate(340.4 -119) rotate(27.8)"/>
          <rect class="cls-10" x="413.5" y="628.6" width="8.3" height="5.5" transform="translate(343 -122) rotate(27.8)"/>
        </g>
        <line class="cls-10" x1="372.7" y1="637.4" x2="379.1" y2="625.4"/>
        <line class="cls-10" x1="407.9" y1="656.2" x2="414.5" y2="643.9"/>
        <path class="cls-10" d="M381.9,618.9l15-27.7-8.6-4.8,1.2-2.2,9,4.7s2.7-3.9.3-7.7-1.8-2.4-5.1-4.1"/>
        <line class="cls-10" x1="386.8" y1="609.4" x2="423.6" y2="628.9"/>
        <path class="cls-7" d="M407.7,612.5c-.3-.2-.6-.4-.9-.5-2.4-1.3-4.8-1.5-5.4-.4s.9,3,3.3,4.3.6.3,1,.5l2.1-3.9Z"/>
        <g>
          <rect class="cls-7" x="389.7" y="601.2" width="6.7" height="9" transform="translate(335.3 -114.1) rotate(28.4)"/>
          <circle class="cls-17" cx="391.3" cy="603.4" r=".6"/>
          <circle class="cls-17" cx="390.5" cy="605.1" r=".6"/>
          <ellipse class="cls-7" cx="392.1" cy="605.1" rx="2.9" ry="2" transform="translate(-326.7 662.4) rotate(-61.6)"/>
        </g>
        <line class="cls-10" x1="405.8" y1="595" x2="424.1" y2="605.1"/>
        <path class="cls-7" d="M406.5,617c.3.2.6.4.9.5,2.4,1.3,4.8,1.5,5.4.4s-.9-3-3.3-4.3-.6-.3-1-.5l-2.1,3.9Z"/>
        <g>
          <rect class="cls-7" x="420.1" y="617.3" width="6.7" height="9" transform="translate(500.3 1370.2) rotate(-151.6)"/>
          <circle class="cls-17" cx="425.2" cy="624" r=".6"/>
          <circle class="cls-17" cx="426.1" cy="622.4" r=".6"/>
          <ellipse class="cls-7" cx="424.4" cy="622.4" rx="2.9" ry="2" transform="translate(-324.9 699.8) rotate(-61.6)"/>
        </g>
        <line class="cls-10" x1="392" y1="618.3" x2="413.8" y2="629.7"/>
        <line class="cls-10" x1="413" y1="626.2" x2="411.7" y2="628.7"/>
        <line class="cls-1" x1="395.3" y1="616.9" x2="394" y2="619.4"/>
        <path class="cls-10" d="M462.2,595.7c1.8-3.2,2.5-5.1,2.4-7-.2-4.5-4.7-6.1-4.7-6.1l-4.6,9-1.3-.7"/>
        <path class="cls-10" d="M392.7,558.6c1.9-3.3,3.1-4.8,4.7-5.8,4-2.2,7.7.7,7.7.7l-4.9,8.6,1.8.9"/>
        <path class="cls-10" d="M424.6,604.9c-1.9,3.1-1.6,5.2-1.6,5.8.2,4.5,4.7,6.1,4.7,6.1l4-7.8,2.9,1.7"/>
        <path class="cls-10" d="M405.9,594.5c-1.8,3-2.6,4.5-4.2,5.6-3.8,2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
        <path class="cls-10" d="M446.5,605.3c-3.4-1.9-4.9-2.5-6.8-2.5-4.5,0-6.3,4.5-6.3,4.5l8.9,4.9-1.1,1.9-7.6-4-14.7,27.6"/>
        <path class="cls-10" d="M418.9,637.1l8.9,4.8s-1.7,4.4-6.2,4.5-4.3-1.1-7.5-2.8"/>
        <path class="cls-10" d="M381.9,618.3l-9-4.6s-2.7,3.9-.2,7.7,3.3,3,6.7,4.7"/>
        <polyline class="cls-10" points="398.4 569.5 402.9 572.1 407.7 563.5 450 586 445.4 594.5 449.8 597.1"/>
        <polyline class="cls-10" points="401.6 570.8 406.9 561.1 452.9 585 447.1 595.7"/>
        <line class="cls-10" x1="399.9" y1="567.3" x2="402.3" y2="568.7"/>
        <line class="cls-10" x1="401.2" y1="565.1" x2="403.6" y2="566.5"/>
        <line class="cls-10" x1="402.4" y1="562.6" x2="404.9" y2="564"/>
        <line class="cls-10" x1="403.6" y1="560.4" x2="406.1" y2="561.8"/>
        <line class="cls-10" x1="448.7" y1="593.3" x2="451.1" y2="594.7"/>
        <line class="cls-10" x1="450" y1="591.1" x2="452.4" y2="592.5"/>
        <line class="cls-10" x1="451.2" y1="588.6" x2="453.7" y2="590"/>
        <line class="cls-10" x1="452.4" y1="586.4" x2="454.9" y2="587.8"/>
      </g>
      <polygon class="cls-17" points="540.6 605.3 532.5 601.1 531.2 600.4 531.9 599.1 541.3 604 540.6 605.3"/>
      <polygon class="cls-17" points="531.3 621.1 523.3 616.9 521.9 616.2 522.6 614.9 532 619.8 531.3 621.1"/>
      <path class="cls-10" d="M199.9,423.7l5-8.8s-3.8-2.8-7.7-.5-3.1,2.2-4.7,5.5"/>
      <path class="cls-10" d="M180.7,413.7l6.7-11.9s-5.4-4-10.7-1-4.3,2.9-6.4,7.4"/>
      <line class="cls-10" x1="228.2" y1="377" x2="191" y2="357.2"/>
      <line class="cls-10" x1="223.6" y1="384.8" x2="186.3" y2="364.9"/>
      <line class="cls-10" x1="225.7" y1="380.8" x2="188.4" y2="361"/>
      <line class="cls-10" x1="196.5" y1="360.4" x2="192.3" y2="368.1"/>
      <line class="cls-10" x1="203.9" y1="364.3" x2="199.7" y2="372"/>
      <line class="cls-10" x1="206.7" y1="365.7" x2="202.5" y2="373.4"/>
      <line class="cls-10" x1="222" y1="373.9" x2="208.6" y2="397.8"/>
      <line class="cls-10" x1="224.7" y1="375.3" x2="211.8" y2="399.4"/>
      <line class="cls-10" x1="210.7" y1="367.6" x2="208.4" y2="371.7"/>
      <line class="cls-10" x1="217.7" y1="371.7" x2="215.5" y2="375.7"/>
      <line class="cls-10" x1="214.1" y1="369.9" x2="211.8" y2="374"/>
      <polyline class="cls-10" points="215 401.5 195.3 390.7 184 411.2"/>
      <path class="cls-7" d="M197.6,392.5c-.2.3-.4.6-.5.9-1.3,2.4-1.5,4.8-.4,5.4s3-.9,4.3-3.3.3-.6.5-1l-3.9-2.1Z"/>
      <g>
        <rect class="cls-7" x="204.7" y="397.4" width="6.7" height="9" transform="translate(660.6 410) rotate(118.4)"/>
        <circle class="cls-17" cx="210.3" cy="400.1" r=".6"/>
        <circle class="cls-17" cx="208.7" cy="399.3" r=".6"/>
        <ellipse class="cls-7" cx="208.6" cy="400.9" rx="2" ry="2.9" transform="translate(-243.3 393.8) rotate(-61.6)"/>
      </g>
      <line class="cls-10" x1="191.8" y1="396" x2="183.6" y2="391.7"/>
      <path class="cls-10" d="M184,391.9c1.2-2.2,1.3-3.8,1.3-5.5-.2-4.7-4.4-6.6-4.4-6.6l-5.2,9.2-1.8-1"/>
      <line class="cls-10" x1="215" y1="386.7" x2="217.8" y2="388.3"/>
      <line class="cls-10" x1="218.7" y1="387" x2="221.5" y2="388.6"/>
      <line class="cls-10" x1="213.6" y1="396.7" x2="216.4" y2="398.3"/>
      <rect class="cls-10" x="251.6" y="226.5" width="3" height="42.6" transform="translate(149.7 -91) rotate(28.6)"/>
      <path class="cls-10" d="M353.6,268.7l5.2-7s-5.1-6.6-12,1.4"/>
      <path class="cls-10" d="M339.3,259.2l6.4-8.2s7.5,3.8.9,12"/>
      <path class="cls-10" d="M278.9,212.8c2.6-2.8,6.9-3.2,10.2-1.3s5.2,7.3,3.2,11"/>
      <path class="cls-10" d="M292.3,222.3c2.6-2.8,6.8-3.4,10.1-1.5s4.8,7,3.2,11"/>
      <path class="cls-10" d="M264.7,309.3c-5.9-4.9-6.5-10.1-4.2-14.9s9.2-7.6,15-5.8"/>
      <path class="cls-10" d="M264.8,222.3c10.6,6.8,14.2-2.4,14.2-2.4l-9.2-6.2,1.9-3"/>
      <path class="cls-10" d="M200.9,213.5l-6.7,10.5s-9.1-3.8-2.7-14.5"/>
      <path class="cls-10" d="M199,266.8l-4.4,8.7s6.9,3.7,11.3-5.2"/>
      <path class="cls-10" d="M187.2,279.1l-4.1,8.2s6.2,4.8,10.6-4.1"/>
      <path class="cls-10" d="M186.4,262.7l-11.9-6s-6.1,8.8,6,14.7"/>
      <line class="cls-10" x1="219.3" y1="199.4" x2="233.9" y2="207.3"/>
      <line class="cls-10" x1="205.2" y1="225.7" x2="217.4" y2="232.3"/>
      <rect class="cls-10" x="243.9" y="332.8" width="3" height="15.1" transform="translate(193.1 -76) rotate(28.6)"/>
      <path class="cls-10" d="M253.2,331.1l-10.1-5.5s4.3-11.2,15.6-4.9"/>
      <path class="cls-10" d="M150.2,328.7c-3.2-1.7-4.9-2.9-5.9-4.6-2.2-4,.8-7.6.8-7.6l8.7,4.7.7-1.4"/>
      <path class="cls-10" d="M150.2,328.7c-3.1-1.9-5.3-2.5-7.2-2.4-4.5.2-6.1,4.7-6.1,4.7l9.3,5.3"/>
      <polyline class="cls-10" points="707.7 455.3 737.9 476.3 758.8 447.5"/>
      <polyline class="cls-10" points="693.3 470.3 743.4 505.1 777.3 458.1"/>
      <line class="cls-10" x1="697.8" y1="473.4" x2="710.2" y2="457"/>
      <line class="cls-10" x1="699.7" y1="474.8" x2="712.1" y2="458.4"/>
      <line class="cls-10" x1="701.6" y1="476.2" x2="714" y2="459.8"/>
      <line class="cls-10" x1="703.5" y1="477.7" x2="715.9" y2="461.3"/>
      <line class="cls-10" x1="705.7" y1="478.6" x2="718" y2="462.2"/>
      <line class="cls-10" x1="707.6" y1="480" x2="720" y2="463.6"/>
      <line class="cls-10" x1="709.5" y1="481.4" x2="721.9" y2="465"/>
      <line class="cls-10" x1="711.4" y1="482.9" x2="723.8" y2="466.5"/>
      <line class="cls-10" x1="713.6" y1="484.2" x2="725.9" y2="467.8"/>
      <line class="cls-10" x1="715.5" y1="485.6" x2="727.9" y2="469.2"/>
      <line class="cls-10" x1="717.4" y1="487" x2="729.8" y2="470.6"/>
      <line class="cls-10" x1="719.3" y1="488.5" x2="731.7" y2="472.1"/>
      <line class="cls-10" x1="721.4" y1="489.4" x2="733.8" y2="473"/>
      <line class="cls-10" x1="723.4" y1="490.8" x2="735.8" y2="474.4"/>
      <line class="cls-10" x1="725.3" y1="492.2" x2="737.7" y2="475.8"/>
      <line class="cls-10" x1="741.5" y1="471.7" x2="759.1" y2="483.2"/>
      <line class="cls-10" x1="742.8" y1="469.7" x2="760.4" y2="481.2"/>
      <line class="cls-10" x1="744" y1="467.8" x2="761.7" y2="479.4"/>
      <line class="cls-10" x1="745.8" y1="466.1" x2="763" y2="477.4"/>
      <line class="cls-10" x1="747.1" y1="464.2" x2="764.4" y2="475.4"/>
      <line class="cls-10" x1="748.5" y1="462.1" x2="766.1" y2="473.7"/>
      <line class="cls-10" x1="750" y1="460.2" x2="767.2" y2="471.4"/>
      <line class="cls-10" x1="751.3" y1="458.2" x2="768.6" y2="469.5"/>
      <line class="cls-10" x1="752.9" y1="456.3" x2="770.1" y2="467.6"/>
      <line class="cls-10" x1="754.2" y1="454.5" x2="771.5" y2="465.8"/>
      <line class="cls-10" x1="755.2" y1="452.3" x2="772.9" y2="463.9"/>
      <line class="cls-10" x1="757" y1="450.6" x2="774.2" y2="461.9"/>
      <line class="cls-10" x1="758.4" y1="448.7" x2="775.6" y2="459.9"/>
      <path class="cls-10" d="M784.3,495.9l-7.9-5.9s5.5-5.9,12.6-.6"/>
      <path class="cls-10" d="M783.1,507.4l6-8s6.7,4.6,1.4,11.7l-1.3,1.7"/>
      <path class="cls-10" d="M797.5,515.5l4.7-6.2s-6.3-5.2-11.6,1.8l-1.3,1.7"/>
      <line class="cls-7" x1="930" y1="531.6" x2="1259.6" y2="531.6"/>
      <path class="cls-10" d="M1172.8,402.6h-9.5s-1.6,8.2,8.9,8.1"/>
      <polyline class="cls-10" points="1125.4 451.2 1125.4 438.8 1176.3 438.8 1176.3 446.4"/>
      <g>
        <line class="cls-10" x1="1173.3" y1="442.7" x2="1173.3" y2="438.9"/>
        <line class="cls-10" x1="1170.6" y1="442.7" x2="1170.6" y2="438.9"/>
        <line class="cls-10" x1="1167.9" y1="442.7" x2="1167.9" y2="438.9"/>
        <line class="cls-10" x1="1165.2" y1="442.7" x2="1165.2" y2="438.9"/>
        <line class="cls-10" x1="1162.5" y1="442.7" x2="1162.5" y2="438.9"/>
        <line class="cls-10" x1="1159.8" y1="442.7" x2="1159.8" y2="438.9"/>
        <line class="cls-10" x1="1157.1" y1="442.7" x2="1157.1" y2="438.9"/>
        <line class="cls-10" x1="1154.3" y1="442.7" x2="1154.3" y2="438.9"/>
        <line class="cls-10" x1="1151.6" y1="442.7" x2="1151.6" y2="438.9"/>
        <line class="cls-10" x1="1148.9" y1="442.7" x2="1148.9" y2="438.9"/>
        <line class="cls-10" x1="1146.2" y1="442.7" x2="1146.2" y2="438.9"/>
        <line class="cls-10" x1="1143.5" y1="442.7" x2="1143.5" y2="438.9"/>
        <line class="cls-10" x1="1140.8" y1="442.7" x2="1140.8" y2="438.9"/>
        <line class="cls-10" x1="1138.1" y1="442.7" x2="1138.1" y2="438.9"/>
        <line class="cls-10" x1="1135.3" y1="442.7" x2="1135.3" y2="438.9"/>
        <line class="cls-10" x1="1132.6" y1="442.7" x2="1132.6" y2="438.9"/>
        <line class="cls-10" x1="1129.9" y1="442.7" x2="1129.9" y2="438.9"/>
        <line class="cls-10" x1="1127.2" y1="442.7" x2="1127.2" y2="438.9"/>
      </g>
      <polyline class="cls-10" points="956.6 451.6 956.6 439.1 1065 439.1 1065 450.2"/>
      <g>
        <line class="cls-10" x1="1062.1" y1="443.1" x2="1062.1" y2="439.3"/>
        <line class="cls-10" x1="1059.4" y1="443.1" x2="1059.4" y2="439.3"/>
        <line class="cls-10" x1="1056.7" y1="443.1" x2="1056.7" y2="439.3"/>
        <line class="cls-10" x1="1053.9" y1="443.1" x2="1053.9" y2="439.3"/>
        <line class="cls-10" x1="1051.2" y1="443.1" x2="1051.2" y2="439.3"/>
        <line class="cls-10" x1="1048.5" y1="443.1" x2="1048.5" y2="439.3"/>
        <line class="cls-10" x1="1045.8" y1="443.1" x2="1045.8" y2="439.3"/>
        <line class="cls-10" x1="1043.1" y1="443.1" x2="1043.1" y2="439.3"/>
        <line class="cls-10" x1="1040.4" y1="443.1" x2="1040.4" y2="439.3"/>
        <line class="cls-10" x1="1037.7" y1="443.1" x2="1037.7" y2="439.3"/>
        <line class="cls-10" x1="1034.9" y1="443.1" x2="1034.9" y2="439.3"/>
        <line class="cls-10" x1="1032.2" y1="443.1" x2="1032.2" y2="439.3"/>
        <line class="cls-10" x1="1029.5" y1="443.1" x2="1029.5" y2="439.3"/>
        <line class="cls-10" x1="1026.8" y1="443.1" x2="1026.8" y2="439.3"/>
        <line class="cls-10" x1="1024.1" y1="443.1" x2="1024.1" y2="439.3"/>
        <line class="cls-10" x1="1021.4" y1="443.1" x2="1021.4" y2="439.3"/>
        <line class="cls-10" x1="1018.7" y1="443.1" x2="1018.7" y2="439.3"/>
        <line class="cls-10" x1="1016" y1="443.1" x2="1016" y2="439.3"/>
      </g>
      <line class="cls-10" x1="1013.1" y1="443.2" x2="1013.1" y2="439.5"/>
      <line class="cls-10" x1="1010.1" y1="443.2" x2="1010.1" y2="439.5"/>
      <line class="cls-10" x1="1007.3" y1="443.2" x2="1007.3" y2="439.5"/>
      <line class="cls-10" x1="1004.6" y1="443.2" x2="1004.6" y2="439.5"/>
      <line class="cls-10" x1="1001.8" y1="443.2" x2="1001.8" y2="439.5"/>
      <line class="cls-10" x1="999.1" y1="443.2" x2="999.1" y2="439.5"/>
      <line class="cls-10" x1="996.4" y1="443.2" x2="996.4" y2="439.5"/>
      <line class="cls-10" x1="993.7" y1="443.2" x2="993.7" y2="439.5"/>
      <line class="cls-10" x1="991" y1="443.2" x2="991" y2="439.5"/>
      <line class="cls-10" x1="988.3" y1="443.2" x2="988.3" y2="439.5"/>
      <line class="cls-10" x1="985.5" y1="443.2" x2="985.5" y2="439.5"/>
      <line class="cls-10" x1="982.8" y1="443.2" x2="982.8" y2="439.5"/>
      <line class="cls-10" x1="980.1" y1="443.2" x2="980.1" y2="439.5"/>
      <line class="cls-10" x1="977.4" y1="443.2" x2="977.4" y2="439.5"/>
      <line class="cls-10" x1="974.7" y1="443.2" x2="974.7" y2="439.5"/>
      <line class="cls-10" x1="972" y1="443.2" x2="972" y2="439.5"/>
      <line class="cls-10" x1="969.2" y1="443.2" x2="969.2" y2="439.5"/>
      <line class="cls-10" x1="966.5" y1="443.2" x2="966.5" y2="439.5"/>
      <line class="cls-10" x1="963.8" y1="443.1" x2="963.8" y2="439.3"/>
      <line class="cls-10" x1="961.1" y1="443.1" x2="961.1" y2="439.3"/>
      <polyline class="cls-10" points="854 446.7 854 442.7 894.9 442.7 894.9 450.3"/>
      <line class="cls-10" x1="892" y1="446.7" x2="892" y2="442.9"/>
      <line class="cls-10" x1="889.2" y1="446.7" x2="889.2" y2="442.9"/>
      <line class="cls-10" x1="886.5" y1="446.7" x2="886.5" y2="442.9"/>
      <line class="cls-10" x1="883.8" y1="446.7" x2="883.8" y2="442.9"/>
      <line class="cls-10" x1="881.1" y1="446.7" x2="881.1" y2="442.9"/>
      <line class="cls-10" x1="878.4" y1="446.7" x2="878.4" y2="442.9"/>
      <line class="cls-10" x1="875.7" y1="446.7" x2="875.7" y2="442.9"/>
      <line class="cls-10" x1="873" y1="446.7" x2="873" y2="442.9"/>
      <line class="cls-10" x1="870.2" y1="446.7" x2="870.2" y2="442.9"/>
      <line class="cls-10" x1="867.5" y1="446.7" x2="867.5" y2="442.9"/>
      <line class="cls-10" x1="864.8" y1="446.7" x2="864.8" y2="442.9"/>
      <line class="cls-10" x1="862.1" y1="446.7" x2="862.1" y2="442.9"/>
      <line class="cls-10" x1="859.4" y1="446.7" x2="859.4" y2="442.9"/>
      <line class="cls-10" x1="856.7" y1="446.7" x2="856.7" y2="442.9"/>
      <path class="cls-10" d="M908.4,451.9v-8.4s-8.2-1.6-8.1,8.9"/>
      <line class="cls-10" x1="908" y1="451.9" x2="910.7" y2="451.9"/>
      <path class="cls-10" d="M929.3,442.6"/>
      <path class="cls-10" d="M1115.2,308.8"/>
      <path class="cls-10" d="M951.4,308.3"/>
      <path class="cls-10" d="M951.4,308.3"/>
      <line class="cls-7" x1="663.3" y1="212.5" x2="503.6" y2="185"/>
      <path class="cls-10" d="M827.3,407.3c8.9,0,8.5,7.3,8.5,7.3h-8.6s0,1.4,0,1.4"/>
      <polyline class="cls-10" points="820.2 405.3 827.8 405.3 827.8 407.2"/>
      <g>
        <rect class="cls-7" x="897.4" y="410.4" width="4.8" height="4.8"/>
        <rect class="cls-17" x="899.5" y="413.7" width=".7" height="1.8"/>
        <circle class="cls-17" cx="898.8" cy="414.8" r=".5"/>
        <circle class="cls-17" cx="901" cy="414.8" r=".5"/>
      </g>
      <polyline class="cls-10" points="902.5 412.7 911.4 412.7 911.4 415.9"/>
      <line class="cls-10" x1="776.4" y1="562.5" x2="825.9" y2="596.7"/>
      <line class="cls-10" x1="875.4" y1="711" x2="906.7" y2="652"/>
      <polyline class="cls-10" points="627.2 649.5 846.8 765 871.6 717.8"/>
      <line class="cls-10" x1="886" y1="662.2" x2="897.2" y2="670.1"/>
      <line class="cls-10" x1="813.3" y1="610.4" x2="880.1" y2="658"/>
      <rect class="cls-10" x="825.3" y="627.2" width="81" height="2.8" transform="translate(517.8 -383.2) rotate(35)"/>
      <polyline class="cls-10" points="903.8 650.5 899.9 656.8 828.6 606.3 832.4 601.2 906.5 652.4"/>
      <line class="cls-10" x1="825.3" y1="618.8" x2="832.8" y2="609.5"/>
      <line class="cls-10" x1="827.6" y1="620.5" x2="835.1" y2="611.2"/>
      <line class="cls-10" x1="829.8" y1="622.3" x2="837.2" y2="612.9"/>
      <line class="cls-10" x1="832.1" y1="623.5" x2="839.6" y2="614.2"/>
      <line class="cls-10" x1="834.2" y1="625.2" x2="841.7" y2="615.9"/>
      <line class="cls-10" x1="836.6" y1="626.9" x2="844" y2="617.6"/>
      <line class="cls-10" x1="838.8" y1="628.6" x2="846.3" y2="619.3"/>
      <line class="cls-10" x1="847.5" y1="634.3" x2="855" y2="625"/>
      <line class="cls-10" x1="848.7" y1="635.5" x2="856.2" y2="626.2"/>
      <line class="cls-10" x1="849.8" y1="636.6" x2="857.3" y2="627.3"/>
      <line class="cls-10" x1="878.2" y1="656.2" x2="885.7" y2="646.9"/>
      <line class="cls-10" x1="854.5" y1="630.9" x2="882.5" y2="650.9"/>
      <g>
        <polygon class="cls-10" points="876 701.4 846.7 685.4 848 682.8 849.4 680.3 878.8 696.3 876 701.4"/>
        <line class="cls-10" x1="877.4" y1="698.8" x2="847.8" y2="682.7"/>
        <line class="cls-10" x1="857.5" y1="684.7" x2="854.8" y2="689.8"/>
        <line class="cls-10" x1="864.1" y1="688.3" x2="861.4" y2="693.4"/>
        <line class="cls-10" x1="871" y1="692" x2="868.2" y2="697.1"/>
      </g>
      <line class="cls-10" x1="695.3" y1="604.3" x2="661.6" y2="586.3"/>
      <line class="cls-10" x1="734" y1="625.1" x2="718" y2="616.5"/>
      <line class="cls-10" x1="744.2" y1="630.7" x2="740.7" y2="628.8"/>
      <line class="cls-10" x1="787.2" y1="662.8" x2="747.2" y2="641.3"/>
      <polyline class="cls-10" points="879.7 703.4 800.1 660.6 795.9 667.7 794.1 666.7"/>
      <g>
        <polygon class="cls-10" points="893.3 667.8 877.6 695.5 875.1 694.1 872.5 692.7 888.5 664.5 893.3 667.8"/>
        <line class="cls-10" x1="891" y1="665.9" x2="874.9" y2="694.4"/>
        <line class="cls-10" x1="876.9" y1="684.9" x2="882" y2="687.8"/>
        <line class="cls-10" x1="875.4" y1="688.3" x2="877.9" y2="689.7"/>
        <line class="cls-10" x1="880.5" y1="678.6" x2="885.6" y2="681.4"/>
        <line class="cls-10" x1="884.2" y1="672" x2="889.3" y2="674.9"/>
        <line class="cls-10" x1="885.5" y1="675.8" x2="888" y2="677.3"/>
        <line class="cls-10" x1="888.4" y1="671.2" x2="891" y2="672.7"/>
      </g>
      <line class="cls-10" x1="812.4" y1="655.5" x2="830.6" y2="622.6"/>
      <line class="cls-10" x1="715.1" y1="598.5" x2="712.1" y2="596.9"/>
      <line class="cls-10" x1="736.1" y1="609.6" x2="722" y2="602.2"/>
      <line class="cls-10" x1="775.6" y1="630.4" x2="748.8" y2="616.3"/>
      <line class="cls-10" x1="806.6" y1="646.9" x2="782.5" y2="634"/>
      <line class="cls-10" x1="822.2" y1="594.2" x2="797.1" y2="641.8"/>
      <line class="cls-6" x1="792.1" y1="573.4" x2="765.5" y2="625.1"/>
      <g>
        <polygon class="cls-10" points="835.4 626.1 820.3 653.4 817.8 652 815.3 650.6 830.6 622.9 835.4 626.1"/>
        <line class="cls-10" x1="833.1" y1="624.3" x2="817.7" y2="652.2"/>
        <line class="cls-10" x1="819.5" y1="642.9" x2="824.6" y2="645.8"/>
        <line class="cls-10" x1="818" y1="646.2" x2="820.6" y2="647.6"/>
        <line class="cls-10" x1="822.9" y1="636.7" x2="828" y2="639.5"/>
        <line class="cls-10" x1="826.5" y1="630.3" x2="831.6" y2="633.1"/>
        <line class="cls-10" x1="827.8" y1="634" x2="830.3" y2="635.4"/>
        <line class="cls-10" x1="830.6" y1="629.5" x2="833.2" y2="630.9"/>
      </g>
      <g>
        <rect class="cls-10" x="791.8" y="610.8" width="18.5" height="7.3" transform="translate(381.4 -303.7) rotate(27.9)"/>
        <rect class="cls-17" x="791.9" y="613.9" width="18.7" height="1.6" transform="translate(381.5 -303.8) rotate(27.9)"/>
      </g>
      <g>
        <rect class="cls-10" x="787" y="636" width="11.6" height="3.2" transform="translate(399.3 -300.6) rotate(28.4)"/>
        <line class="cls-10" x1="790.7" y1="634.9" x2="789.3" y2="637.4"/>
      </g>
      <line class="cls-10" x1="798.3" y1="577.5" x2="771.9" y2="628.6"/>
      <line class="cls-10" x1="790.8" y1="577.9" x2="796.3" y2="581"/>
      <line class="cls-10" x1="788.2" y1="582.2" x2="794.1" y2="585.7"/>
      <line class="cls-10" x1="784.6" y1="589.9" x2="790" y2="593.1"/>
      <line class="cls-10" x1="780.8" y1="597.2" x2="786.2" y2="600.3"/>
      <line class="cls-10" x1="777" y1="604.7" x2="782.4" y2="607.8"/>
      <line class="cls-10" x1="772.9" y1="612.2" x2="778.3" y2="615.3"/>
      <line class="cls-10" x1="770.6" y1="616.9" x2="776" y2="620.1"/>
      <polyline class="cls-10" points="806.5 583.5 805 588.1 803.7 591.7 818.4 600.7"/>
      <line class="cls-10" x1="820.3" y1="597.2" x2="805.1" y2="587.3"/>
      <line class="cls-10" x1="754.5" y1="606.4" x2="749.2" y2="616.6"/>
      <path class="cls-10" d="M754.5,606.4"/>
      <path class="cls-10" d="M758.1,599.3"/>
      <line class="cls-10" x1="766.4" y1="583" x2="758.1" y2="599.3"/>
      <line class="cls-10" x1="776.9" y1="562.3" x2="769.8" y2="576.3"/>
      <polygon class="cls-17" points="791.7 575.1 775.9 564 776.7 562.8 792.9 573.4 791.7 575.1"/>
      <rect class="cls-17" x="748.9" y="619.2" width="17.5" height="1.3" transform="translate(378.7 -282.7) rotate(27.9)"/>
      <line class="cls-10" x1="751.7" y1="612.6" x2="767.1" y2="620.9"/>
      <line class="cls-10" x1="765.6" y1="614" x2="769.3" y2="616"/>
      <line class="cls-10" x1="753.9" y1="607.7" x2="757.8" y2="609.8"/>
      <g>
        <rect class="cls-7" x="757.3" y="609.1" width="6.7" height="9" transform="translate(-142 988.3) rotate(-61.4)"/>
        <circle class="cls-17" cx="758.5" cy="615.4" r=".6"/>
        <circle class="cls-17" cx="760.1" cy="616.3" r=".6"/>
        <ellipse class="cls-7" cx="760.2" cy="614.6" rx="2" ry="2.9" transform="translate(-143.1 988.4) rotate(-61.4)"/>
      </g>
      <line class="cls-10" x1="763.4" y1="589.8" x2="778.8" y2="598.1"/>
      <line class="cls-10" x1="777.2" y1="591.2" x2="781" y2="593.2"/>
      <line class="cls-10" x1="765.6" y1="584.9" x2="769.5" y2="587"/>
      <g>
        <rect class="cls-7" x="769" y="586.3" width="6.7" height="9" transform="translate(-115.8 986.6) rotate(-61.4)"/>
        <circle class="cls-17" cx="770.2" cy="592.5" r=".6"/>
        <circle class="cls-17" cx="771.8" cy="593.4" r=".6"/>
        <ellipse class="cls-7" cx="771.9" cy="591.8" rx="2" ry="2.9" transform="translate(-117 986.7) rotate(-61.4)"/>
      </g>
      <path class="cls-7" d="M773.5,595.4c-.2.3-.4.6-.6.9-1.3,2.4-1.5,4.8-.4,5.4s3-.9,4.4-3.2.3-.6.5-.9l-3.9-2.1Z"/>
      <path class="cls-7" d="M785.3,570.9c-.2.3-.4.6-.6.9-1.3,2.4-1.5,4.8-.4,5.4s3-.9,4.4-3.2.3-.6.5-.9l-3.9-2.1Z"/>
      <line class="cls-7" x1="699.5" y1="517.1" x2="736.7" y2="535.6"/>
      <rect class="cls-17" x="730.1" y="544.1" width="37.3" height="2.2" transform="translate(442.5 -328.9) rotate(34.6)"/>
      <rect class="cls-10" x="724.2" y="536.5" width="17.7" height="6.8" transform="translate(433.5 -319.9) rotate(34.4)"/>
      <line class="cls-10" x1="726.1" y1="534.9" x2="740.4" y2="544.8"/>
      <line class="cls-10" x1="735" y1="537.4" x2="731.2" y2="542.8"/>
      <line class="cls-10" x1="742.2" y1="540.9" x2="712.7" y2="596.9"/>
      <line class="cls-10" x1="736.8" y1="583.7" x2="746.3" y2="588.9"/>
      <path class="cls-7" d="M757.8,552.8c-.2.3-.4.6-.6.9-1.3,2.4-1.5,4.8-.4,5.4s3-.9,4.4-3.2.3-.6.5-.9l-3.9-2.1Z"/>
      <g>
        <rect class="cls-7" x="741" y="542.9" width="6.7" height="9" transform="translate(1599.1 196.6) rotate(121.4)"/>
        <circle class="cls-17" cx="746.7" cy="545.7" r=".6"/>
        <circle class="cls-17" cx="745.1" cy="544.8" r=".6"/>
        <ellipse class="cls-7" cx="744.9" cy="546.4" rx="2" ry="2.9" transform="translate(-109.3 898.2) rotate(-58.6)"/>
      </g>
      <line class="cls-10" x1="740.8" y1="566.3" x2="754.5" y2="573.7"/>
      <polyline class="cls-10" points="745.7 569.3 741.7 576.5 750.7 581.4"/>
      <g>
        <polygon class="cls-10" points="731.9 573.6 724 588.7 721.3 587.2 718.6 585.8 726.5 570.8 731.9 573.6"/>
        <line class="cls-10" x1="729.7" y1="572.5" x2="721.8" y2="587.5"/>
        <line class="cls-10" x1="725.4" y1="573.2" x2="728.7" y2="574.9"/>
        <line class="cls-10" x1="724.1" y1="575.7" x2="727.4" y2="577.4"/>
        <line class="cls-10" x1="719.9" y1="583.7" x2="723.2" y2="585.5"/>
        <line class="cls-10" x1="724.6" y1="581.1" x2="727.8" y2="582.8"/>
      </g>
      <line class="cls-10" x1="667.3" y1="576.5" x2="613.4" y2="674.6"/>
      <polyline class="cls-10" points="671.6 568.7 702.6 511.5 765.5 555"/>
      <line class="cls-10" x1="645.8" y1="615.5" x2="683.6" y2="635.5"/>
      <line class="cls-10" x1="690.3" y1="613.4" x2="679.2" y2="633.5"/>
      <line class="cls-10" x1="708.8" y1="611.6" x2="674.6" y2="674.3"/>
      <g>
        <polygon class="cls-10" points="698 648.8 681.8 678 678.2 676 674.7 674 690.8 644.8 698 648.8"/>
        <line class="cls-10" x1="694.4" y1="646.8" x2="678.1" y2="676.3"/>
        <line class="cls-10" x1="679.1" y1="666" x2="686.3" y2="669.9"/>
        <line class="cls-10" x1="677.7" y1="669.5" x2="681.2" y2="671.5"/>
        <line class="cls-10" x1="682.7" y1="659.4" x2="689.9" y2="663.4"/>
        <line class="cls-10" x1="686.5" y1="652.6" x2="693.7" y2="656.6"/>
        <line class="cls-10" x1="688.8" y1="657.1" x2="692.4" y2="659.1"/>
        <line class="cls-10" x1="691.9" y1="652.4" x2="695.5" y2="654.4"/>
      </g>
      <g>
        <polygon class="cls-10" points="736.8 641.6 708.8 692.1 705.2 690.1 701.6 688.1 729.5 637.7 736.8 641.6"/>
        <line class="cls-10" x1="733.1" y1="639.7" x2="705" y2="690.6"/>
        <line class="cls-10" x1="709.3" y1="674.2" x2="716.5" y2="678.2"/>
        <line class="cls-10" x1="706.5" y1="680.2" x2="710.1" y2="682.2"/>
        <line class="cls-10" x1="715.6" y1="662.9" x2="722.8" y2="666.9"/>
        <line class="cls-10" x1="722.1" y1="651.1" x2="729.3" y2="655.1"/>
        <line class="cls-10" x1="723.4" y1="657.4" x2="727" y2="659.4"/>
        <line class="cls-10" x1="728.5" y1="649.1" x2="732.1" y2="651.1"/>
      </g>
      <polyline class="cls-10" points="731.6 618.1 722.9 633.7 737.4 641.4"/>
      <g>
        <polygon class="cls-10" points="782.4 660.1 753 644.2 755 640.6 756.9 637 786.2 652.9 782.4 660.1"/>
        <line class="cls-10" x1="784.3" y1="656.5" x2="754.7" y2="640.4"/>
        <line class="cls-10" x1="765" y1="641.4" x2="761.1" y2="648.6"/>
        <line class="cls-10" x1="761.5" y1="640" x2="759.5" y2="643.6"/>
        <line class="cls-10" x1="771.6" y1="644.9" x2="767.7" y2="652.1"/>
        <line class="cls-10" x1="778.2" y1="648.2" x2="769.6" y2="663.8"/>
        <line class="cls-10" x1="773.9" y1="651" x2="772" y2="654.6"/>
        <line class="cls-10" x1="778.7" y1="654" x2="776.8" y2="657.6"/>
      </g>
      <g>
        <polygon class="cls-10" points="767.5 685.5 751.3 714.7 747.7 712.7 744.1 710.7 760.2 681.5 767.5 685.5"/>
        <line class="cls-10" x1="763.8" y1="683.5" x2="747.6" y2="712.9"/>
        <line class="cls-10" x1="748.6" y1="702.7" x2="755.7" y2="706.6"/>
        <line class="cls-10" x1="747.1" y1="706.2" x2="750.7" y2="708.2"/>
        <line class="cls-10" x1="752.2" y1="696.1" x2="759.4" y2="700.1"/>
        <line class="cls-10" x1="756" y1="689.3" x2="763.1" y2="693.3"/>
        <line class="cls-10" x1="758.3" y1="693.8" x2="761.8" y2="695.8"/>
        <line class="cls-10" x1="761.3" y1="689.1" x2="764.9" y2="691"/>
      </g>
      <polygon class="cls-10" points="777.3 667 771.8 677.2 768.2 675.3 764.5 673.4 770 663.2 777.3 667"/>
      <line class="cls-10" x1="768.6" y1="666.5" x2="775.8" y2="670.5"/>
      <g>
        <rect class="cls-7" x="761.9" y="674.5" width="6.7" height="9" transform="translate(403.7 -278) rotate(27.7)"/>
        <circle class="cls-17" cx="763.5" cy="676.8" r=".6"/>
        <circle class="cls-17" cx="762.6" cy="678.4" r=".6"/>
        <ellipse class="cls-7" cx="764.3" cy="678.5" rx="2.9" ry="2" transform="translate(-191.8 1039.4) rotate(-62.3)"/>
      </g>
      <polyline class="cls-10" points="773.7 726.3 775.9 722 841 756 838.8 760.6"/>
      <path class="cls-10" d="M667.9,576.6l-9.4-5s2.6-8.8,13.5-2.5"/>
      <path class="cls-5" d="M755.1,606.3l-9.2-5.4s3.7-7.1,11.4-2.7l1.4.8"/>
      <path class="cls-5" d="M766.7,583.3l-9.2-5.4s3.7-7.1,11.4-2.7l1.4.8"/>
      <path class="cls-5" d="M760.3,564l1.8,1,5.1-9.4s7.2,3.5,3,11.3l-.8,1.4,3.4,1.9"/>
      <path class="cls-5" d="M741.1,566.9l.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6,8.9-2.5-1.4"/>
      <path class="cls-5" d="M722.2,602.8l.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6,8.9"/>
      <path class="cls-5" d="M733.6,625.5l.8-1.4c4.3-7.7,11.2-3.5,11.2-3.5l-10.5,19.6"/>
      <path class="cls-5" d="M775.4,630.9l.8-1.4c4.3-7.7,11.2-3.5,11.2-3.5l-4.7,8.5"/>
      <path class="cls-5" d="M806,647l.8-1.4c4.3-7.7,11.2-3.5,11.2-3.5l-4.7,8.5,1.5.8"/>
      <path class="cls-5" d="M787.2,663.4l.8-1.4c4.3-7.7,11.2-3.5,11.2-3.5l-4.9,8.7"/>
      <path class="cls-5" d="M812,655.2l1.4.8c7.7,4.3,3.5,11.2,3.5,11.2l-8.7-4.9-1,1.8"/>
      <path class="cls-5" d="M886.6,661.9l-.9,1.3c-5,7.3-11.4,2.4-11.4,2.4l5.7-8.2"/>
      <path class="cls-5" d="M871.2,717.6l1.4.8c7.8,4.2,11.3-3,11.3-3l-8.8-4.8"/>
      <polyline class="cls-10" points="835.5 759 834.3 761.3 625.8 651.9"/>
      <line class="cls-6" x1="604" y1="631.9" x2="614.2" y2="637.4"/>
      <path class="cls-10" d="M590.9,622.9l-4.7,8.7s3.9,2.9,7.8.6,2.4-2.1,3.5-4.2"/>
      <path class="cls-10" d="M604.6,631.1l-4.6,8.8s-4.5-1.5-4.8-6,.8-3.2,2.2-5.7"/>
      <path class="cls-10" d="M589.2,624.1l-11.7,21.9s-37.5-19.5-92.8-48.7"/>
      <path class="cls-10" d="M614.3,636.3l-4.7,8.7s4.2,3,8.3.6,2.5-2.1,3.7-4.2"/>
      <path class="cls-10" d="M629.1,644.4l-4.8,8.9s-4.8-1.5-5.1-6.1c-.1-1.7.9-3.2,2.3-5.7"/>
      <line class="cls-6" x1="591.8" y1="655.8" x2="602" y2="661.4"/>
      <path class="cls-10" d="M577.4,646.1l-4.7,8.7s4.7,3.4,8.9,1.2,2.5-2,3.7-4.1"/>
      <path class="cls-10" d="M592.4,655l-4.6,8.8s-4.5-1.5-4.8-6,.8-3.2,2.2-5.7"/>
      <path class="cls-10" d="M602,660.3l-4.7,8.7s4.2,3,8.3.6,2.5-2.1,3.7-4.2"/>
      <path class="cls-10" d="M616.8,668.4l-4.8,8.9s-4.8-1.5-5.1-6.1c-.1-1.7.9-3.2,2.3-5.7"/>
      <polyline class="cls-10" points="471 592.2 471.9 590.5 477.4 593.3"/>
      <path class="cls-10" d="M362,494.1c3.5,1.8,5.2,2.8,6.2,4.4,2.5,3.8-.2,7.7-.2,7.7l-8.9-4.8-.9,1.5"/>
      <path class="cls-10" d="M231.2,370.4l8.9,4.8s2.8-3.8.4-7.7-2-2.6-5.3-4.5"/>
      <path class="cls-10" d="M127.5,368.7l8.9,4.8s3-2.5,1.3-7-2-3.5-6.1-5.4"/>
      <path class="cls-10" d="M166.8,406l-2.9,4.9c-3-2-5.2-2.8-7.1-2.7-4.5,0-6.3,4.4-6.3,4.4l8.8,5-3,5.5"/>
      <path class="cls-10" d="M147.4,395.6l-2.9,4.9c-3-2-5.2-2.8-7.1-2.7-4.5,0-6.3,4.4-6.3,4.4l8.8,5-3,5.5"/>
      <line class="cls-10" x1="217.2" y1="295.2" x2="223.2" y2="298.6"/>
      <rect class="cls-10" x="214.4" y="304" width="7.1" height="2.6" transform="translate(-154.4 350.5) rotate(-61.4)"/>
      <line class="cls-10" x1="225.3" y1="281" x2="231.4" y2="284.4"/>
      <polyline class="cls-10" points="251.5 196.4 243.2 211.5 246.1 213.1 248.6 214.4"/>
      <line class="cls-10" x1="254.2" y1="198.3" x2="246.4" y2="212.7"/>
      <line class="cls-10" x1="250" y1="199.4" x2="252.7" y2="201"/>
      <line class="cls-10" x1="248.4" y1="202.1" x2="251.2" y2="203.6"/>
      <line class="cls-10" x1="246.9" y1="205" x2="249.6" y2="206.5"/>
      <line class="cls-10" x1="244.8" y1="208.4" x2="247.6" y2="210"/>
      <rect class="cls-10" x="582.1" y="436.5" width="18.3" height="5" transform="translate(364.4 -261.7) rotate(35.5)"/>
      <path class="cls-10" d="M506.7,450l-8.5-5s1.7-4.4,6.3-4.5,3.4.4,6.4,2.4"/>
      <rect class="cls-10" x="526.2" y="427.1" width="9.5" height="9.5" transform="translate(270.4 -201) rotate(28.5)"/>
      <rect class="cls-10" x="502.7" y="414.4" width="9.5" height="9.5" transform="translate(261.4 -191.3) rotate(28.5)"/>
      <line class="cls-10" x1="226.2" y1="203.1" x2="237.7" y2="186.7"/>
      <line class="cls-10" x1="221.3" y1="200.2" x2="231.2" y2="182.1"/>
      <polyline class="cls-10" points="223.8 202 230 191.4 232.3 187.4"/>
      <path class="cls-10" d="M229.4,185.3s6.2,4.3,6.2,4.3"/>
      <line class="cls-10" x1="232.9" y1="193.4" x2="230" y2="191.4"/>
      <line class="cls-10" x1="223.8" y1="196.3" x2="226.2" y2="197.9"/>
      <path class="cls-10" d="M226.4,282.1s-2.7,4.3,1.4,8.4"/>
      <path class="cls-10" d="M144,339.2c-.4-.2-47.9-26.6-47.9-26.6l-8.8,15.2"/>
      <line class="cls-10" x1="82.3" y1="337.2" x2="73.4" y2="352.9"/>
      <path class="cls-10" d="M83.1,337.1l-10.9-5.8s.4-4.7,6.2-6.1c2.3-.5,4.9-.4,9.7,2.4"/>
      <path class="cls-7" d="M577.6,590.1v6.7l22.9,3.1,8.9-16.3s16.4-94.4,17.7-100.8-1.3-4.1-2.8-3.6-1.5.9-1.9,1.7c-3,5.9-18.3,35.4-18.7,36.1s-1.7,11-1.7,11l10.6,1.2-5.7,35.1-15.8,28.2-34.7-5.3"/>
      <polyline class="cls-7" points="559.5 581.5 588.6 586.9 602 561.5 607.6 528.7"/>
      <polyline class="cls-7" points="602 528.1 596.5 560.1 585.5 580.7 562.4 576.5"/>
      <polyline class="cls-7" points="563.6 573.9 572.7 575.5 573 578.5"/>
      <polyline class="cls-7" points="561.1 579.1 570.4 580.7 570.8 583.7"/>
      <polygon class="cls-7" points="591.9 596.6 608.1 565.8 610.6 565.8 607.6 583 599.1 597.8 591.9 596.6"/>
      <path class="cls-7" d="M604.8,526.4l12.2,1.3,7.4-42.4-1.4-.5-16.7,31.6c-.3.6-.6,1.3-.6,2l-.9,7.9Z"/>
      <line class="cls-10" x1="158.4" y1="433.3" x2="162" y2="426.6"/>
      <line class="cls-10" x1="151.8" y1="429.6" x2="155.4" y2="423"/>
      <line class="cls-10" x1="146.4" y1="426.7" x2="150" y2="420.1"/>
      <line class="cls-10" x1="161.6" y1="431.2" x2="127.7" y2="412.9"/>
      <rect class="cls-10" x="160.8" y="430.7" width="4.5" height="5.1" transform="translate(99.8 891.7) rotate(-151.5)"/>
      <line class="cls-10" x1="135.1" y1="420.5" x2="138.7" y2="413.9"/>
      <g>
        <path class="cls-10" d="M202.9,450.3c18.6,9.9,36.1,19.3,52.4,27.9l1.2-2.2-42.2-22.3"/>
        <path class="cls-10" d="M214.3,453.7c-3.4-1.8-6.6-3.5-10.2-5.3"/>
        <line class="cls-10" x1="204.6" y1="448.1" x2="192.7" y2="470.2"/>
        <line class="cls-10" x1="213.5" y1="493.2" x2="203.2" y2="512.6"/>
        <line class="cls-10" x1="255.4" y1="478.1" x2="244.8" y2="497.8"/>
        <g>
          <rect class="cls-10" x="171.8" y="527.5" width="8" height="5.5" transform="translate(267.9 -20.8) rotate(27.8)"/>
          <rect class="cls-10" x="178.9" y="531.2" width="8" height="5.5" transform="translate(270.4 -23.6) rotate(27.8)"/>
          <rect class="cls-10" x="186" y="535" width="8" height="5.5" transform="translate(273 -26.5) rotate(27.8)"/>
          <rect class="cls-10" x="193.1" y="538.7" width="8" height="5.5" transform="translate(275.6 -29.4) rotate(27.8)"/>
          <rect class="cls-10" x="200.1" y="542.4" width="8" height="5.5" transform="translate(278.1 -32.2) rotate(27.8)"/>
        </g>
        <g>
          <rect class="cls-10" x="182.7" y="506.3" width="8.3" height="5.5" transform="translate(259.2 -28.4) rotate(27.8)"/>
          <rect class="cls-10" x="190" y="510.1" width="8.3" height="5.5" transform="translate(261.9 -31.3) rotate(27.8)"/>
          <rect class="cls-10" x="197.3" y="514" width="8.3" height="5.5" transform="translate(264.5 -34.3) rotate(27.8)"/>
          <rect class="cls-10" x="204.7" y="517.9" width="8.3" height="5.5" transform="translate(267.2 -37.3) rotate(27.8)"/>
          <rect class="cls-10" x="212" y="521.7" width="8.3" height="5.5" transform="translate(269.8 -40.2) rotate(27.8)"/>
        </g>
        <line class="cls-10" x1="171.1" y1="530.5" x2="177.5" y2="518.6"/>
        <line class="cls-10" x1="206.4" y1="549.3" x2="213" y2="537.1"/>
        <path class="cls-10" d="M180.4,512l15-27.7-8.6-4.8,1.2-2.2,9,4.7s2.7-3.9.3-7.7-1.8-2.4-5.1-4.1"/>
        <line class="cls-10" x1="185.2" y1="502.6" x2="222.1" y2="522"/>
        <path class="cls-7" d="M206.1,505.7c-.3-.2-.6-.4-.9-.5-2.4-1.3-4.8-1.5-5.4-.4s.9,3,3.3,4.3.6.3,1,.5l2.1-3.9Z"/>
        <g>
          <rect class="cls-7" x="188.2" y="494.3" width="6.7" height="9" transform="translate(260.2 -31.1) rotate(28.4)"/>
          <circle class="cls-17" cx="189.8" cy="496.6" r=".6"/>
          <circle class="cls-17" cx="188.9" cy="498.2" r=".6"/>
          <ellipse class="cls-7" cx="190.6" cy="498.3" rx="2.9" ry="2" transform="translate(-338.4 429) rotate(-61.6)"/>
        </g>
        <line class="cls-10" x1="204.3" y1="488.2" x2="222.6" y2="498.3"/>
        <path class="cls-7" d="M205,510.2c.3.2.6.4.9.5,2.4,1.3,4.8,1.5,5.4.4s-.9-3-3.3-4.3-.6-.3-1-.5l-2.1,3.9Z"/>
        <g>
          <rect class="cls-7" x="218.6" y="510.5" width="6.7" height="9" transform="translate(172.3 1073.5) rotate(-151.6)"/>
          <circle class="cls-17" cx="223.7" cy="517.2" r=".6"/>
          <circle class="cls-17" cx="224.6" cy="515.6" r=".6"/>
          <ellipse class="cls-7" cx="222.9" cy="515.5" rx="2.9" ry="2" transform="translate(-336.6 466.5) rotate(-61.6)"/>
        </g>
        <line class="cls-10" x1="190.4" y1="511.5" x2="212.3" y2="522.9"/>
        <line class="cls-10" x1="211.4" y1="519.3" x2="210.2" y2="521.9"/>
        <line class="cls-1" x1="193.7" y1="510" x2="192.5" y2="512.6"/>
        <path class="cls-10" d="M260.7,488.9c1.8-3.2,2.5-5.1,2.4-7-.2-4.5-4.7-6.1-4.7-6.1l-4.6,9-1.3-.7"/>
        <path class="cls-10" d="M200.4,456.2l-1.8-.9,4.9-8.6s-3.7-2.9-7.7-.7-2.8,2.5-4.7,5.8l-5.2-3"/>
        <path class="cls-10" d="M223.1,498c-1.9,3.1-1.6,5.2-1.6,5.8.2,4.5,4.7,6.1,4.7,6.1l4-7.8,2.9,1.7"/>
        <path class="cls-10" d="M204.4,487.6c-1.8,3-2.6,4.5-4.2,5.6-3.8,2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
        <path class="cls-10" d="M245,498.4c-3.4-1.9-4.9-2.5-6.8-2.5-4.5,0-6.3,4.5-6.3,4.5l8.9,4.9-1.1,1.9-7.6-4-14.7,27.6"/>
        <path class="cls-10" d="M217.4,530.2l8.9,4.8s-1.7,4.4-6.2,4.5-4.3-1.1-7.5-2.8"/>
        <path class="cls-10" d="M180.4,511.4l-9-4.6s-2.7,3.9-.2,7.7,3.3,3,6.7,4.7"/>
        <polyline class="cls-10" points="196.8 462.6 201.4 465.2 206.1 456.7 248.5 479.2 243.9 487.7 248.3 490.3"/>
        <polyline class="cls-10" points="200.1 463.9 205.4 454.3 251.3 478.2 245.5 488.8"/>
        <line class="cls-10" x1="198.3" y1="460.4" x2="200.8" y2="461.8"/>
        <line class="cls-10" x1="199.7" y1="458.2" x2="202.1" y2="459.6"/>
        <line class="cls-10" x1="200.9" y1="455.8" x2="203.3" y2="457.2"/>
        <line class="cls-10" x1="202.1" y1="453.6" x2="204.5" y2="454.9"/>
        <line class="cls-10" x1="247.1" y1="486.4" x2="249.6" y2="487.8"/>
        <line class="cls-10" x1="248.5" y1="484.2" x2="250.9" y2="485.6"/>
        <line class="cls-10" x1="249.7" y1="481.8" x2="252.1" y2="483.2"/>
        <line class="cls-10" x1="250.9" y1="479.6" x2="253.3" y2="480.9"/>
      </g>
      <path class="cls-5" d="M797.6,544.2l-5.9,7.4,8.8,6.1s-4.3,6.8-11.6,1.8l-2-1.4-5.6,8"/>
      <path class="cls-5" d="M815,556.8l-5.9,7.4,8.8,6.1s-4.3,6.8-11.6,1.8l-2-1.4-5.6,8"/>
      <path class="cls-5" d="M834.1,602.3l-1.7-1.1,6-8.6s-6.4-4.9-11.5,2.3l-1.5,2.1"/>
      <path class="cls-5" d="M736.9,636.5l2.8,1.5,5.1-9.4s7.2,3.5,3,11.3l-1,1.8"/>
      <path class="cls-10" d="M731.7,618.6l-1.4-.8c-7.7-4.4-3.4-11.2-3.4-11.2l8,4.4.7-1.1,29.4-55.2"/>
      <path class="cls-5" d="M693.4,640.2l-2.8-1.5-5.1,9.4s-7.2-3.6-3-11.3l1-1.8"/>
      <path class="cls-5" d="M708.4,611.3l2.8,1.6-4.8,8.1s6.8,4.3,11.2-3.3l.8-1.5"/>
      <path class="cls-5" d="M695.9,604.1l-1.6,2.8-9.3-5.2s-4.2,6.9,3.5,11.1l1.8,1"/>
      <line class="cls-10" x1="200.3" y1="213.5" x2="209.6" y2="218.5"/>
      <line class="cls-10" x1="184.9" y1="149.4" x2="161.4" y2="193.8"/>
    </g>
    <g id="areas">
      <polygon id="room_145" fill="#656565" class="cls-opacity" points="766.5 520.1 815.1 555 828.6 537.6 927.3 537.6 927.3 460 910.8 460 910.8 451.9 894.5 451.9 894.5 446.6 818.4 446.6 766.5 520.1"/>
      <polygon id="room_132" class="cls-13" points="1177.6 331.5 1177.6 348.9 1159 348.9 1159 400.4 1172.8 400.4 1172.8 417.3 1261.1 417.3 1261.1 332 1177.6 331.5"/>
      <rect id="middle_east_wing" class="cls-13" x="874.7" y="331.4" width="261.5" height="85.4"/>
      <rect id="room_114" class="cls-13" x="702.6" y="331.4" width="170.4" height="85.4"/>
      <polygon id="room_142" fill="#faa84f" class="cls-opacity" points="944.2 452.2 960.6 452.2 960.6 439.4 1009.6 439.4 1009.6 537.6 930.4 537.6 930.4 460.8 944.2 460.8 944.2 452.2"/>
      <polygon id="room_133" class="cls-13" points="1192.1 452.2 1208.5 452.2 1208.5 439.4 1257.5 439.4 1257.5 537.6 1178.2 537.6 1178.2 460.8 1192.1 460.8 1192.1 452.2"/>
      <polygon id="room_135" class="cls-13" points="1109.5 452.2 1125.8 452.2 1125.8 439.4 1174.8 439.4 1174.8 537.6 1095.6 537.6 1095.6 460.8 1109.5 460.8 1109.5 452.2"/>
      <polygon id="room_139" class="cls-13" points="1078.7 452.2 1062.4 452.2 1062.4 439.4 1013.4 439.4 1013.4 537.6 1092.6 537.6 1092.6 460.8 1078.7 460.8 1078.7 452.2"/>
      <polygon id="room_129" class="cls-13" points="1126.7 300 1143.1 300 1143.1 312.8 1192.1 312.8 1192.1 214.6 1112.8 214.6 1112.8 291.4 1126.7 291.4 1126.7 300"/>
      <polygon id="room_127" class="cls-13" points="1096 300 1079.6 300 1079.6 312.8 1030.6 312.8 1030.6 214.6 1109.8 214.6 1109.8 291.4 1096 291.4 1096 300"/>
      <polygon id="room_124" class="cls-13" points="962.7 300 979.1 300 979.1 312.8 1028.1 312.8 1028.1 214.6 948.9 214.6 948.9 291.4 962.7 291.4 962.7 300"/>
      <polygon id="room_119" class="cls-13" points="932.5 300 916.2 300 916.2 312.8 867.2 312.8 867.2 214.6 946.4 214.6 946.4 291.4 932.5 291.4 932.5 300"/>
      <polygon id="room_113" fill="#faa84f" class="cls-opacity" points="799 300 815.4 300 815.4 312.8 864.4 312.8 864.4 214.6 785.2 214.6 785.2 291.4 799 291.4 799 300"/>
      <polygon id="room_108" class="cls-13" points="585.8 280.5 601.9 283.2 599.8 295.9 648.1 304 664.3 207.1 586.2 194 573.5 269.8 587.2 272.1 585.8 280.5"/>
      <polygon id="room_111" fill="#ea4849" class="cls-opacity" points="768.7 300 752.4 300 752.4 312.8 703.4 312.8 703.4 214.6 782.6 214.6 782.6 291.4 768.7 291.4 768.7 300" />
      <polygon id="room_105" fill="#656565" class="cls-opacity" points="555.5 275.6 539.4 272.9 537.3 285.6 488.9 277.5 505.1 180.6 583.3 193.6 570.6 269.4 556.9 267.1 555.5 275.6"/>
      <polygon id="middle_west_wing" class="cls-13" points="489.8 300.6 487.5 326.6 601.7 406.8 638 412.8 650.7 329 644.8 327.9 643.5 336.4 626.8 333.4 628.1 325.5 489.8 300.6"/>
      <polygon id="room_175" class="cls-13" points="408.4 656.6 490.3 700 532 624.8 470.9 592.5 467.8 598.3 453.8 590.8 442.3 612.2 434.8 608 408.4 656.6"/>
      <polygon id="room_169" class="cls-13" points="207.6 550.6 289.5 594 331.2 518.8 270.1 486.5 267.1 492.2 253 484.8 241.5 506.2 234 502 207.6 550.6"/>
      <polygon id="room_172" class="cls-13" points="290.1 594.3 372.7 638.3 396.8 592 389.4 587.9 402.4 564.3 387.2 555.7 390.3 550.2 331.5 519.2 290.1 594.3"/>
      <polygon id="room_166" class="cls-13" points="87.3 487.3 169.9 531.2 194.1 485 186.7 480.9 199.7 457.2 184.5 448.7 187.6 443.2 128.8 412.1 87.3 487.3"/>
      <polygon id="front_office" class="cls-13" points="702.6 511.5 627.2 649.5 744.1 710.7 778.2 648.2 756.9 637 752.6 645 736.9 636.5 747.9 615.8 765.5 625.1 792.1 573.4 702.6 511.5"/>
      <polygon id="back_office" class="cls-13" points="766.1 625.4 792.8 574.1 906.5 652.4 846.8 765 745.4 711.4 786.2 636.2 766.1 625.4"/>
      <polygon id="lunchroom" class="cls-13" points="389.7 292.1 296.2 472.7 72.9 353.9 96.1 312.6 143.5 338.3 207.9 219.1 158.8 192.5 184.1 145.9 389.7 292.1"/>
      <polygon id="multi_purpose_room" fill="#6fa1d6" class="cls-opacity"  points="390.3 292.5 626.4 458.3 546 606.3 296.7 473 390.3 292.5"/>
      <path id="hallways" class="cls-18" d="M1155.5,418.1v-89.1h84.8v-114.9h-45.3v102h-494.2v-86.4l-37.1-3.2-13.3,80.7-164.2-28.3,15.9-98.6-104-17.8-6.6,38.5-100-16.6-13.6,24.2,340.3,240.3,12.8,7.7-82.6,153.5-401-214.3-9.1,17.1,401.4,213.4h0s72.8,38.9,72.8,38.9l89.2-160.8,99.6,69.8,13-17.2-53.9-38.9,58.2-79.1h438.9v-20.6h-102ZM639.7,414.6l-38.6-4.8-116.2-83.3,2.5-28.2,165.6,29.5h0c0,0-13.3,86.9-13.3,86.9ZM1137.5,418.1h-435s-1.8,0-1.8,0v-89.1h436.8v89.1Z"/>
    </g>
    <g id="text">
      <text class="cls-16" transform="translate(1200.6 499.4)"><tspan x="0" y="0">ROOM 133</tspan></text>
      <text class="cls-16" transform="translate(1117.8 499.4)"><tspan x="0" y="0">ROOM 135</tspan></text>
      <text class="cls-16" transform="translate(1031.9 499.4)"><tspan x="0" y="0">ROOM 139</tspan></text>
      <text class="cls-16" transform="translate(951.3 499.4)"><tspan x="0" y="0">ROOM 142</tspan></text>
      <text class="cls-12" transform="translate(841.1 493.3)"><tspan class="cls-20"><tspan x="0" y="0">ROOM 145</tspan></tspan><tspan class="cls-19"><tspan x="3.4" y="9">LIBRARY</tspan></tspan></text>
      <text class="cls-16" transform="translate(1193.9 372.2)"><tspan x="0" y="0">ROOM 132</tspan><tspan x="-6.1" y="9">MULTI-MEDIA</tspan><tspan x="2.6" y="18">ACTIVITY</tspan></text>
      <text class="cls-16" transform="translate(1021.4 376.6)"><tspan x="0" y="0">ROOM 126</tspan></text>
      <text class="cls-11" transform="translate(998.9 339.1) rotate(90)"><tspan x="0" y="0">ELECTRICAL</tspan></text>
      <text class="cls-15" transform="translate(990.4 403.5)"><tspan x="0" y="0">DATA</tspan></text>
      <text class="cls-14" transform="translate(973.5 377.8) rotate(90)"><tspan x="0" y="0">MECHANICAL</tspan></text>
      <text class="cls-15" transform="translate(939.6 357.3)"><tspan x="0" y="0">122</tspan></text>
      <text class="cls-15" transform="translate(966.5 357.3)"><tspan x="0" y="0">123</tspan></text>
      <text class="cls-12" transform="translate(731.8 373.3)"><tspan class="cls-20"><tspan x="0" y="0">ROOM 114</tspan></tspan><tspan class="cls-19"><tspan x="1" y="9">STEM LAB</tspan></tspan></text>
      <text class="cls-16" transform="translate(723 262.5)"><tspan x="0" y="0">ROOM 111</tspan></text>
      <text class="cls-16" transform="translate(804.5 262.5)"><tspan x="0" y="0">ROOM 113</tspan></text>
      <text class="cls-16" transform="translate(887.1 262.5)"><tspan x="0" y="0">ROOM 119</tspan></text>
      <text class="cls-16" transform="translate(967.8 262.5)"><tspan x="0" y="0">ROOM 124</tspan></text>
      <text class="cls-16" transform="translate(1051.3 262.5)"><tspan x="0" y="0">ROOM 127</tspan></text>
      <text class="cls-16" transform="translate(1131.9 262.5)"><tspan x="0" y="0">ROOM 129</tspan></text>
      <text class="cls-16" transform="translate(799 701.3) rotate(27.7)"><tspan x="0" y="0">ROOM 185</tspan><tspan x="-14.4" y="9">FACULTY LOUNGE</tspan></text>
      <text class="cls-16" transform="translate(832.4 652.9) rotate(27.7)"><tspan x="0" y="0">ROOM 187</tspan><tspan x="-4.2" y="9">WORKROOM</tspan></text>
      <text class="cls-15" transform="translate(738 667.9) rotate(27.7)"><tspan x="0" y="0">183</tspan><tspan x="-3.8" y="9">CONF</tspan></text>
      <text class="cls-12" transform="translate(655.4 642.4) rotate(27.7)"><tspan class="cls-19"><tspan x="0" y="0">179</tspan></tspan><tspan class="cls-20"><tspan x="-6.8" y="9">OFFICE</tspan></tspan></text>
      <text class="cls-12" transform="translate(663.1 608.9) rotate(27.7)"><tspan class="cls-19"><tspan x="0" y="0">178</tspan></tspan><tspan class="cls-20"><tspan x="-6.8" y="9">OFFICE</tspan></tspan></text>
      <text class="cls-12" transform="translate(698.8 556.1) rotate(27.7)"><tspan class="cls-19"><tspan x="0" y="0">177</tspan></tspan><tspan class="cls-20"><tspan x="-6.4" y="9">FRONT</tspan></tspan><tspan class="cls-20"><tspan x="-6.8" y="18">OFFICE</tspan></tspan></text>
      <text class="cls-16" transform="translate(426.8 449.6) rotate(27.7)"><tspan x="0" y="0">ROOM 147 </tspan><tspan x="-11.6" y="9">MULTI-PURPOSE</tspan><tspan x="8.4" y="18">ROOM</tspan></text>
      <text class="cls-16" transform="translate(515.6 495.9) rotate(27.7)"><tspan x="0" y="0">ROOM 149</tspan><tspan x="-12.4" y="9">MULTI-PURPOSE</tspan><tspan x="7.6" y="18">ROOM</tspan></text>
      <text class="cls-16" transform="translate(453.6 640.8) rotate(27.7)"><tspan x="0" y="0">ROOM 175</tspan></text>
      <text class="cls-16" transform="translate(329.9 574.5) rotate(27.7)"><tspan x="0" y="0">ROOM 172</tspan></text>
      <text class="cls-16" transform="translate(249.6 530.4) rotate(27.7)"><tspan x="0" y="0">ROOM 169</tspan></text>
      <text class="cls-16" transform="translate(126 466.6) rotate(27.7)"><tspan x="0" y="0">ROOM 166</tspan></text>
      <text class="cls-12" transform="translate(276.9 345.9) rotate(27.7)"><tspan class="cls-20"><tspan x="0" y="0">ROOM 156</tspan></tspan><tspan class="cls-19"><tspan x="-5.8" y="9">LUNCHROOM</tspan></tspan></text>
      <text class="cls-15" transform="translate(259.1 283.4) rotate(-62.2)"><tspan x="0" y="0">KITCHEN</tspan></text>
      <text class="cls-15" transform="translate(157.8 376) rotate(-62.2)"><tspan x="0" y="0">STORAGE</tspan></text>
      <text class="cls-15" transform="translate(232 252.2) rotate(-62.2)"><tspan x="0" y="0">KITCHEN</tspan></text>
      <text class="cls-15" transform="translate(509.9 402.5) rotate(28.5)"><tspan x="0" y="0">STORAGE</tspan></text>
      <text class="cls-16" transform="translate(598.5 241.9) rotate(10)"><tspan x="0" y="0">ROOM 108</tspan></text>
      <text class="cls-16" transform="translate(518.6 229.7) rotate(10)"><tspan x="0" y="0">ROOM 105</tspan></text>
      <text class="cls-15" transform="translate(517.4 325.4) rotate(7.2)"><tspan x="0" y="0">DATA</tspan></text>
      <text class="cls-16" transform="translate(545.6 350.3) rotate(9.4)"><tspan x="0" y="0">OFFICE</tspan></text>
      <text class="cls-16" transform="translate(589.4 354.6) rotate(9.4)"><tspan x="0" y="0">ROOM 139</tspan><tspan x="2.4" y="9">READING</tspan></text>
      <text class="cls-16" transform="translate(547.9 332.7) rotate(8)"><tspan x="0" y="0">OFFICE</tspan></text>
      <text class="cls-15" transform="translate(191 201.2) rotate(-62.2)"><tspan x="0" y="0">PANTRY</tspan></text>
      <text class="cls-15" transform="translate(552.5 686.3)"><tspan x="0" y="0">ENTRANCE</tspan></text>
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
    if (rightMenu) {
      rightMenu.setAttribute("style", "display: flex");
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

            polygon:hover {
              fill: #c0cfe06c;
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
