/* eslint-disable lit/no-template-arrow */
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
  mdiSend,
  mdiExitRun,
  mdiEyeOff,
  mdiHomeLock,
} from "@mdi/js";

import { css, CSSResultGroup, html, LitElement, PropertyValues } from "lit";

import "../../../components/ha-svg-icon";

import "../../../components/ha-dialog";

import "./map/right-navigation";

import { sortPersonsByStatus } from "../../../util/sorting-utils";

import { HomeAssistant } from "../../../types";

const personAssigned = {
  room_111: {
    persons: ["eli_lazos", "grace_lewis", "james_davis"],
  },
  room_113: {
    persons: ["ashley_blonde", "benjamin_wilson", "clay_targaryen"],
  },
  room_119: {
    persons: ["juan_dela_cruz", "lucas_anderson"],
  },
  room_124: {
    persons: ["oliver_brown", "rod_stewart"],
  },
  room_105: {
    persons: ["zach_doe", "zachy_eigo"],
  },
  room_114: {
    persons: ["allan_walker", "james_doe"],
  },
  room_126: {
    persons: ["love_doe", "mike_doe"],
  },
};

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

  @state() private roomsEntities: string[] = [];

  @state() private clickedRoom: string = "";

  @state() private hasNotOkayRoom: boolean = false;

  updated(changedProperties: Map<string, unknown>) {
    super.updated(changedProperties);

    const roomAttributes = this.roomAttributes as Record<string, any>;

    Object.keys(roomAttributes).forEach((roomKey) => {
      const parsedValue = roomAttributes[roomKey];

      if (parsedValue && parsedValue.state) {
        const svgAttribute = parsedValue.attributes;

        const svgElement = this.shadowRoot?.querySelector(
          `#${svgAttribute.friendly_name}`
        ) as SVGElement;

        const svgElementStatus = this.shadowRoot?.querySelector(
          `#status_${svgAttribute.friendly_name}`
        ) as SVGElement;

        if (svgElement) {
          const fillColor =
            stateToColorMap[parsedValue.state as keyof typeof stateToColorMap];

          if (fillColor) {
            svgElement.removeAttribute("class");
            svgElement.setAttribute("fill", fillColor);
            svgElement.style.setProperty("opacity", "1");
          }

          if (svgElementStatus && parsedValue.state !== "0") {
            svgElementStatus.style.setProperty("opacity", "1");

            const bgStatusGroup = svgElementStatus?.querySelector(
              "#bg_status"
            ) as SVGGElement;

            if (bgStatusGroup) {
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
                `#bg_status_icon_${parsedValue.state}`
              ) as SVGPathElement;

              if (pathElement) {
                pathElement.style.setProperty("opacity", "1");
                pathElement.setAttribute("fill", fillColor);
              }

              if (pathElementIcon) {
                pathElementIcon.setAttribute("style", "opacity: 1;");
              }
            }
          }

          // console.log("[bgStatusGroup ::>]", {
          //   roomKey,
          //   bgStatusGroup,
          //   svgElementStatus,
          // });

          const commandGroup = svgElementStatus?.querySelector(
            "#command"
          ) as SVGGElement;

          if (commandGroup && parsedValue.command) {
            commandGroup.setAttribute("style", "opacity: 1;");
          }
        }
      }
    });
  }

  connectedCallback() {
    super.connectedCallback();
    this._getStoredValue();
    this._subscribeToStateChanges();
  }

  private _getStoredValue() {
    this.roomsEntities = Object.keys(this.hass.states).filter((entityId) =>
      entityId.startsWith("room.room")
    );

    this.roomsEntities.forEach((entityId) => {
      const roomEntity = this.hass.states[entityId];

      if (roomEntity) {
        try {
          this.roomAttributes[entityId] = roomEntity;
        } catch (err) {
          this.handleError(err);
        }
      }
    });

    Object.keys(personAssigned).forEach(async (roomKey) => {
      const roomId = `room.` + roomKey;

      if (this.roomAttributes[roomId]) {
        const personStates = await Promise.all(
          personAssigned[roomKey].persons.map(
            (person: string) => this.hass.states[`person.` + person]
          )
        );
        const sortedPersonStates = sortPersonsByStatus(
          personStates.filter((personState) => !!personState)
        );

        this.roomAttributes[roomId].persons = sortedPersonStates;
      }
    });

    this.checkRoomsForNotOkayStatus();
  }

  private checkRoomsForNotOkayStatus() {
    this.hasNotOkayRoom = Object.values(this.roomAttributes).some(
      (room) => room.state !== ""
    );
  }

  private handleError(error: any) {
    throw error("Error fetching room entity attributes:", error);
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

        if (message.type === "event" && message.event?.c) {
          const rooms = message.event.c;

          Object.keys(rooms).forEach((roomKey) => {
            const updatedRoom = rooms[roomKey];

            if (updatedRoom && updatedRoom["+"].s) {
              const newResponse = updatedRoom["+"].s;

              this.roomAttributes = {
                ...this.roomAttributes,
                [roomKey]: {
                  ...this.roomAttributes[roomKey],
                  state: newResponse,
                },
              };

              this.updatedCommand = newResponse;

              if (this.onStatusUpdated) {
                this.onStatusUpdated();
              }

              this.requestUpdate();
            }
          });
        }
      });
    }
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
        <div
          class="svg-map ${this.hasNotOkayRoom}"
          style=${this.hasNotOkayRoom ? "width: 75%" : ""}
        >
          <div class="map-name">
            <h2>Campus Map</h2>
          </div>
          <div id="svg-container"></div>
        </div>

        <div
          class="right-menu"
          id="right-menu"
          style=${this.hasNotOkayRoom ? "display: flex" : ""}
        >
          <map-right-navigation
            .hass=${this.hass}
            .roomAttributes=${this.roomAttributes}
            .clickedRoom=${this.clickedRoom}
          ></map-right-navigation>
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
      throw e.body?.message || "Unknown error";
    }
  }

  private _closeDialog() {
    this.dialogOpen = false;
  }

  protected firstUpdated(_changedProperties: PropertyValues) {
    // this.addAccordionListeners();
    this._addSvgMap();
  }

  private _addSvgMap() {
    const svgMap = `<svg version="1.2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1368 796" width="100%" height="796">
	<title>official-map-v3dot2-svg-svg</title>
	<style>
		tspan { white-space:pre }
		.s0 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10 }
		.s1 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: 1.1 }
		.s2 { fill: #6bc4c7 }
		.s3 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: 2 }
		.s4 { fill: none;stroke: #6bc4c7;stroke-miterlimit:10;stroke-width: .8 }
		.s5 { opacity: 0;fill: #ffffff }
		.s6 { opacity: 0;fill: #68cef5 }
		.t7 { font-size: 9px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.t8 { font-size: 7px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.t9 { font-size: 6px;fill: #ffffff;font-weight: 700;font-family: "SourceSansPro-Bold", "Source Sans Pro" }
		.s10 { fill: #000000 }
		.s11 { fill: #feca57;stroke: #ffffff;stroke-miterlimit:10;stroke-width: 1.4 }
		.s12 { fill: #231f20 }
		.s13 { fill: #ea4849;stroke: #ffffff;stroke-miterlimit:10;stroke-width: 1.4 }
		.s14 { fill: #ffffff }
		.bg_status_color { opacity: 0 }
		#areas .s5 { fill: #656565 }
	</style>
	<g>
		<g id="floorplan">
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m1128.5 301.5h-3.1v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1143.1 302.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1182.4 301.1h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m1159.5 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1151.5 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1167.1 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1173.3 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1157.7 305.8h24.7"/>
				<path fill-rule="evenodd" class="s1" d="m1143.1 305.8h10.1"/>
				<path fill-rule="evenodd" class="s1" d="m1153.2 302.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1128.5 302.8h-3.1-0.5v-1.7h3.6z"/>
				<path class="s2" d="m1143.6 302.8h-6.8-1.1v-1.7h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m1128 302.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m964.7 301.5h-3.1v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m979.3 302.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1018.6 301.1h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m995.7 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m987.7 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1003.3 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1009.5 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m994.2 305.8h24.4"/>
				<path fill-rule="evenodd" class="s1" d="m979.3 305.8h10.1"/>
				<path fill-rule="evenodd" class="s1" d="m989.4 302.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m964.7 302.8h-3.1-0.5v-1.7h3.6z"/>
				<path class="s2" d="m979.8 302.8h-6.8-1.1v-1.7h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m964.3 302.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m801 301.5h-3.2v-7.5h-13.4v-78h80.1v94.2h-49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m815.5 302.2h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m854.8 301.1h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m831.9 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m823.9 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m839.5 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m845.7 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m830.2 305.8h24.6"/>
				<path fill-rule="evenodd" class="s1" d="m815.5 305.8h10.5"/>
				<path fill-rule="evenodd" class="s1" d="m825.6 302.2h4.5v5.1h-4.5z"/>
				<path class="s2" d="m801 302.8h-3.2-0.5v-1.7h3.7z"/>
				<path class="s2" d="m816 302.8h-6.8-1.1v-1.7h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m800.5 302.2v8.4c0 0 8.2 1.6 8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m766.1 301.5h3.1v-7.5h13.4v-78h-80v94.2h48.9v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m751.6 310h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m712.2 309.4h-9v-8.3h9z"/>
				<path fill-rule="evenodd" class="s1" d="m735.1 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m743.1 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m727.5 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m721.3 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m736.9 305.8h-24.7"/>
				<path fill-rule="evenodd" class="s1" d="m751.5 305.8h-9.9"/>
				<path fill-rule="evenodd" class="s1" d="m741.4 307.2h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m766.1 302.8h3.1 0.5v-1.7h-3.6z"/>
				<path class="s2" d="m751 302.8h6.8 1.1v-1.7h-7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m766.6 302.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m929.9 301.5h3.1v-7.5h13.4v-78h-80.1v94.2h49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m915.3 310h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m876 309.4h-9v-8.3h9z"/>
				<path fill-rule="evenodd" class="s1" d="m898.9 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m906.9 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m891.3 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m885.1 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m900.9 305.8h-24.9"/>
				<path fill-rule="evenodd" class="s1" d="m915.3 305.8h-10.1"/>
				<path fill-rule="evenodd" class="s1" d="m905.2 305.8v-3.6h-4.6v5h4.6z"/>
				<path class="s2" d="m929.9 302.8h3.1 0.5v-1.7h-3.6z"/>
				<path class="s2" d="m914.8 302.8h6.8 1.1v-1.7h-7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m930.4 302.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m1093.6 301.5h3.2v-7.5h13.4v-78h-80.1v94.2h49v-8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1079.1 310h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1039.8 309.4h-9v-8.3h9z"/>
				<path fill-rule="evenodd" class="s1" d="m1062.7 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1070.7 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1055.1 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1048.9 302.4v7.6"/>
				<path fill-rule="evenodd" class="s1" d="m1064.4 305.8h-24.6"/>
				<path fill-rule="evenodd" class="s1" d="m1079.1 305.8h-10.2"/>
				<path fill-rule="evenodd" class="s1" d="m1069 307.2h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m1093.6 302.8h3.2 0.5v-1.7h-3.7z"/>
				<path class="s2" d="m1078.6 302.8h6.8 1.1v-1.7h-7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m1094.1 302.2v8.4c0 0-8.2 1.6-8.1-8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m1076.6 453.4h3.1v7.5h13.4v78h-80v-94.2h49v8.7"/>
				<path fill-rule="evenodd" class="s0" d="m1062 452.7h-39.3v-7.8h39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1022.7 453.8h-9v-8.3h9z"/>
				<path fill-rule="evenodd" class="s0" d="m1045.6 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1053.7 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1038 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1031.9 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1047.4 449.1h-24.6"/>
				<path fill-rule="evenodd" class="s0" d="m1062.1 449.1h-9.8"/>
				<path fill-rule="evenodd" class="s0" d="m1051.9 452.8h-4.5v-5.1h4.5z"/>
				<path class="s2" d="m1076.6 452.1h3.1 0.5v1.8h-3.6z"/>
				<path class="s2" d="m1061.5 452.1h6.8 1.2v1.8h-8z"/>
				<path fill-rule="evenodd" class="s0" d="m1077.1 452.8v-8.4c0 0-8.2-1.6-8.1 8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m1195.7 453.4h-3.1v7.5h-13.4v78h80v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1210.2 445h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1249.5 445.6h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m1226.7 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1218.6 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1234.3 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1240.4 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1224.9 449.1h24.6"/>
				<path fill-rule="evenodd" class="s1" d="m1220.3 447.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1195.7 452.1h-3.1-0.5v1.8h3.6z"/>
				<path class="s2" d="m1210.7 452.1h-6.8-1.1v1.8h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m1195.2 452.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
				<path fill-rule="evenodd" class="s0" d="m1209.8 449.1h10.4"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m1112.6 453.4h-3.1v7.5h-13.4v78h80.1v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m1127.2 445h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1166.5 445.6h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m1143.6 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1135.6 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1151.2 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m1157.4 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m1127.2 449.1h10.3"/>
				<path fill-rule="evenodd" class="s0" d="m1141.6 449.1h34"/>
				<path fill-rule="evenodd" class="s1" d="m1137.3 447.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m1112.6 452.1h-3.1-0.5v1.8h3.6z"/>
				<path class="s2" d="m1127.7 452.1h-6.8-1.1v1.8h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m1112.1 452.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m946.6 453.4h-6v8.6h-10.6v76.9h80.1v-94.2h-49v8.7"/>
				<path fill-rule="evenodd" class="s1" d="m961.1 445h39.3v7.8h-39.3z"/>
				<path fill-rule="evenodd" class="s0" d="m1000.4 445.6h9v8.3h-9z"/>
				<path fill-rule="evenodd" class="s1" d="m977.5 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m969.5 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m985.1 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s1" d="m991.3 452.5v-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m961.1 449.1h9.9"/>
				<path fill-rule="evenodd" class="s0" d="m975.7 449.1h33.7"/>
				<path fill-rule="evenodd" class="s1" d="m971.2 447.7h4.5v5.1h-4.5z"/>
				<path class="s2" d="m946.6 452.1h-3.1-0.6v1.8h3.7z"/>
				<path class="s2" d="m961.6 452.1h-6.8-1.1v1.8h7.9z"/>
				<path fill-rule="evenodd" class="s0" d="m946.1 452.8v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m1172.3 404.8v-1.6h-9.6v-53.3h14.8v-15.9h84.1v85.3h-89.3v-7"/>
			<path fill-rule="evenodd" class="s0" d="m1162.7 349.9h9.6v53.3h-9.6z"/>
			<path fill-rule="evenodd" class="s0" d="m1163 358.9h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1163 368.5h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1163 377.1h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1163 384.3h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1163 393.2h9.1"/>
			<path fill-rule="evenodd" class="s0" d="m1166.8 386.6h5.6v4.7h-5.6z"/>
			<path fill-rule="evenodd" class="s0" d="m1168.6 358.9v25.4"/>
			<path fill-rule="evenodd" class="s0" d="m1168.6 393.2v10.1"/>
			<path fill-rule="evenodd" class="s0" d="m1026 343.1l6.3 0.1v-9.8h35.2v84.5h-51.8v-74.8h2"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s0" d="m1015.7 410.2h9.2v7.7h-9.2z"/>
			<path fill-rule="evenodd" class="s0" d="m1067.5 411.2h-42.3"/>
			<path fill-rule="evenodd" class="s0" d="m1067.5 414.7h-42.3"/>
			<path fill-rule="evenodd" class="s0" d="m1034.4 411.2v6.7"/>
			<path fill-rule="evenodd" class="s0" d="m1032.6 414.7v3.2"/>
			<path fill-rule="evenodd" class="s0" d="m1042.1 411.2v6.7"/>
			<path fill-rule="evenodd" class="s0" d="m1059 411.2v3.5"/>
			<path fill-rule="evenodd" class="s3" d="m1032.6 338h34.9"/>
			<path class="s2" d="m1017.9 342.1h-2.3-0.4v1.7h2.7z"/>
			<path class="s2" d="m1032.8 342.1h-6.7-1.1v1.7h7.8z"/>
			<path fill-rule="evenodd" class="s0" d="m1017.4 342.7v-8.4c0 0 8.2-1.6 8.1 8.9"/>
			<path fill-rule="evenodd" class="s0" d="m985.8 333.4v84.5"/>
			<path fill-rule="evenodd" class="s0" d="m869.2 333.4v84.5"/>
			<path fill-rule="evenodd" class="s0" d="m996 333.4h19.2v84.5h-18.6"/>
			<path class="s2" d="m985.8 382.8h29.4v2.5h-29.4z"/>
			<path class="s2" d="m945.7 394.5h19v2.5h-19z"/>
			<path class="s2" d="m931.7 371.8h54.1v2.5h-54.1z"/>
			<path class="s2" d="m869.2 371.8h52.4v2.5h-52.4z"/>
			<path class="s2" d="m946.1 373.6v12.2h-2.5v-12.2z"/>
			<path class="s2" d="m946.1 393v15.4h-2.5v-15.4z"/>
			<path fill-rule="evenodd" class="s0" d="m959.3 333.8v39.3"/>
			<path fill-rule="evenodd" class="s0" d="m932.1 333.4v39.7"/>
			<path fill-rule="evenodd" class="s0" d="m1193.8 216h44.9v25.5h-44.9z"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 238.6v37.1"/>
			<path fill-rule="evenodd" class="s0" d="m1227.9 238.6v37.1"/>
			<path fill-rule="evenodd" class="s0" d="m1238.7 238.6v70.8"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 243.9h21.9"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 272.3h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 269.7h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 267.1h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 264.5h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 261.9h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 259.4h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 256.8h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 254.2h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 251.6h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 249h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1216.3 246.4h22.4"/>
			<path fill-rule="evenodd" class="s0" d="m1227.5 259.4l9.7-5.2"/>
			<path fill-rule="evenodd" class="s0" d="m1218.1 259.4l9.6-5.2"/>
			<path class="s2" d="m1196.8 275.3h-3.1-0.5v-1.7h3.6z"/>
			<path class="s2" d="m1216.7 275.7h-10.9-1.9v-1.8h12.8z"/>
			<path fill-rule="evenodd" class="s0" d="m1196.3 274.7v8.4c0 0 8.2 1.6 8.1-8.9"/>
			<path class="s2" d="m1219.8 318.7v5.7 1h-1.7v-6.7z"/>
			<path class="s2" d="m1242.7 310.8h-21.1-3.5v-1.8h24.6z"/>
			<path fill-rule="evenodd" class="s0" d="m1218.1 333h9.5c0 0 1.6-8.2-8.9-8.1"/>
			<path fill-rule="evenodd" class="s0" d="m1218.1 311.1h9.5c0 0 1.6 8.2-8.9 8.1"/>
			<path class="s2" d="m1241.2 318v5.3 0.9h-1.8v-6.2z"/>
			<path fill-rule="evenodd" class="s0" d="m1239.5 331.1h9.5c0 0 1.6-7.5-8.9-7.5"/>
			<path fill-rule="evenodd" class="s0" d="m1239.5 311.1h9.5c0 0 1.6 7.5-8.9 7.5"/>
			<path class="s2" d="m1262.2 422h-20.7-3.4v-2.5h24.1z"/>
			<path class="s2" d="m1238.6 331.5h23.5v2.5h-23.5z"/>
			<path class="s2" d="m1154.3 333.5h23.3v2.5h-23.3z"/>
			<path class="s2" d="m1237.2 432.6v-1c3.4 0 5.8-0.8 7.2-2.5 1.4-1.7 1.4-3.8 1.3-4.6h-8v-1h8.9v0.4c0 0.1 0.6 3.3-1.5 5.9-1.6 1.9-4.3 2.9-8 2.9z"/>
			<path class="s2" d="m1260.6 430.5v-1c3.4 0 5.8-0.8 7.2-2.5 1.4-1.7 1.4-3.8 1.3-4.6h-8v-1h8.9v0.4c0 0.1 0.6 3.3-1.5 5.9-1.6 1.9-4.3 2.9-8 2.9z"/>
			<path class="s2" d="m1237.2 432.3v1c3.4 0 5.8 0.8 7.2 2.5 1.4 1.7 1.4 3.8 1.3 4.6h-8v1h8.9v-0.4c0-0.1 0.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9z"/>
			<path class="s2" d="m1260.6 434.2v1c3.4 0 5.8 0.8 7.2 2.5 1.4 1.7 1.4 3.8 1.3 4.6h-8v1h8.9v-0.4c0-0.1 0.6-3.3-1.5-5.9-1.6-1.9-4.3-2.9-8-2.9z"/>
			<path class="s2" d="m1236.4 440.4h2.7v3.8h-2.7z"/>
			<path class="s2" d="m1236.4 419.5h2.7v5h-2.7z"/>
			<path class="s2" d="m1259.4 429.5h2.4v5.7h-2.4z"/>
			<path fill-rule="evenodd" class="s3" d="m699.7 234.9l-0.1-22.5h543.1v96.6"/>
			<path fill-rule="evenodd" class="s0" d="m1079.6 314.4h-100.3v-6.8"/>
			<path fill-rule="evenodd" class="s0" d="m915.9 314.4h-100.4v-6.9"/>
			<path fill-rule="evenodd" class="s0" d="m1193.8 241.5v72.9h-50.8v-7.6"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1115.2 310.8v8.4c0 0-8.2 1.6-8.1-8.9v-1.7c0.1 0-8.4 0-8.4 0v-12.5h25v12.5h-8.4v2.2"/>
				<path fill-rule="evenodd" class="s0" d="m1096.8 302.8v7.9h10.8"/>
				<path fill-rule="evenodd" class="s0" d="m1125.4 302.8v7.9h-10.7"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m933 302.4v7.8h10.3l0.1-2.1h-8.5v-12.5h24.9v12.5h-8.7"/>
				<path fill-rule="evenodd" class="s0" d="m951.4 307.6v11.2c0 0-8.2 1.6-8.1-8.9"/>
				<path fill-rule="evenodd" class="s0" d="m950.9 310.2h10.7v-7.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m787.7 310.3v-2.2h8.4v-12.5h-25v12.5h8.5v1.7c-0.2 10.5 8 8.9 8 8.9v-8.4"/>
				<path fill-rule="evenodd" class="s0" d="m769.2 302.4v7.8h10.8"/>
				<path fill-rule="evenodd" class="s0" d="m797.9 302.4v7.8h-10.7"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m1097.7 362.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1089.5 362.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1105 362.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1081.6 362.6c0-0.3 0-0.7 0-1.1 0-2.7-1-4.9-2.3-4.9-1.3 0-2.3 2.2-2.3 4.9 0 2.7 0 0.7 0 1.1h4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1089.8 349.1c-0.9 5.5-5 5.8-5 5.8v-5.7h-1.6v14.3"/>
			<path fill-rule="evenodd" class="s4" d="m1085.3 373.1c0 0.3 0 0.7 0 1.1 0 2.7 1 4.9 2.3 4.9 1.3 0 2.3-2.2 2.3-4.9 0-2.7 0-0.7 0-1.1h-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1077.5 373.1c0 0.3 0 0.7 0 1.1 0 2.7 1 4.9 2.3 4.9 1.3 0 2.3-2.2 2.3-4.9 0-2.7 0-0.7 0-1.1h-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1090.8 349.3h1.6v5.7c0 0 4.1-0.3 5-5.8"/>
			<path fill-rule="evenodd" class="s4" d="m1098.9 349.3h1.6v5.7c0 0 4.1-0.3 5-5.8"/>
			<path fill-rule="evenodd" class="s4" d="m1068.9 348.9h1.7v-8.1c0 0 8.3 0.1 8.2 8.4"/>
			<path class="s2" d="m1078.4 348.6h6.1v1.1h-6.1z"/>
			<path class="s2" d="m1089.4 348.6h3.4v1.1h-3.4z"/>
			<path class="s2" d="m1096.9 348.6h4v1.1h-4z"/>
			<path fill-rule="evenodd" class="s4" d="m1091.1 349.1v14.5"/>
			<path fill-rule="evenodd" class="s4" d="m1098.9 349.1v14.5"/>
			<path class="s2" d="m1067.4 362.9h39.6v1.5h-39.6z"/>
			<path class="s2" d="m1106.2 345h16.6v2h-16.6z"/>
			<path class="s2" d="m1106.2 385.5h16.6v2h-16.6z"/>
			<path class="s2" d="m1067.4 371.3h39.6v1.5h-39.6z"/>
			<path class="s2" d="m1069.2 397.3h65.1v1.5h-65.1z"/>
			<path class="s2" d="m1068.5 417.4h2.3v1.1h-2.3z"/>
			<path fill-rule="evenodd" class="s0" d="m1069 417.9v-82.9h64.9v14.1h1.8v-16.1h-68.2v84.9"/>
			<path fill-rule="evenodd" class="s4" d="m1094.2 372.8h2.1c0.8 0 1.4 0.6 1.4 1.4v0.1c0 0.8-0.6 1.4-1.4 1.4h-2.1c-0.8 0-1.4-0.6-1.4-1.4v-0.1c0-0.8 0.6-1.4 1.4-1.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1102 372.8h2.1c0.8 0 1.4 0.6 1.4 1.4v0.1c0 0.8-0.6 1.4-1.4 1.4h-2.1c-0.8 0-1.4-0.6-1.4-1.4v-0.1c0-0.8 0.6-1.4 1.4-1.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1098.9 372.5v7.3"/>
			<path fill-rule="evenodd" class="s4" d="m1097.4 378.6h3.1"/>
			<path fill-rule="evenodd" class="s0" d="m1106.7 345.7h2.3v40.8h-2.3z"/>
			<path fill-rule="evenodd" class="s0" d="m1068.7 387.1h2.4v8.6c0 0 8 0.1 8-8.6h5.3v-0.6"/>
			<path fill-rule="evenodd" class="s4" d="m1091.1 372.3v14.9h-1v-0.7c-0.9-5.5-5-5.8-5-5.8v5.7h-1.6v-14.3"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1098.2 444.1v2.2h8.8v12.5h-25v-12.5h8v-1.7c0-10.5 8.1-8.9 8.1-8.9v8.4"/>
				<path fill-rule="evenodd" class="s0" d="m1079.7 453.4v-9.2h10.8"/>
				<path fill-rule="evenodd" class="s0" d="m1109.5 453.4v-9.2h-11.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m929.3 444.6v2.2h8.8v12.5h-25v-12.5h8.1v-1.7c0-10.5 8.1-8.9 8.1-8.9z"/>
				<path fill-rule="evenodd" class="s0" d="m784.3 507.8l-5-3.6"/>
				<path fill-rule="evenodd" class="s0" d="m921.6 444.7h-10.8v17.3h15.7l0.4 76.9-99.3-0.4-30.3-21.6"/>
				<path fill-rule="evenodd" class="s0" d="m940.6 453.9v-9.2h-11.8"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m1187.1 445c0-8.9-8.1-8.5-8.1-8.5v8.2h-3.4"/>
			<path fill-rule="evenodd" class="s0" d="m1193.5 453.7v-9.2h-6.4"/>
			<path fill-rule="evenodd" class="s0" d="m1133.8 398.5v-16.2h1.9v37.3h-32.6v-1.7h30.8v-3.4"/>
			<path fill-rule="evenodd" class="s0" d="m1130.1 402.5h5.5v6h-5.5z"/>
			<path fill-rule="evenodd" class="s0" d="m1130.1 408.5h5.5v6h-5.5z"/>
			<path fill-rule="evenodd" class="s0" d="m1122.6 399.1h7.6v3.4c0 0.7 0 1.5 0 2.2 0 1.3-1 1.1-2 1-3.6-0.3-5.7-3-5.6-6.6z"/>
			<path class="s2" d="m1126.3 401.3h1.2v1.2h-1.2z"/>
			<path fill-rule="evenodd" class="s0" d="m1095.3 419.6h-16.8"/>
			<path fill-rule="evenodd" class="s0" d="m1071.5 419.6h-74.9"/>
			<path fill-rule="evenodd" class="s0" d="m931.7 419.6h34.9v-45.9"/>
			<path fill-rule="evenodd" class="s0" d="m988.4 419.6h-13.4"/>
			<path fill-rule="evenodd" class="s0" d="m989 417.9h-14"/>
			<path fill-rule="evenodd" class="s0" d="m923.2 417.9h-103v-11.7"/>
			<path fill-rule="evenodd" class="s0" d="m801.6 417.9h-98.5v-82.5h98.4v6.6h-91.1"/>
			<path fill-rule="evenodd" class="s0" d="m931.3 417.9h33.7v-44.2"/>
			<path fill-rule="evenodd" class="s0" d="m1093.2 398.7h18.4v4.1h-18.4z"/>
			<path fill-rule="evenodd" class="s0" d="m1091.8 398.5l-0.1 19.4h-13.1"/>
			<path fill-rule="evenodd" class="s0" d="m1093.2 398v19.9h1.8"/>
			<path fill-rule="evenodd" class="s0" d="m1094.8 419.6v-10.1c0 0 8.6 0.5 8.6 8.4"/>
			<path fill-rule="evenodd" class="s0" d="m1071.1 419.6v-10.1c0 0 8 0.4 8 8.4"/>
			<path class="s2" d="m1078.5 417.4h1v2.2h-1z"/>
			<path fill-rule="evenodd" class="s0" d="m1154.9 335.6c0 0-0.5 8.5 8.7 8.5v5.8"/>
			<path fill-rule="evenodd" class="s0" d="m988.4 333.1v-8.4c0 0 8.1-0.4 8.1 8.5"/>
			<path fill-rule="evenodd" class="s0" d="m830.2 333.2c0-8.9 8.1-8.5 8.1-8.5v8.4h10.3v23.3"/>
			<path fill-rule="evenodd" class="s0" d="m969.5 333.2c0 8.9-8.1 8.5-8.1 8.5v-8.4"/>
			<path fill-rule="evenodd" class="s0" d="m942.9 333.2c0 8.9-8.1 8.5-8.1 8.5v-8.4h-4.4v8.4c0 0-8.1 0.4-8.1-8.5"/>
			<path fill-rule="evenodd" class="s0" d="m859.5 333.2c0 8.9-8.1 8.5-8.1 8.5v-8.5h-2.5"/>
			<path fill-rule="evenodd" class="s0" d="m988.9 333.4h-20"/>
			<path fill-rule="evenodd" class="s0" d="m961.8 333.4h-19.5"/>
			<path fill-rule="evenodd" class="s0" d="m922.8 333.4h-63.8"/>
			<path fill-rule="evenodd" class="s0" d="m809.6 343h-6v-9.6h-102.3v86.2h102.2v-9"/>
			<path fill-rule="evenodd" class="s4" d="m702.6 223.5h488.8"/>
			<path fill-rule="evenodd" class="s0" d="m967.5 417.5v8.4c0 0 8.1 0.5 8.1-8.4"/>
			<path fill-rule="evenodd" class="s0" d="m988.5 417.5v8.4c0 0 8.1 0.4 8.1-8.5"/>
			<path fill-rule="evenodd" class="s0" d="m944.4 393.5h-8.4c0 0-0.4-8.1 8.5-8.1"/>
			<path fill-rule="evenodd" class="s0" d="m944.4 407.9c-8.9 0-8.5 8.1-8.5 8.1h8.4v2.1"/>
			<path fill-rule="evenodd" class="s4" d="m964.3 376.5c-0.3 0-0.7 0-1.1 0-2.7 0-4.9 1-4.9 2.3 0 1.3 2.2 2.3 4.9 2.3 2.7 0 0.7 0 1.1 0v-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m964.3 398.7c-0.3 0-0.7 0-1.1 0-2.7 0-4.9 1-4.9 2.3 0 1.3 2.2 2.3 4.9 2.3 2.7 0 0.7 0 1.1 0v-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m1109.5 360.2h6.7v12.4h-6.7z"/>
			<path fill-rule="evenodd" class="s4" d="m1111.9 362.3c1.3 0 2.4 1.1 2.4 2.4v3.4c0 1.3-1.1 2.4-2.4 2.4-1.3 0-2.4-1.1-2.4-2.4v-3.4c0-1.3 1.1-2.4 2.4-2.4z"/>
			<path class="s2" d="m1110.2 365.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path class="s2" d="m1110.2 368c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m964.6 395.1h-6.7v-9h6.7z"/>
				<path class="s2" d="m963.8 392.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m963.8 390.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m962.3 393.4c-1.1 0-2-1.3-2-2.9 0-1.6 0.9-2.9 2-2.9 1.1 0 2 1.3 2 2.9 0 1.6-0.9 2.9-2 2.9z"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s4" d="m964.3 414.3h-6.7v-9h6.7z"/>
				<path class="s2" d="m963.6 411.5c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m963.6 409.6c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m962.1 412.6c-1.1 0-2-1.3-2-2.9 0-1.6 0.9-2.9 2-2.9 1.1 0 2 1.3 2 2.9 0 1.6-0.9 2.9-2 2.9z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m809.1 343c0-10.8 7.7-9.8 7.7-9.8v8.4h1.7"/>
			<path fill-rule="evenodd" class="s0" d="m818.1 405.8h9.5c0 0 0.4-8.1-8.5-8.1"/>
			<path fill-rule="evenodd" class="s0" d="m808.9 410.1c0 8.9 8.1 8.5 8.1 8.5v-8.4h1.8"/>
			<path fill-rule="evenodd" class="s0" d="m923.2 419.6h-104.6v-13.8"/>
			<path fill-rule="evenodd" class="s0" d="m931.4 420.1v-10.7c0 0-8.1-0.4-8.1 8.5v2.1"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m885.8 393h27.4v7.1h-27.4z"/>
				<path fill-rule="evenodd" class="s0" d="m903.6 393.5v6.6"/>
				<path fill-rule="evenodd" class="s0" d="m894.5 393v7.1"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m885.3 350.4h26.1v7.1h-26.1z"/>
				<path fill-rule="evenodd" class="s0" d="m902.3 350.9v6.7"/>
				<path fill-rule="evenodd" class="s0" d="m893.6 350.4v7.2"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m875.9 414.7v-40.4"/>
			<path fill-rule="evenodd" class="s0" d="m872.4 417.9v-43.6"/>
			<path fill-rule="evenodd" class="s0" d="m875.9 383.6h-6.7"/>
			<path fill-rule="evenodd" class="s0" d="m872.4 381.7h-3.2"/>
			<path fill-rule="evenodd" class="s0" d="m875.9 391.2h-6.7"/>
			<path fill-rule="evenodd" class="s0" d="m875.9 408.2h-3.5"/>
			<path fill-rule="evenodd" class="s0" d="m869.2 414.7h19.8 8.3v3.2"/>
			<path fill-rule="evenodd" class="s0" d="m889 417.5v-2.8"/>
			<path fill-rule="evenodd" class="s0" d="m880.7 414.7v3.2"/>
			<path fill-rule="evenodd" class="s0" d="m874.2 372.9v-39.1"/>
			<path fill-rule="evenodd" class="s0" d="m871.5 377.4v-43.6"/>
			<path fill-rule="evenodd" class="s0" d="m874.5 343h-5.3"/>
			<path fill-rule="evenodd" class="s0" d="m869.2 339.8h38.4v-6.2"/>
			<path fill-rule="evenodd" class="s0" d="m874.5 350.6h-5.3"/>
			<path fill-rule="evenodd" class="s0" d="m871.2 368.2h36.4 11.6v4.2"/>
			<path fill-rule="evenodd" class="s0" d="m896.4 333.6v6.2"/>
			<path fill-rule="evenodd" class="s0" d="m885.3 333.4v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m907.3 372.4v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m896.4 368.4v4"/>
			<path fill-rule="evenodd" class="s0" d="m885.3 368.4v3.7"/>
			<path fill-rule="evenodd" class="s0" d="m851.4 393h-13.7v-17.7h6.8 6.9z"/>
			<path fill-rule="evenodd" class="s0" d="m845 393v-17.7"/>
			<path fill-rule="evenodd" class="s0" d="m837.7 384.6h13.7"/>
			<path fill-rule="evenodd" class="s0" d="m869.2 417.9h-7.9v-42.2h7.9v11.3z"/>
			<path fill-rule="evenodd" class="s0" d="m860.9 386.6h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m861.3 400.9h7.9"/>
			<path fill-rule="evenodd" class="s4" d="m1253 334v85.3"/>
			<path fill-rule="evenodd" class="s0" d="m699.6 254.6v-8.4c0 0-8.1-0.4-8.1 8.5"/>
			<path fill-rule="evenodd" class="s0" d="m698.7 235.1l-4.4-7.2c0 0-3.7 2.1-4 6.1"/>
			<path fill-rule="evenodd" class="s0" d="m710.4 335.6v82.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 351h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 359.4h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 363.6h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 367.8h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 371.7h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 381.4h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 385.6h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 389.8h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 393.7h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m703.1 402.1h7.3"/>
			<path fill-rule="evenodd" class="s0" d="m710.4 410.8h4.2 86.5v7.1"/>
			<path fill-rule="evenodd" class="s0" d="m714.6 417.9v-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m723.9 417.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m716.4 410.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m718.5 414.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m717.8 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m720 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m738.6 417.9v-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m748 417.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m740.5 410.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m742.5 414.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m741.8 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m744.1 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m764.6 417.9v-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m773.9 417.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m766.4 410.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m768.5 414.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m767.8 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m770 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m788.9 417.9v-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m798.2 417.9v-7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m790.7 410.9h4.8v4.8h-4.8z"/>
				<path class="s2" d="m792.8 414.2h0.7v1.8h-0.7z"/>
				<path class="s2" d="m792.1 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m794.3 415.8c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m797 334.9v7.1"/>
			<path fill-rule="evenodd" class="s0" d="m787.7 334.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m795.2 341.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m793.1 338.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m793.8 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m791.6 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m772.9 334.9v7.1"/>
			<path fill-rule="evenodd" class="s0" d="m763.6 334.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m771.1 341.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m769.1 338.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m769.8 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m767.5 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m747 334.9v7.1"/>
			<path fill-rule="evenodd" class="s0" d="m737.7 334.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m745.2 341.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m743.1 338.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m743.8 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m741.6 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m722.7 334.9v7.1"/>
			<path fill-rule="evenodd" class="s0" d="m713.4 334.9v7.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m720.9 341.9h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m718.8 338.7h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m719.5 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m717.3 338c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m735.4 410.9v7"/>
			<path fill-rule="evenodd" class="s0" d="m752.1 410.9v7"/>
			<path fill-rule="evenodd" class="s0" d="m760.7 410.9v7"/>
			<path fill-rule="evenodd" class="s0" d="m777.3 410.9v7"/>
			<path class="s2" d="m801.2 409.7h8.2v1.6h-8.2z"/>
			<path fill-rule="evenodd" class="s0" d="m734.8 335.1v7"/>
			<path fill-rule="evenodd" class="s0" d="m751.4 335.1v7"/>
			<path fill-rule="evenodd" class="s0" d="m760.1 335.1v7"/>
			<path fill-rule="evenodd" class="s0" d="m776.7 335.1v7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m801.8 362.8v26.1h-7.1v-26.1z"/>
				<path fill-rule="evenodd" class="s0" d="m801.3 379.8h-6.7"/>
				<path fill-rule="evenodd" class="s0" d="m801.8 371.2h-7.2"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m818.6 398.2v-64.8h12"/>
			<path fill-rule="evenodd" class="s0" d="m818.6 356.7h50.6"/>
			<path fill-rule="evenodd" class="s0" d="m827.1 364.4h41.5"/>
			<path fill-rule="evenodd" class="s0" d="m859.8 357v7.4"/>
			<path fill-rule="evenodd" class="s0" d="m851.4 356.7v7.3"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m842.3 364.2h-4.8v-4.8h4.8z"/>
				<path class="s2" d="m840.2 360.9h-0.7v-1.8h0.7z"/>
				<path class="s2" d="m840.9 360.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m838.7 360.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m842.3 360.7h26.9"/>
			<path fill-rule="evenodd" class="s0" d="m837.4 360.7h-14.6v30.5"/>
			<path fill-rule="evenodd" class="s0" d="m827.1 357v14.8 19.4h-8.2"/>
			<path fill-rule="evenodd" class="s0" d="m818.9 371.8h8.2"/>
			<path fill-rule="evenodd" class="s0" d="m818.6 381.4h8.2"/>
			<path fill-rule="evenodd" class="s0" d="m818.6 383.6h4.2"/>
			<path fill-rule="evenodd" class="s0" d="m856.7 357v3.9"/>
			<path fill-rule="evenodd" class="s0" d="m834.5 357v3.7"/>
			<path fill-rule="evenodd" class="s0" d="m846 357v3.7"/>
			<path fill-rule="evenodd" class="s0" d="m1261.6 442.8v99h-434l-13.3 18"/>
			<path fill-rule="evenodd" class="s0" d="m701.3 342.1h-5.8v69.1h5.8"/>
			<g>
				<path class="s1" d=""/>
				<path fill-rule="evenodd" class="s1" d="m587.5 283.2l-3.1-0.5 1.2-7.4-13.2-2.2 12.8-76.9 78.9 13.3-15.4 92.7-48.3-8.1 1.4-8.5"/>
				<path fill-rule="evenodd" class="s1" d="m602 285.8l38.8 6.4-1.3 7.7-38.8-6.4z"/>
				<path fill-rule="evenodd" class="s1" d="m640.9 291.2l8.9 1.5-1.4 8.2-8.9-1.5z"/>
				<path fill-rule="evenodd" class="s1" d="m617.9 289.1l-1.3 7.5"/>
				<path fill-rule="evenodd" class="s1" d="m610 287.8l-1.3 7.5"/>
				<path fill-rule="evenodd" class="s1" d="m625.4 290.4l-1.3 7.4"/>
				<path fill-rule="evenodd" class="s1" d="m631.4 291.4l-1.2 7.4"/>
				<path fill-rule="evenodd" class="s1" d="m615.6 292.2l24.3 4"/>
				<path fill-rule="evenodd" class="s1" d="m601.1 289.8l10.1 1.7"/>
				<path class="s2" d="m587.3 284.5l-3.1-0.5-0.5-0.1 0.3-1.8 3.5 0.6z"/>
				<path class="s2" d="m602.1 286.9l-6.7-1.1-1.1-0.2 0.3-1.7 7.8 1.3z"/>
				<path fill-rule="evenodd" class="s1" d="m586.9 283.7l-1.4 8.3c0 0 7.8 2.9 9.5-7.5"/>
				<path fill-rule="evenodd" class="s0" d="m611.9 287.4l4.5 0.7-0.8 5-4.5-0.7z"/>
			</g>
			<g>
				<path class="s0" d=""/>
				<path fill-rule="evenodd" class="s0" d="m553 277.3l3.1 0.6 1.2-7.4 13.2 2.2 12.8-76.8-78.9-13.3-15.5 92.9 48.3 8 1.5-8.5"/>
				<path fill-rule="evenodd" class="s1" d="m536.9 283.6l-38.7-6.4 1.2-7.7 38.8 6.5z"/>
				<path fill-rule="evenodd" class="s0" d="m498.3 276.6l-8.9-1.5 1.4-8.2 8.9 1.5z"/>
				<path fill-rule="evenodd" class="s1" d="m522.3 273.1l-1.3 7.5"/>
				<path fill-rule="evenodd" class="s1" d="m530.2 274.5l-1.2 7.4"/>
				<path fill-rule="evenodd" class="s1" d="m514.8 271.9l-1.2 7.4"/>
				<path fill-rule="evenodd" class="s1" d="m508.7 270.9l-1.2 7.4"/>
				<path fill-rule="evenodd" class="s1" d="m523.5 276.8l-24.3-4.1"/>
				<path fill-rule="evenodd" class="s1" d="m538 279.2l-10.3-1.7"/>
				<path fill-rule="evenodd" class="s1" d="m527.5 279.3l-4.5-0.7 0.9-5 4.4 0.7z"/>
				<path class="s2" d="m552.8 278.6l3.1 0.6h0.5l0.2-1.7-3.5-0.6z"/>
				<path class="s2" d="m537.9 276.2l6.7 1.1 1.2 0.2 0.2-1.8-7.8-1.3z"/>
				<path fill-rule="evenodd" class="s0" d="m553.4 278.1l-1.4 8.3c0 0-8.4 0.2-6.6-10.1"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m473.7 207.4c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m475.1 199.3c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m472.5 214.7c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m476.4 191.6c0.3 0 0.7 0.2 1 0.2 2.7 0.4 5-0.2 5.2-1.4 0.2-1.2-1.8-2.6-4.5-3-2.7-0.4-0.7 0-1-0.1l-0.7 4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m488.3 201.9c-5.3-1.8-4.9-5.9-4.9-5.9l5.6 0.9 0.3-1.6-14.1-2.4"/>
			<path fill-rule="evenodd" class="s4" d="m465.3 193.5c-0.3 0-0.7-0.2-1-0.2-2.7-0.4-5 0.2-5.2 1.4-0.2 1.2 1.8 2.6 4.5 3 2.7 0.4 0.7 0 1 0.1l0.7-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m466.6 185.8c-0.3 0-0.7-0.2-1-0.2-2.7-0.4-5 0.2-5.2 1.4-0.2 1.2 1.8 2.6 4.5 3 2.7 0.4 0.7 0 1 0.1l0.7-4.4z"/>
			<path fill-rule="evenodd" class="s4" d="m487.9 202.8l-0.3 1.6-5.6-0.9c0 0-0.4 4.1 4.9 5.9"/>
			<path fill-rule="evenodd" class="s4" d="m486.6 210.9l-0.3 1.6-5.6-0.9c0 0-0.4 4.1 4.9 5.9"/>
			<path fill-rule="evenodd" class="s4" d="m492.1 180.5l-0.4 2.5 8 1.3c0 0-1.5 8.2-9.6 6.7"/>
			<path class="s2" d="m490.5 190.6l-1 6-1.1-0.2 1-6z"/>
			<path class="s2" d="m488.8 201.5l-0.6 3.4-1.1-0.2 0.6-3.4z"/>
			<path class="s2" d="m487.5 209l-0.6 3.9-1.1-0.2 0.7-3.9z"/>
			<path class="s2" d="m486.2 217l-0.3 1.8-1.1-0.2 0.3-1.8z"/>
			<path fill-rule="evenodd" class="s4" d="m488.1 203.2l-14.4-2.4"/>
			<path fill-rule="evenodd" class="s4" d="m486.8 210.9l-14.4-2.4"/>
			<path class="s2" d="m478.1 178.1l-6.4 38.4-1.5-0.2 6.4-38.5z"/>
			<path class="s2" d="m482.3 246.3l-2.8 16.4-1.9-0.3 2.7-16.4z"/>
			<path class="s2" d="m442.3 239.7l-2.8 16.3-1.9-0.3 2.7-16.4z"/>
			<path class="s2" d="m470 176.6l-6.5 38.5-1.5-0.3 6.5-38.4z"/>
			<path class="s2" d="m451.6 215.8l-4.2 25-1.5-0.3 4.2-24.9z"/>
			<path class="s2" d="m480.7 232.1l-2.3 13.8-1.5-0.2 2.3-13.8z"/>
			<path fill-rule="evenodd" class="s4" d="m464.1 202.3l-0.4 2.1c-0.1 0.7-0.8 1.3-1.6 1.1h-0.1c-0.8-0.1-1.3-0.8-1.2-1.6l0.4-2.1c0.1-0.7 0.8-1.2 1.6-1.1h0.1c0.8 0.1 1.3 0.8 1.2 1.6z"/>
			<path fill-rule="evenodd" class="s4" d="m462.8 210l-0.4 2c-0.1 0.8-0.8 1.3-1.6 1.2h-0.1c-0.7-0.2-1.3-0.9-1.1-1.7l0.3-2c0.1-0.8 0.9-1.3 1.6-1.2h0.1c0.8 0.2 1.3 0.9 1.2 1.7z"/>
			<path fill-rule="evenodd" class="s4" d="m463.7 207l-7.2-1.1"/>
			<path fill-rule="evenodd" class="s4" d="m457.9 204.5l-0.5 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m481.6 246.7l-0.4 2.3-40.2-6.7 0.4-2.3z"/>
			<path fill-rule="evenodd" class="s0" d="m488 219.6l-0.4 2.3-40.3-6.7 0.4-2.3z"/>
			<path fill-rule="evenodd" class="s0" d="m454.4 174.1l-0.5 3-8.5-1.4c0 0-1.4 7.9 7.2 9.3l-0.9 5.2h0.5"/>
			<path fill-rule="evenodd" class="s4" d="m465.2 199.3l-14.7-2.5 0.2-1h0.7c5.6 0.2 6.6-3.8 6.6-3.8l-5.6-0.9 0.3-1.6 14.1 2.4"/>
			<path fill-rule="evenodd" class="s4" d="m466.8 247.1l-1.1 6.6-12.2-2 1.1-6.6z"/>
			<path fill-rule="evenodd" class="s4" d="m464.3 249.1c-0.2 1.3-1.4 2.2-2.7 1.9l-3.4-0.5c-1.3-0.2-2.2-1.5-2-2.8 0.3-1.3 1.5-2.2 2.8-1.9l3.4 0.5c1.3 0.2 2.2 1.5 1.9 2.8z"/>
			<path class="s2" d="m461.7 247.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path class="s2" d="m459.7 247.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
			<path fill-rule="evenodd" class="s0" d="m448 236.7l30.1 5.1"/>
			<path fill-rule="evenodd" class="s0" d="m479.3 231.7l8.3 1.4c0 0 1.7-8-7-9.4l0.5-3"/>
			<path fill-rule="evenodd" class="s0" d="m358.6 197.7l-67.2-11.5-14.9 26.7"/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s0" d="m373.8 200.2l15.3 2.6 6.6-41.7 272.3 45.9-16.2 99.9-3.6-0.7"/>
			<path fill-rule="evenodd" class="s0" d="m391.4 206.1l6.6-41.7 45.1 7.8"/>
			<path fill-rule="evenodd" class="s0" d="m471.7 269.7l15.2 2.7 15.1-90.2-58.9-10-14.4 89.4 16 2.8"/>
			<path fill-rule="evenodd" class="s0" d="m394.3 187.8l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m394.3 190.7l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m393.3 193l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m392.9 195.3l20.8 3.3"/>
			<path fill-rule="evenodd" class="s0" d="m392.9 198l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m392.1 200.3l20.9 3.3"/>
			<path fill-rule="evenodd" class="s0" d="m391.4 202.8l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m391.4 205.4l20.8 3.3"/>
			<path fill-rule="evenodd" class="s0" d="m390.6 207.7l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m390.1 210.3l20.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m389.4 212.9l20.9 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m389.1 215.1l20.8 3.3"/>
			<path fill-rule="evenodd" class="s0" d="m388.9 218.1l20.8 3.4"/>
			<path class="s2" d="m414.7 189.2l2.3 0.4-6 35.6-2.3-0.4z"/>
			<path fill-rule="evenodd" class="s0" d="m404.7 186.2l-6.3 36.1"/>
			<path fill-rule="evenodd" class="s0" d="m391.6 204.5l10-2.7"/>
			<path fill-rule="evenodd" class="s0" d="m401.6 206.7l10.9-2.7"/>
			<path fill-rule="evenodd" class="s0" d="m416 191.4l23 4.2"/>
			<path fill-rule="evenodd" class="s0" d="m409.9 224l12.7 2.4"/>
			<path fill-rule="evenodd" class="s0" d="m422.1 226.1c-1.5 8.7 6.6 9.7 6.6 9.7l1.4-8.3 4 0.6"/>
			<path fill-rule="evenodd" class="s3" d="m664.3 229.6l21.3 3.5v52.3"/>
			<path fill-rule="evenodd" class="s3" d="m654.7 289.8l30.9 5.5v-2.8"/>
			<path fill-rule="evenodd" class="s0" d="m685.4 293l-6.1-5.5c0 0 2.5-3.8 7.1-1.7"/>
			<path fill-rule="evenodd" class="s0" d="m691.7 254.2h-5.2"/>
			<path fill-rule="evenodd" class="s0" d="m690.7 234h-4.2"/>
			<path fill-rule="evenodd" class="s0" d="m702.6 254.2h-3.5"/>
			<path fill-rule="evenodd" class="s0" d="m565.7 287.2l-8.9-1.6 2.3-12.7 24.2 4.2-2.4 12.8-8.2-1.4"/>
			<path fill-rule="evenodd" class="s1" d="m565.1 287.5l-1.4 8.3c0 0 7.8 2.9 9.5-7.5"/>
			<path fill-rule="evenodd" class="s0" d="m370.4 221.2l15.4 2.6 3.2-20.5"/>
			<path fill-rule="evenodd" class="s0" d="m344.7 195.3l-2.8 21 13.3 2.3"/>
			<path fill-rule="evenodd" class="s0" d="m374.3 200l1.6-8.3c0 0-7.7-3.1-9.7 7.2"/>
			<path fill-rule="evenodd" class="s0" d="m358.1 197.3l1.2-8.4c0 0 8.3-0.5 6.8 10"/>
			<path fill-rule="evenodd" class="s0" d="m371 220.8l1.6-8.3c0 0-7.7-3.1-9.7 7.2"/>
			<path fill-rule="evenodd" class="s0" d="m354.8 218.1l1.2-8.4c0 0 8.3-0.5 6.8 10"/>
			<path fill-rule="evenodd" class="s1" d="m644.8 329.9l6.4 1.2"/>
			<path fill-rule="evenodd" class="s1" d="m557.6 314.5l71 13.1"/>
			<path fill-rule="evenodd" class="s1" d="m523.2 308.5l27.6 4.8"/>
			<path fill-rule="evenodd" class="s1" d="m510.4 306.2l5.5 1"/>
			<path class="s1" d=""/>
			<path class="s1" d=""/>
			<path class="s1" d=""/>
			<path fill-rule="evenodd" class="s1" d="m545.5 369.6l49.7 35.1"/>
			<path fill-rule="evenodd" class="s1" d="m523.4 353.9l16.2 11.8"/>
			<path fill-rule="evenodd" class="s1" d="m517 349.4l-49.9-35.3 1.3-1.7"/>
			<path fill-rule="evenodd" class="s1" d="m489.8 302.6l-2.3 26"/>
			<path fill-rule="evenodd" class="s1" d="m513 306.8l-3.2 37.5"/>
			<path fill-rule="evenodd" class="s1" d="m547.1 312.7l-7.6 52.1"/>
			<path fill-rule="evenodd" class="s1" d="m582.2 318.7l-10.8 69.1"/>
			<path fill-rule="evenodd" class="s0" d="m645.3 329.8l-12.2 85.1"/>
			<path fill-rule="evenodd" class="s1" d="m607.9 390.2l-2.4 20.5"/>
			<path fill-rule="evenodd" class="s1" d="m593.2 387.1l-1 15.5"/>
			<path fill-rule="evenodd" class="s0" d="m650.7 331l-12.2 84.8-35.6-5.7-1.1-1.3-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path fill-rule="evenodd" class="s1" d="m572 383.9l64 10.9"/>
			<path fill-rule="evenodd" class="s1" d="m572 385.1l20.8 8.6"/>
			<path fill-rule="evenodd" class="s1" d="m510.4 337.5l32.3 4.9"/>
			<path fill-rule="evenodd" class="s1" d="m543.3 340.6l34.7 5.2"/>
			<path fill-rule="evenodd" class="s0" d="m580.8 327.2l8.9 1.5 1.4-7.8-8.8-1.7z"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m628.1 327.5l-37-6.4-1.2 7.7 37 6.3z"/>
				<path fill-rule="evenodd" class="s0" d="m612.6 325.1l-1.2 7.4"/>
				<path fill-rule="evenodd" class="s0" d="m620.1 326.4l-1.1 7.4"/>
				<path fill-rule="evenodd" class="s0" d="m605.4 323.8l-1.1 7.4"/>
				<path fill-rule="evenodd" class="s0" d="m599.6 322.8l-1.1 7.4"/>
				<path fill-rule="evenodd" class="s0" d="m614.1 328.7l-23.6-4"/>
				<path fill-rule="evenodd" class="s0" d="m627.6 331.1l-9.6-1.7"/>
				<path fill-rule="evenodd" class="s0" d="m618 329.4l0.6-3.5-4.3-0.8-0.8 5 4.3 0.7z"/>
			</g>
			<path fill-rule="evenodd" class="s1" d="m630.4 393.8l-0.7 5.2-2 15"/>
			<path fill-rule="evenodd" class="s1" d="m635.2 399.9l-27.6-4.2"/>
			<path fill-rule="evenodd" class="s1" d="m635.2 402.4l-5.5-0.8"/>
			<path fill-rule="evenodd" class="s1" d="m633.6 408.3l-5.5-0.8"/>
			<path fill-rule="evenodd" class="s1" d="m633.6 411.8l-5.5-0.8"/>
			<path fill-rule="evenodd" class="s1" d="m550.3 313.2l-1.7 10.1c0 0 4.5 1.3 7.4-2.2 2.9-3.5 1.8-3.4 2.1-7"/>
			<path fill-rule="evenodd" class="s1" d="m517.4 349.1l-6.5 7.5c0 0 3.1 3.6 7.4 2.2 4.3-1.4 3.6-2.1 5.8-5"/>
			<path fill-rule="evenodd" class="s1" d="m539 365.6l6.6-9.1c0 0 4.2 2.2 3.8 6.7-0.4 4.5-1.5 4.2-3.8 7"/>
			<path fill-rule="evenodd" class="s1" d="m515.4 307.6l1.4-10c0 0 4.7-0.1 6.5 4 1.8 4.1 0.8 3.9 0.1 7.4"/>
			<path fill-rule="evenodd" class="s1" d="m469.1 312.4l-8.4-5.5c0 0 1.9-4.3 6.5-4.2 4.6 0.1 4 1.1 6.8 3.1"/>
			<path fill-rule="evenodd" class="s1" d="m510.9 306.6l-1.2 10.2c0 0-4.7 0.2-6.6-3.9-1.9-4.1-0.8-4.9-0.1-8.5"/>
			<path fill-rule="evenodd" class="s1" d="m492 331.7l2.4-3.1 11.5 7.8-2.6 3.3"/>
			<path fill-rule="evenodd" class="s1" d="m488.1 326.3l22.8 1.1"/>
			<path fill-rule="evenodd" class="s1" d="m505.9 336.4l5-4.8"/>
			<path fill-rule="evenodd" class="s4" d="m488.3 323.7c0.3 0 0.7 0.1 1 0.1 2.7 0.2 5-0.6 5.1-1.8 0.1-1.2-2-2.4-4.7-2.7-2.7-0.3-0.7 0-1.1 0l-0.4 4.4z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m489.3 305.6l6.7 0.6-0.8 8.9-6.7-0.6z"/>
				<path class="s2" d="m490.1 309.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m489.9 311.1c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m493.9 310.4c-0.2 1.6-1.2 2.8-2.3 2.7-1.1-0.1-1.9-1.5-1.7-3.1 0.1-1.6 1.1-2.8 2.2-2.7 1.1 0.1 1.9 1.5 1.8 3.1z"/>
			</g>
			<path fill-rule="evenodd" class="s1" d="m473.5 305.5c0.6-1 1.9-3.4 2.8-4.3 0.9-0.9 2.1-0.7 3.3-0.5 6 1.1 12.1 2.2 18.1 3.2l5.6 1"/>
			<path fill-rule="evenodd" class="s0" d="m640.2 337.7l3.9 0.7"/>
			<path fill-rule="evenodd" class="s0" d="m626.9 335.1l6 1.1"/>
			<path fill-rule="evenodd" class="s1" d="m640.6 338.1l1.7-11.1c0 0-4.5-1.4-7.4 2.1-2.9 3.5-1.9 3.9-2.2 7.5"/>
			<path fill-rule="evenodd" class="s0" d="m355.5 268.7c103.9 73.2 222 156.3 271.6 191.2"/>
			<path fill-rule="evenodd" class="s0" d="m353.9 270.2c40.2 28.3 82.6 58.5 122 86.2 63.9 44.9 120.5 84.8 149.6 105.3"/>
			<path fill-rule="evenodd" class="s0" d="m339.6 260.8c-14.1-9.9-28.3-20.2-41.6-29.6l1.3-2.1c13.4 9.4 27.3 19.2 41.6 29.3"/>
			<path fill-rule="evenodd" class="s0" d="m613.2 471c2.4 1.3 3.9 2.1 5.8 3.2"/>
			<path fill-rule="evenodd" class="s0" d="m554.2 438.8c16.7 9.1 33.5 18.4 45.5 24.9"/>
			<path fill-rule="evenodd" class="s0" d="m504.9 411.8c12.3 6.7 24.1 13.2 35.2 19.3"/>
			<path fill-rule="evenodd" class="s0" d="m397.9 353.2c31.9 17.5 63.4 34.7 92.5 50.6"/>
			<path fill-rule="evenodd" class="s0" d="m196.7 243l28.6 15.7"/>
			<path fill-rule="evenodd" class="s0" d="m466.7 566.3c34 17.9 61.4 32.5 79.8 42.2"/>
			<path fill-rule="evenodd" class="s0" d="m200.1 425.3c24.3 12.9 50.1 26.6 75.8 40.2"/>
			<path fill-rule="evenodd" class="s0" d="m180.9 415.2c3.9 2.1 7.9 4.2 11.9 6.3"/>
			<path fill-rule="evenodd" class="s0" d="m170.2 409.5c-38.9-20.6-71.2-38.5-97.9-52.6l1.3-2.4 98.3 52.2"/>
			<path fill-rule="evenodd" class="s0" d="m384.8 548.4l5.1 2.7-5.9 10.4-11.5-6.2 5.3-10.3c-35.1-18.7-58.1-31-94.4-50.5l-5.9 10.3-12.3-7 5.6-10.3 5 2.9c0 0 3.4-6 5.5-7.2 3.9-2.3 7.7 0.7 7.7 0.7l-5.1 8.6"/>
			<path fill-rule="evenodd" class="s0" d="m184.1 440.4c2.1 1.2 6.2 3.4 6.2 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m82.3 490.8l44.2-81.4 4 2.1"/>
			<path fill-rule="evenodd" class="s0" d="m576.6 650.3c0 0-37.1-19.5-92.4-48.7l-5.4 9.9-13.3-6.8 5.3-10.2 6.1 3.2"/>
			<path fill-rule="evenodd" class="s0" d="m82.3 490.3c164.2 86.9 409.7 217.2 409.7 217.2l43-79"/>
			<path fill-rule="evenodd" class="s1" d="m626.7 459.6l-80.7 148.7"/>
			<path fill-rule="evenodd" class="s0" d="m440.4 552.6l19.2 10 1.8-3.1-19.3-10.2z"/>
			<path fill-rule="evenodd" class="s0" d="m623.5 457l-79.3 146.1-75.8-40-1.8 3.5c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3"/>
			<path fill-rule="evenodd" class="s1" d="m459.7 387.1l16.2-30.6"/>
			<path fill-rule="evenodd" class="s1" d="m597.4 463l7.4-15.7"/>
			<path fill-rule="evenodd" class="s0" d="m441.2 379.7l11.3-20.6-53.4-35.5-12.5 23.4"/>
			<path fill-rule="evenodd" class="s4" d="m394.1 298.8l-29.4 56"/>
			<path fill-rule="evenodd" class="s0" d="m231.8 372.2l-29.1 54.6"/>
			<path fill-rule="evenodd" class="s0" d="m252.6 333l-17.1 32.3"/>
			<path fill-rule="evenodd" class="s0" d="m264.6 310.6l-6.2 11.7"/>
			<path fill-rule="evenodd" class="s0" d="m304.7 236.2l-34.6 64.7"/>
			<path fill-rule="evenodd" class="s0" d="m203.2 337.1l-36.9 66.8"/>
			<path fill-rule="evenodd" class="s0" d="m265.1 224.9l-49.6 90"/>
			<path fill-rule="evenodd" class="s0" d="m240 357.1l-81.5-43.4"/>
			<path fill-rule="evenodd" class="s0" d="m127.8 371.2l-6.7 12.4"/>
			<path fill-rule="evenodd" class="s0" d="m145.9 337.6l-13.8 25.7"/>
			<path fill-rule="evenodd" class="s0" d="m180.7 273l-26.8 49.7"/>
			<path fill-rule="evenodd" class="s0" d="m229.3 182.8l-43.7 81.1"/>
			<path fill-rule="evenodd" class="s0" d="m206 291l-21.5 36.5"/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s0" d="m199.3 269.4l-12.9-6.9"/>
			<path fill-rule="evenodd" class="s0" d="m224.8 258.4l-10.9 18.8-8.2-4.4"/>
			<path fill-rule="evenodd" class="s0" d="m191.1 211.8l-32.4-17.2 25.4-46.7c19.6 13.9 56.6 40 101.6 71.7l-1.4 2c-44.1-31.1-80.9-57-101.6-71.7"/>
			<path fill-rule="evenodd" class="s0" d="m187.5 281.5l-8.8-4.7"/>
			<path fill-rule="evenodd" class="s0" d="m205.7 291.3l-12.3-6.6"/>
			<path fill-rule="evenodd" class="s0" d="m214.8 315l36.8 20.4"/>
			<path fill-rule="evenodd" class="s0" d="m507.1 452.1l-56.2 105.9"/>
			<path fill-rule="evenodd" class="s0" d="m523.1 421.8l-16 30.3"/>
			<path fill-rule="evenodd" class="s4" d="m352.3 362.6l-30.1 55.3"/>
			<path fill-rule="evenodd" class="s4" d="m361.9 353l-42.1 79.1"/>
			<path fill-rule="evenodd" class="s4" d="m316.2 427.6c0 0-1.3-4.2-1.5-5.8-0.2-1.6 1.2-3.8 1.2-3.8 0 0 31.9-60.9 33.3-62.8 1.4-1.9 5.7-1.6 5.7-1.6l6.5 0.5"/>
			<path fill-rule="evenodd" class="s4" d="m362.5 343.6c-6.8 1.1-14.7 1.7-18.4 8.6-3.7 6.9-4 7.6-6 11.4q-9.7 18.3-19.5 36.6c-2.3 4.3-4.6 8.7-7 13-2.6 4.9-4.2 8.4-2.9 14 1.3 5.6 2.5 7.8 3.7 11.1"/>
			<path fill-rule="evenodd" class="s4" d="m373.6 322.7l6.4 3.3-14.7 28.4-6.4-3.3z"/>
			<path fill-rule="evenodd" class="s4" d="m374.2 325.2l3.2 1.7-12.9 25-3.2-1.7z"/>
			<path fill-rule="evenodd" class="s4" d="m379.8 326l-6.4-3.3 14.6-28.1 6.1 4.2z"/>
			<path fill-rule="evenodd" class="s4" d="m379 323.6l-3.3-1.7 12.7-24.4 3 2.1z"/>
			<path class="s2" d="m516.5 418.4l11.8 6.4-5.9 10.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m528.1 424.8l11.8 6.4-6.4 11.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m504.6 412l11.8 6.4-6.4 11.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m398.7 371.8l23.9 13.8-4.5 8.4-10.1 2.4-4.7-3.1 8.8-13.8"/>
			<path fill-rule="evenodd" class="s0" d="m399.4 370.4l24.4 14 2.3-3.9-2.1-1.1-2.1 3.6"/>
			<path fill-rule="evenodd" class="s0" d="m441.6 380l-45-24.6 1.1-2"/>
			<path fill-rule="evenodd" class="s0" d="m408.3 362l-5.5 10.3"/>
			<path fill-rule="evenodd" class="s0" d="m410.6 363.4l-5.5 10.3"/>
			<path fill-rule="evenodd" class="s0" d="m413 364.3l-5.5 10.3"/>
			<path fill-rule="evenodd" class="s0" d="m415.2 365.7l-5.5 10.3"/>
			<path fill-rule="evenodd" class="s0" d="m417.3 367.1l-5.4 10.3"/>
			<path fill-rule="evenodd" class="s0" d="m405.3 373.4l12-6.3"/>
			<path fill-rule="evenodd" class="s4" d="m405.3 377.4l-51.2 97.9"/>
			<path fill-rule="evenodd" class="s0" d="m422.6 385.6c0 0 1.6 0.6 1.6 3.4 0 2.8-0.6 6-0.8 7-0.2 1-0.2 0.6-0.3 0.8-3 5.7-39.5 74.7-44.4 84.1-4.9 9.4-4.8 10-6.8 10.2-2 0.2-5.1 1-5.1 1l-2.6 5.1-1.6-0.9 6.4-13.2-2.9-8.8-3.5-1.5-8.4 14.7-16.1-8.5 8.5-15.8"/>
			<path fill-rule="evenodd" class="s4" d="m366 474.2c0 0 2.8 0 3.9-1.5 3.2-4.6 37.7-71.4 37.8-71.6 0.5-0.8 1.9-3.4 0.3-4.7"/>
			<path fill-rule="evenodd" class="s4" d="m367.7 479c0 0 4.6 0.4 5.6-1.3 1-1.7 39.6-75.3 39.6-75.3 0 0 1-2.1 1-4.5v-3"/>
			<path class="s2" d="m346.6 467.9l11.8 6.4-5.9 10.8-11.8-6.4z"/>
			<path fill-rule="evenodd" class="s0" d="m358.2 480.4l9.5 5.1"/>
			<path fill-rule="evenodd" class="s0" d="m317.8 468.5l-16.8-9.4 16.1-29.1 6.1 3.7-6.9 13.1 19.6 11-8.7 15.9-2.5-1.4"/>
			<path fill-rule="evenodd" class="s0" d="m328.8 470.8l10.4 6"/>
			<path fill-rule="evenodd" class="s0" d="m330 468.6l10.4 6.1"/>
			<path fill-rule="evenodd" class="s0" d="m331.4 466.7l10.3 6"/>
			<path fill-rule="evenodd" class="s0" d="m332.6 464.5l10.4 6.1"/>
			<path fill-rule="evenodd" class="s0" d="m334 461.7l10.4 6.1"/>
			<path fill-rule="evenodd" class="s0" d="m335.2 459.6l10.4 6"/>
			<path fill-rule="evenodd" class="s0" d="m344.4 467.8l-14.4 0.8"/>
			<path fill-rule="evenodd" class="s0" d="m321.8 417.3l3.2 1.6-5.9 11.5-3.2-1.7z"/>
			<path fill-rule="evenodd" class="s4" d="m408.3 308.8l-8.9 13.9-21.2 39.9"/>
			<path fill-rule="evenodd" class="s4" d="m441.3 332.1l-9.7 13.1"/>
			<path fill-rule="evenodd" class="s4" d="m454.2 341.2l-3.7 4.6"/>
			<path fill-rule="evenodd" class="s1" d="m450.4 345.4c2.9 1.7 4.8 3.3 5.5 5 2 4.1-1.2 7.6-1.2 7.6l-8.5-5.5-1.4 1.6"/>
			<path fill-rule="evenodd" class="s1" d="m397.7 353.5c1.8-2.9 2.7-5.1 2.6-7-0.2-4.5-4.6-6.2-4.6-6.2l-5 8.8-4.2-2.1"/>
			<path fill-rule="evenodd" class="s1" d="m294.2 471.4l1.1-2.3-8.8-5c0 0 1.7-4.4 6.2-4.6 4.5-0.2 3.7 0.4 6.5 2.2l1.7-2.6"/>
			<path fill-rule="evenodd" class="s1" d="m326.4 473.2l-1.7-1-5 8.8c0 0-4.4-1.7-4.6-6.2-0.2-4.5 0.4-3.7 2.2-6.5"/>
			<path fill-rule="evenodd" class="s0" d="m447.7 556.1c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3l1.4-2.7-150.2-79.2-1.6 2.9c52.1 27.6 104.6 55.4 150.3 79.6"/>
			<path fill-rule="evenodd" class="s0" d="m194.4 418.7l-12.1-6.4"/>
			<path fill-rule="evenodd" class="s0" d="m290.7 473.4c0 0-3.8 7-11.6 3-7.8-4-3.3-11.3-3.3-11.3l1.3-2.8-75.2-39.7"/>
			<path fill-rule="evenodd" class="s0" d="m540.3 430.8l-4.8 8.7c0 0 3.7 2.9 7.7 0.7 4-2.2 3.1-2.8 4.7-6.1"/>
			<path fill-rule="evenodd" class="s0" d="m554.7 438.7l-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m613.3 471.7l5-8.6c0 0-3.7-3-7.6-0.8-3.9 2.2-2.9 2.6-4.6 5.9"/>
			<path fill-rule="evenodd" class="s0" d="m599.1 463.8l4.6-9c0 0 4.4 1.6 4.7 6.1 0.3 4.5-0.5 4.1-2.4 7.2"/>
			<path fill-rule="evenodd" class="s4" d="m622 483.4l-6-3.5"/>
			<path fill-rule="evenodd" class="s0" d="m614.8 482l6 3.6"/>
			<path fill-rule="evenodd" class="s0" d="m613.5 484.3l6.1 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m612.3 486.4l6.1 3.6"/>
			<path fill-rule="evenodd" class="s0" d="m611.5 488.7l6 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m610.3 490.9l6 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m490.4 403.3l-4.8 8.7c0 0 3.7 2.9 7.7 0.7 4-2.2 3.1-2.8 4.7-6.1"/>
			<path fill-rule="evenodd" class="s0" d="m504.8 411.2l-5 8.5c0 0-4.4-1.7-4.5-6.3-0.1-4.6 0.9-4.1 2.9-7.1"/>
			<path fill-rule="evenodd" class="s0" d="m454.7 375.3c1.7-3.2 2.9-4.9 4.6-5.9 4-2.2 7.6 0.8 7.6 0.8l-4.7 8.7 1.4 0.7"/>
			<path fill-rule="evenodd" class="s0" d="m454.7 375.3c1.9-3.1 2.5-5.3 2.4-7.2-0.2-4.5-4.7-6.1-4.7-6.1l-4.8 8.8-1.2-0.7"/>
			<path fill-rule="evenodd" class="s0" d="m400.1 321.6l-13.5-7.8"/>
			<path fill-rule="evenodd" class="s0" d="m379.4 359.1l-13.4-6.5"/>
			<path fill-rule="evenodd" class="s0" d="m532 626.8l-41.7 75.2-402.4-213.1 41.8-77.8 47.8 25.9-3.7 6.9-47.8-25.8"/>
			<path fill-rule="evenodd" class="s0" d="m330.6 519.9l-42.8 79.6"/>
			<path class="s0" d=""/>
			<path class="s1" d=""/>
			<path fill-rule="evenodd" class="s1" d="m531.7 626.7l-47.1-24.7-3.7 6.9 47.1 24.8"/>
			<path fill-rule="evenodd" class="s1" d="m495.6 616.3l3.5-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m488.5 612.6l3.5-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m502.4 619.9l3.5-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m507.8 622.7l3.5-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m495.4 612.4l34.3 18.1"/>
			<path fill-rule="evenodd" class="s1" d="m482.6 605.7l9 4.7"/>
			<path fill-rule="evenodd" class="s1" d="m492.9 609l4 2.1-2.4 4.5-4-2.1z"/>
			<path fill-rule="evenodd" class="s1" d="m512.1 624.8l3.5-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m521.8 626.5l2.1-3.9"/>
			<path fill-rule="evenodd" class="s0" d="m462.3 597.2l5.5 3.1"/>
			<path class="s1" d=""/>
			<path fill-rule="evenodd" class="s1" d="m330.3 519.8l-46.8-25.4-3.7 6.9 46.7 25.5"/>
			<path fill-rule="evenodd" class="s1" d="m294.4 508.9l3.6-6.6"/>
			<path fill-rule="evenodd" class="s1" d="m287.3 505.1l3.6-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m301 512.5l3.6-6.6"/>
			<path fill-rule="evenodd" class="s1" d="m306.4 515.5l3.6-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m294.4 505.1l33.8 18.5"/>
			<path fill-rule="evenodd" class="s1" d="m281.5 498.1l9.4 5.1"/>
			<path fill-rule="evenodd" class="s1" d="m291 501.6l4 2.2-2.4 4.5-4-2.2z"/>
			<path fill-rule="evenodd" class="s1" d="m310.7 517.6l3.6-6.6"/>
			<path fill-rule="evenodd" class="s1" d="m320.3 519.5l2.2-3.9"/>
			<path fill-rule="evenodd" class="s1" d="m330.7 520l46.8 25.4-3.7 6.8-46.8-25.2"/>
			<path fill-rule="evenodd" class="s1" d="m359.5 544.2l3.6-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m366.5 548l3.6-6.6"/>
			<path fill-rule="evenodd" class="s1" d="m352.8 540.6l3.6-6.7"/>
			<path fill-rule="evenodd" class="s1" d="m347.4 537.6l3.6-6.6"/>
			<path fill-rule="evenodd" class="s0" d="m362.7 542.1l-34-18.3"/>
			<path fill-rule="evenodd" class="s0" d="m375.5 549.1l-9-4.9"/>
			<path fill-rule="evenodd" class="s1" d="m365 547.4l-3.9-2.2 2.4-4.5 4 2.2z"/>
			<path fill-rule="evenodd" class="s0" d="m386.8 556.6l5.8 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m260.7 490.3l6.4 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m926.6 470.5h-8.7-1v-8.5h9.7z"/>
			<path fill-rule="evenodd" class="s0" d="m917.8 538.9v-68.4"/>
			<path fill-rule="evenodd" class="s0" d="m921.7 495.3v-18.4"/>
			<path fill-rule="evenodd" class="s0" d="m921.7 538.9v-27.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 478.8h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 486.9h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 495.1h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 511.8h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 520h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 528h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m918.3 503.3h8.3"/>
			<path fill-rule="evenodd" class="s0" d="m923.9 470.5v68.9"/>
			<path fill-rule="evenodd" class="s0" d="m923.9 532.8c-0.3-0.1-79.1 0-79.1 0v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m918.5 476.9v-4.5h5.1v4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m853.9 538.1v-4.5h5.1v4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m909.8 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m901.6 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m893.3 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m884.9 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m876.4 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m868.3 532.8v6.1"/>
			<path fill-rule="evenodd" class="s0" d="m788.8 490.8l30.1-42.2h76v5.3h5.7"/>
			<path fill-rule="evenodd" class="s0" d="m815.1 558.8l-49.4-35.6 18.2-25.5"/>
			<path fill-rule="evenodd" class="s0" d="m778.1 505.4l5.3 3.6"/>
			<path fill-rule="evenodd" class="s0" d="m822.2 534.8l-12.6 16.9 5.2 3.8 12.3-16.8"/>
			<path fill-rule="evenodd" class="s0" d="m811.7 549.7l4.7 3.6"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1145.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1148.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1151.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1154.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1156.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1159.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1162.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1164.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1167.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1170.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1173.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1175.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1178.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1181.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1183.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1186.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1189.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1192.1 310.4v3.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1033 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1035.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1038.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1041.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1043.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1046.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1049.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1052 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1054.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1057.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1060.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1062.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1065.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1068.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1071 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1073.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1076.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1079.1 310.4v3.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m984.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m987.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m989.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m992.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m995.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m997.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1000.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1003.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1006.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1008.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1011.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1014.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1016.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1019.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1022.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1025.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1027.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1030.5 310.4v3.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m869.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m872 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m874.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m877.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m880.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m882.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m885.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m888.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m890.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m893.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m896.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m899.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m901.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m904.5 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m907.2 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m909.9 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m912.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m915.4 310.4v3.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m820.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m823.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m826 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m828.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m831.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m834.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m836.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m839.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m842.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m845 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m847.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m850.4 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m853.1 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m855.8 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m858.6 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m861.3 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m864 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m866.7 310.4v3.8"/>
				<path fill-rule="evenodd" class="s0" d="m818.1 310.4v3.8"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m752.1 314.4h-49.6l0.1-6.9"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m705.5 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m708.2 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m710.9 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m713.6 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m716.3 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m719.1 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m721.8 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m724.5 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m727.2 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m729.9 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m732.6 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m735.3 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m738 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m740.8 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m743.5 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m746.2 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m748.9 310.5v3.7"/>
				<path fill-rule="evenodd" class="s0" d="m751.6 310.5v3.7"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m982 310.4v3.8"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m648.5 306.3l-48.9-8.2 1.2-6.7"/>
				<path fill-rule="evenodd" class="s0" d="m603.2 294.8l-0.7 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m605.8 295.2l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m608.5 295.7l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m611.2 296.1l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m613.9 296.5l-0.7 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m616.5 297l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m619.2 297.4l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m621.9 297.9l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m624.6 298.3l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m627.3 298.8l-0.7 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m629.9 299.2l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m632.6 299.7l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m635.3 300.1l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m638 300.5l-0.7 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m640.6 301l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m643.3 301.4l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m646 301.9l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m648.7 302.3l-0.7 3.8"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m537.1 287.5l-48.9-8.1 1.2-6.8"/>
				<path fill-rule="evenodd" class="s0" d="m491.8 276l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m494.5 276.5l-0.7 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m497.1 276.9l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m499.8 277.3l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m502.5 277.8l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m505.2 278.2l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m507.9 278.7l-0.7 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m510.5 279.1l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m513.2 279.6l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m515.9 280l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m518.6 280.5l-0.7 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m521.2 280.9l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m523.9 281.3l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m526.6 281.8l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m529.3 282.2l-0.7 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m531.9 282.7l-0.6 3.7"/>
				<path fill-rule="evenodd" class="s0" d="m534.6 283.1l-0.6 3.8"/>
				<path fill-rule="evenodd" class="s0" d="m537.3 283.6l-0.6 3.7"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1159 403.7v-53.8h6.8"/>
				<g>
					<path fill-rule="evenodd" class="s0" d="m1162.9 357.1h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 359.8h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 362.5h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 365.2h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 367.9h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 370.7h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 373.4h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 376.1h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 378.8h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 381.5h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 384.2h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 386.9h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 389.7h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 392.4h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 395.1h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 397.8h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 400.5h-3.7"/>
					<path fill-rule="evenodd" class="s0" d="m1162.9 403.2h-3.7"/>
				</g>
			</g>
			<path fill-rule="evenodd" class="s0" d="m522.8 616.5l8.7 4.7c0 0 2.9-3.9 0.6-7.8-2.3-3.9-2.1-2.4-4.2-3.5"/>
			<path fill-rule="evenodd" class="s0" d="m531 602.8l8.8 4.6c0 0-1.5 4.5-6 4.8-4.5 0.3-3.2-0.8-5.7-2.2"/>
			<path fill-rule="evenodd" class="s0" d="m378.5 543l-94-50.8"/>
			<path fill-rule="evenodd" class="s0" d="m378.5 543.7l4.6-9c0 0 4.4 1.6 4.7 6.1 0.3 4.5-0.5 4.1-2.4 7.2"/>
			<path fill-rule="evenodd" class="s0" d="m484.6 599.7l4.5-8.7c0 0-3.9-2.7-7.7-0.3-3.8 2.4-3.3 3.1-4.8 6.5"/>
			<path fill-rule="evenodd" class="s0" d="m184.3 441.1c1.9-3.1 2.5-4.7 2.4-6.6-0.2-4.5-4.7-6.1-4.7-6.1l-10.8 20.4 12.2 6.5 6.5-11.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m404.4 559.2c18.6 9.9 36.1 19.3 52.4 27.9l1.2-2.2-42.2-22.3"/>
				<path fill-rule="evenodd" class="s0" d="m415.8 562.5c-3.4-1.8-6.6-3.5-10.2-5.3"/>
				<path fill-rule="evenodd" class="s0" d="m406.2 556.9l-11.9 22.2"/>
				<path fill-rule="evenodd" class="s0" d="m415 602.1l-10.3 19.4"/>
				<path fill-rule="evenodd" class="s0" d="m456.9 587l-10.6 19.6"/>
				<g>
					<path fill-rule="evenodd" class="s0" d="m375.5 634.8l7.1 3.8-2.6 4.8-7-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m382.5 638.5l7.1 3.7-2.6 4.9-7.1-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m389.6 642.2l7.1 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m396.7 646l7 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m403.8 649.7l7.1 3.7-2.6 4.9-7.1-3.7z"/>
				</g>
				<g>
					<path fill-rule="evenodd" class="s0" d="m386.3 613.4l7.4 3.9-2.6 4.9-7.4-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m393.7 617.3l7.4 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m401 621.2l7.4 3.9-2.6 4.8-7.3-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m408.4 625l7.3 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m415.6 628.9l7.3 3.9-2.5 4.8-7.4-3.8z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m372.7 639.4l6.4-12"/>
				<path fill-rule="evenodd" class="s0" d="m407.9 658.2l6.6-12.3"/>
				<path fill-rule="evenodd" class="s0" d="m381.9 620.9l15-27.7-8.6-4.8 1.2-2.2 9 4.7c0 0 2.7-3.9 0.3-7.7-2.4-3.8-1.8-2.4-5.1-4.1"/>
				<path fill-rule="evenodd" class="s0" d="m386.8 611.4l36.8 19.5"/>
				<path fill-rule="evenodd" class="s4" d="m407.7 614.5c-0.3-0.2-0.6-0.4-0.9-0.5-2.4-1.3-4.8-1.5-5.4-0.4-0.6 1.1 0.9 3 3.3 4.3 2.4 1.3 0.6 0.3 1 0.5l2.1-3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m392.2 602.1l5.8 3.2-4.2 7.9-5.9-3.2z"/>
					<path class="s2" d="m391.3 606c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m390.5 607.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m393.8 608.2c-0.7 1.5-2.1 2.2-3.1 1.6-1-0.5-1.2-2.1-0.4-3.5 0.8-1.4 2.2-2.1 3.1-1.6 1 0.6 1.2 2.1 0.4 3.5z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m405.8 597l18.3 10.1"/>
				<path fill-rule="evenodd" class="s4" d="m406.5 619c0.3 0.2 0.6 0.4 0.9 0.5 2.4 1.3 4.8 1.5 5.4 0.4 0.6-1.1-0.9-3-3.3-4.3-2.4-1.3-0.6-0.3-1-0.5l-2.1 3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m424.4 629.4l-5.9-3.2 4.2-7.9 5.9 3.2z"/>
					<path class="s2" d="m425.2 626.6c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m426.1 625c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m426.2 625.5c-0.8 1.4-2.2 2.1-3.1 1.6-1-0.6-1.2-2.1-0.4-3.5 0.8-1.5 2.2-2.2 3.1-1.6 1 0.5 1.2 2 0.4 3.5z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m392 620.3l21.8 11.4"/>
				<path fill-rule="evenodd" class="s0" d="m413 628.2l-1.3 2.5"/>
				<path fill-rule="evenodd" class="s0" d="m395.3 618.9l-1.3 2.5"/>
				<path fill-rule="evenodd" class="s0" d="m462.2 597.7c1.8-3.2 2.5-5.1 2.4-7-0.2-4.5-4.7-6.1-4.7-6.1l-4.6 9-1.3-0.7"/>
				<path fill-rule="evenodd" class="s0" d="m392.7 560.6c1.9-3.3 3.1-4.8 4.7-5.8 4-2.2 7.7 0.7 7.7 0.7l-4.9 8.6 1.8 0.9"/>
				<path fill-rule="evenodd" class="s0" d="m424.6 606.9c-1.9 3.1-1.6 5.2-1.6 5.8 0.2 4.5 4.7 6.1 4.7 6.1l4-7.8 2.9 1.7"/>
				<path fill-rule="evenodd" class="s0" d="m405.9 596.5c-1.8 3-2.6 4.5-4.2 5.6-3.8 2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
				<path fill-rule="evenodd" class="s0" d="m446.5 607.3c-3.4-1.9-4.9-2.5-6.8-2.5-4.5 0-6.3 4.5-6.3 4.5l8.9 4.9-1.1 1.9-7.6-4-14.7 27.6"/>
				<path fill-rule="evenodd" class="s0" d="m418.9 639.1l8.9 4.8c0 0-1.7 4.4-6.2 4.5-4.5 0.1-4.3-1.1-7.5-2.8"/>
				<path fill-rule="evenodd" class="s0" d="m381.9 620.3l-9-4.6c0 0-2.7 3.9-0.2 7.7 2.5 3.8 3.3 3 6.7 4.7"/>
				<path fill-rule="evenodd" class="s0" d="m398.4 571.5l4.5 2.6 4.8-8.6 42.3 22.5-4.6 8.5 4.4 2.6"/>
				<path fill-rule="evenodd" class="s0" d="m401.6 572.8l5.3-9.7 46 23.9-5.8 10.7"/>
				<path fill-rule="evenodd" class="s0" d="m399.9 569.3l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m401.2 567.1l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m402.4 564.6l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m403.6 562.4l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m448.7 595.3l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m450 593.1l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m451.2 590.6l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m452.4 588.4l2.5 1.4"/>
			</g>
			<path class="s2" d="m540.6 607.3l-8.1-4.2-1.3-0.7 0.7-1.3 9.4 4.9z"/>
			<path class="s2" d="m531.3 623.1l-8-4.2-1.4-0.7 0.7-1.3 9.4 4.9z"/>
			<path fill-rule="evenodd" class="s0" d="m199.9 425.7l5-8.8c0 0-3.8-2.8-7.7-0.5-3.9 2.3-3.1 2.2-4.7 5.5"/>
			<path fill-rule="evenodd" class="s0" d="m180.7 415.7l6.7-11.9c0 0-5.4-4-10.7-1-5.3 3-4.3 2.9-6.4 7.4"/>
			<path fill-rule="evenodd" class="s0" d="m228.2 379l-37.2-19.8"/>
			<path fill-rule="evenodd" class="s0" d="m223.6 386.8l-37.3-19.9"/>
			<path fill-rule="evenodd" class="s0" d="m225.7 382.8l-37.3-19.8"/>
			<path fill-rule="evenodd" class="s0" d="m196.5 362.4l-4.2 7.7"/>
			<path fill-rule="evenodd" class="s0" d="m203.9 366.3l-4.2 7.7"/>
			<path fill-rule="evenodd" class="s0" d="m206.7 367.7l-4.2 7.7"/>
			<path fill-rule="evenodd" class="s0" d="m222 375.9l-13.4 23.9"/>
			<path fill-rule="evenodd" class="s0" d="m224.7 377.3l-12.9 24.1"/>
			<path fill-rule="evenodd" class="s0" d="m210.7 369.6l-2.3 4.1"/>
			<path fill-rule="evenodd" class="s0" d="m217.7 373.7l-2.2 4"/>
			<path fill-rule="evenodd" class="s0" d="m214.1 371.9l-2.3 4.1"/>
			<path fill-rule="evenodd" class="s0" d="m215 403.5l-19.7-10.8-11.3 20.5"/>
			<path fill-rule="evenodd" class="s4" d="m197.6 394.5c-0.2 0.3-0.4 0.6-0.5 0.9-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.3-3.3 1.3-2.4 0.3-0.6 0.5-1l-3.9-2.1z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m213.7 403.1l-3.2 5.8-7.9-4.2 3.2-5.9z"/>
				<path class="s2" d="m210.3 402.7c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m208.7 401.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m211.1 404.4c-0.5 0.9-2.1 1.1-3.5 0.3-1.4-0.7-2.1-2.1-1.6-3.1 0.5-1 2.1-1.1 3.5-0.4 1.4 0.8 2.1 2.2 1.6 3.2z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m191.8 398l-8.2-4.3"/>
			<path fill-rule="evenodd" class="s0" d="m184 393.9c1.2-2.2 1.3-3.8 1.3-5.5-0.2-4.7-4.4-6.6-4.4-6.6l-5.2 9.2-1.8-1"/>
			<path fill-rule="evenodd" class="s0" d="m215 388.7l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m218.7 389l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m213.6 398.7l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m262.2 230.3l2.6 1.4-20.4 37.4-2.6-1.4z"/>
			<path fill-rule="evenodd" class="s0" d="m353.6 270.7l5.2-7c0 0-5.1-6.6-12 1.4"/>
			<path fill-rule="evenodd" class="s0" d="m339.3 261.2l6.4-8.2c0 0 7.5 3.8 0.9 12"/>
			<path fill-rule="evenodd" class="s0" d="m278.9 214.8c2.6-2.8 6.9-3.2 10.2-1.3 3.3 1.9 5.2 7.3 3.2 11"/>
			<path fill-rule="evenodd" class="s0" d="m292.3 224.3c2.6-2.8 6.8-3.4 10.1-1.5 3.3 1.9 4.8 7 3.2 11"/>
			<path fill-rule="evenodd" class="s0" d="m264.7 311.3c-5.9-4.9-6.5-10.1-4.2-14.9 2.3-4.8 9.2-7.6 15-5.8"/>
			<path fill-rule="evenodd" class="s0" d="m264.8 224.3c10.6 6.8 14.2-2.4 14.2-2.4l-9.2-6.2 1.9-3"/>
			<path fill-rule="evenodd" class="s0" d="m200.9 215.5l-6.7 10.5c0 0-9.1-3.8-2.7-14.5"/>
			<path fill-rule="evenodd" class="s0" d="m199 268.8l-4.4 8.7c0 0 6.9 3.7 11.3-5.2"/>
			<path fill-rule="evenodd" class="s0" d="m187.2 281.1l-4.1 8.2c0 0 6.2 4.8 10.6-4.1"/>
			<path fill-rule="evenodd" class="s0" d="m186.4 264.7l-11.9-6c0 0-6.1 8.8 6 14.7"/>
			<path fill-rule="evenodd" class="s0" d="m219.3 201.4l14.6 7.9"/>
			<path fill-rule="evenodd" class="s0" d="m205.2 227.7l12.2 6.6"/>
			<path fill-rule="evenodd" class="s0" d="m247.9 334.9l2.7 1.5-7.3 13.2-2.6-1.4z"/>
			<path fill-rule="evenodd" class="s0" d="m253.2 333.1l-10.1-5.5c0 0 4.3-11.2 15.6-4.9"/>
			<path fill-rule="evenodd" class="s0" d="m150.2 330.7c-3.2-1.7-4.9-2.9-5.9-4.6-2.2-4 0.8-7.6 0.8-7.6l8.7 4.7 0.7-1.4"/>
			<path fill-rule="evenodd" class="s0" d="m150.2 330.7c-3.1-1.9-5.3-2.5-7.2-2.4-4.5 0.2-6.1 4.7-6.1 4.7l9.3 5.3"/>
			<path fill-rule="evenodd" class="s0" d="m707.7 457.3l30.2 21 20.9-28.8"/>
			<path fill-rule="evenodd" class="s0" d="m693.3 472.3l50.1 34.8 33.9-47"/>
			<path fill-rule="evenodd" class="s0" d="m697.8 475.4l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m699.7 476.8l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m701.6 478.2l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m703.5 479.7l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m705.7 480.6l12.3-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m707.6 482l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m709.5 483.4l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m711.4 484.9l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m713.6 486.2l12.3-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m715.5 487.6l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m717.4 489l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m719.3 490.5l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m721.4 491.4l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m723.4 492.8l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m725.3 494.2l12.4-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m741.5 473.7l17.6 11.5"/>
			<path fill-rule="evenodd" class="s0" d="m742.8 471.7l17.6 11.5"/>
			<path fill-rule="evenodd" class="s0" d="m744 469.8l17.7 11.6"/>
			<path fill-rule="evenodd" class="s0" d="m745.8 468.1l17.2 11.3"/>
			<path fill-rule="evenodd" class="s0" d="m747.1 466.2l17.3 11.2"/>
			<path fill-rule="evenodd" class="s0" d="m748.5 464.1l17.6 11.6"/>
			<path fill-rule="evenodd" class="s0" d="m750 462.2l17.2 11.2"/>
			<path fill-rule="evenodd" class="s0" d="m751.3 460.2l17.3 11.3"/>
			<path fill-rule="evenodd" class="s0" d="m752.9 458.3l17.2 11.3"/>
			<path fill-rule="evenodd" class="s0" d="m754.2 456.5l17.3 11.3"/>
			<path fill-rule="evenodd" class="s0" d="m755.2 454.3l17.7 11.6"/>
			<path fill-rule="evenodd" class="s0" d="m757 452.6l17.2 11.3"/>
			<path fill-rule="evenodd" class="s0" d="m758.4 450.7l17.2 11.2"/>
			<path fill-rule="evenodd" class="s0" d="m784.3 497.9l-7.9-5.9c0 0 5.5-5.9 12.6-0.6"/>
			<path fill-rule="evenodd" class="s0" d="m783.1 509.4l6-8c0 0 6.7 4.6 1.4 11.7l-1.3 1.7"/>
			<path fill-rule="evenodd" class="s0" d="m797.5 517.5l4.7-6.2c0 0-6.3-5.2-11.6 1.8l-1.3 1.7"/>
			<path fill-rule="evenodd" class="s4" d="m930 533.6h329.6"/>
			<path fill-rule="evenodd" class="s0" d="m1172.8 404.6h-9.5c0 0-1.6 8.2 8.9 8.1"/>
			<path fill-rule="evenodd" class="s0" d="m1125.4 453.2v-12.4h50.9v7.6"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1173.3 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1170.6 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1167.9 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1165.2 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1162.5 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1159.8 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1157.1 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1154.3 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1151.6 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1148.9 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1146.2 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1143.5 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1140.8 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1138.1 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1135.3 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1132.6 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1129.9 444.7v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1127.2 444.7v-3.8"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m956.6 453.6v-12.5h108.4v11.1"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m1062.1 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1059.4 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1056.7 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1053.9 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1051.2 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1048.5 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1045.8 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1043.1 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1040.4 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1037.7 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1034.9 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1032.2 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1029.5 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1026.8 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1024.1 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1021.4 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1018.7 445.1v-3.8"/>
				<path fill-rule="evenodd" class="s0" d="m1016 445.1v-3.8"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m1013.1 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m1010.1 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m1007.3 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m1004.6 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m1001.8 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m999.1 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m996.4 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m993.7 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m991 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m988.3 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m985.5 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m982.8 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m980.1 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m977.4 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m974.7 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m972 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m969.2 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m966.5 445.2v-3.7"/>
			<path fill-rule="evenodd" class="s0" d="m963.8 445.1v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m961.1 445.1v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m854 448.7v-4h40.9v7.6"/>
			<path fill-rule="evenodd" class="s0" d="m892 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m889.2 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m886.5 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m883.8 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m881.1 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m878.4 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m875.7 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m873 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m870.2 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m867.5 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m864.8 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m862.1 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m859.4 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m856.7 448.7v-3.8"/>
			<path fill-rule="evenodd" class="s0" d="m908.4 453.9v-8.4c0 0-8.2-1.6-8.1 8.9"/>
			<path fill-rule="evenodd" class="s0" d="m908 453.9h2.7"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s4" d="m663.3 214.5l-159.7-27.5"/>
			<path fill-rule="evenodd" class="s0" d="m827.3 409.3c8.9 0 8.5 7.3 8.5 7.3h-8.6v1.4"/>
			<path fill-rule="evenodd" class="s0" d="m820.2 407.3h7.6v1.9"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m897.4 412.4h4.8v4.8h-4.8z"/>
				<path class="s2" d="m899.5 415.7h0.7v1.8h-0.7z"/>
				<path class="s2" d="m898.8 417.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
				<path class="s2" d="m901 417.3c-0.3 0-0.5-0.2-0.5-0.5 0-0.3 0.2-0.5 0.5-0.5 0.3 0 0.5 0.2 0.5 0.5 0 0.3-0.2 0.5-0.5 0.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m902.5 414.7h8.9v3.2"/>
			<path fill-rule="evenodd" class="s0" d="m776.4 564.5l49.5 34.2"/>
			<path fill-rule="evenodd" class="s0" d="m875.4 713l31.3-59"/>
			<path fill-rule="evenodd" class="s0" d="m627.2 651.5l219.6 115.5 24.8-47.2"/>
			<path fill-rule="evenodd" class="s0" d="m886 664.2l11.2 7.9"/>
			<path fill-rule="evenodd" class="s0" d="m813.3 612.4l66.8 47.6"/>
			<path fill-rule="evenodd" class="s0" d="m834.1 605.9l66.4 46.5-1.7 2.3-66.3-46.5z"/>
			<path fill-rule="evenodd" class="s0" d="m903.8 652.5l-3.9 6.3-71.3-50.5 3.8-5.1 74.1 51.2"/>
			<path fill-rule="evenodd" class="s0" d="m825.3 620.8l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m827.6 622.5l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m829.8 624.3l7.4-9.4"/>
			<path fill-rule="evenodd" class="s0" d="m832.1 625.5l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m834.2 627.2l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m836.6 628.9l7.4-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m838.8 630.6l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m847.5 636.3l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m848.7 637.5l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m849.8 638.6l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m878.2 658.2l7.5-9.3"/>
			<path fill-rule="evenodd" class="s0" d="m854.5 632.9l28 20"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m876 703.4l-29.3-16 1.3-2.6 1.4-2.5 29.4 16z"/>
				<path fill-rule="evenodd" class="s0" d="m877.4 700.8l-29.6-16.1"/>
				<path fill-rule="evenodd" class="s0" d="m857.5 686.7l-2.7 5.1"/>
				<path fill-rule="evenodd" class="s0" d="m864.1 690.3l-2.7 5.1"/>
				<path fill-rule="evenodd" class="s0" d="m871 694l-2.8 5.1"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m695.3 606.3l-33.7-18"/>
			<path fill-rule="evenodd" class="s0" d="m734 627.1l-16-8.6"/>
			<path fill-rule="evenodd" class="s0" d="m744.2 632.7l-3.5-1.9"/>
			<path fill-rule="evenodd" class="s0" d="m787.2 664.8l-40-21.5"/>
			<path fill-rule="evenodd" class="s0" d="m879.7 705.4l-79.6-42.8-4.2 7.1-1.8-1"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m893.3 669.8l-15.7 27.7-2.5-1.4-2.6-1.4 16-28.2z"/>
				<path fill-rule="evenodd" class="s0" d="m891 667.9l-16.1 28.5"/>
				<path fill-rule="evenodd" class="s0" d="m876.9 686.9l5.1 2.9"/>
				<path fill-rule="evenodd" class="s0" d="m875.4 690.3l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m880.5 680.6l5.1 2.8"/>
				<path fill-rule="evenodd" class="s0" d="m884.2 674l5.1 2.9"/>
				<path fill-rule="evenodd" class="s0" d="m885.5 677.8l2.5 1.5"/>
				<path fill-rule="evenodd" class="s0" d="m888.4 673.2l2.6 1.5"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m812.4 657.5l18.2-32.9"/>
			<path fill-rule="evenodd" class="s0" d="m715.1 600.5l-3-1.6"/>
			<path fill-rule="evenodd" class="s0" d="m736.1 611.6l-14.1-7.4"/>
			<path fill-rule="evenodd" class="s0" d="m775.6 632.4l-26.8-14.1"/>
			<path fill-rule="evenodd" class="s0" d="m806.6 648.9l-24.1-12.9"/>
			<path fill-rule="evenodd" class="s0" d="m822.2 596.2l-25.1 47.6"/>
			<path fill-rule="evenodd" class="s3" d="m792.1 575.4l-26.6 51.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m835.4 628.1l-15.1 27.3-2.5-1.4-2.5-1.4 15.3-27.7z"/>
				<path fill-rule="evenodd" class="s0" d="m833.1 626.3l-15.4 27.9"/>
				<path fill-rule="evenodd" class="s0" d="m819.5 644.9l5.1 2.9"/>
				<path fill-rule="evenodd" class="s0" d="m818 648.2l2.6 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m822.9 638.7l5.1 2.8"/>
				<path fill-rule="evenodd" class="s0" d="m826.5 632.3l5.1 2.8"/>
				<path fill-rule="evenodd" class="s0" d="m827.8 636l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m830.6 631.5l2.6 1.4"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m795.4 608.6l16.3 8.7-3.4 6.4-16.4-8.6z"/>
				<path class="s2" d="m794.1 611.3l16.5 8.7-0.7 1.5-16.6-8.8z"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m789.1 635.2l10.2 5.5-1.5 2.8-10.2-5.5z"/>
				<path fill-rule="evenodd" class="s0" d="m790.7 636.9l-1.4 2.5"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m798.3 579.5l-26.4 51.1"/>
			<path fill-rule="evenodd" class="s0" d="m790.8 579.9l5.5 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m788.2 584.2l5.9 3.5"/>
			<path fill-rule="evenodd" class="s0" d="m784.6 591.9l5.4 3.2"/>
			<path fill-rule="evenodd" class="s0" d="m780.8 599.2l5.4 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m777 606.7l5.4 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m772.9 614.2l5.4 3.1"/>
			<path fill-rule="evenodd" class="s0" d="m770.6 618.9l5.4 3.2"/>
			<path fill-rule="evenodd" class="s0" d="m806.5 585.5l-1.5 4.6-1.3 3.6 14.7 9"/>
			<path fill-rule="evenodd" class="s0" d="m820.3 599.2l-15.2-9.9"/>
			<path fill-rule="evenodd" class="s0" d="m754.5 608.4l-5.3 10.2"/>
			<path class="s0" d=""/>
			<path class="s0" d=""/>
			<path fill-rule="evenodd" class="s0" d="m766.4 585l-8.3 16.3"/>
			<path fill-rule="evenodd" class="s0" d="m776.9 564.3l-7.1 14"/>
			<path class="s2" d="m791.7 577.1l-15.8-11.1 0.8-1.2 16.2 10.6z"/>
			<path class="s2" d="m750.8 617l15.5 8.1-0.6 1.2-15.5-8.2z"/>
			<path fill-rule="evenodd" class="s0" d="m751.7 614.6l15.4 8.3"/>
			<path fill-rule="evenodd" class="s0" d="m765.6 616l3.7 2"/>
			<path fill-rule="evenodd" class="s0" d="m753.9 609.7l3.9 2.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m755.3 617l3.2-5.9 7.9 4.3-3.2 5.9z"/>
				<path class="s2" d="m758.5 618c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m760.1 618.9c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m763 618.5c-0.6 1-2.1 1.2-3.5 0.4-1.5-0.8-2.2-2.2-1.6-3.1 0.5-1 2.1-1.2 3.5-0.4 1.4 0.8 2.1 2.2 1.6 3.1z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m763.4 591.8l15.4 8.3"/>
			<path fill-rule="evenodd" class="s0" d="m777.2 593.2l3.8 2"/>
			<path fill-rule="evenodd" class="s0" d="m765.6 586.9l3.9 2.1"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m767.1 594.1l3.2-5.9 7.9 4.3-3.2 5.9z"/>
				<path class="s2" d="m770.2 595.1c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m771.8 596c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m774.6 595.7c-0.5 0.9-2.1 1.1-3.5 0.3-1.4-0.7-2.1-2.1-1.6-3.1 0.6-1 2.1-1.1 3.5-0.4 1.5 0.8 2.2 2.2 1.6 3.2z"/>
			</g>
			<path fill-rule="evenodd" class="s4" d="m773.5 597.4q-0.3 0.4-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<path fill-rule="evenodd" class="s4" d="m785.3 572.9q-0.3 0.4-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<path fill-rule="evenodd" class="s4" d="m699.5 519.1l37.2 18.5"/>
			<path class="s2" d="m734.5 535.6l30.7 21.1-1.2 1.8-30.7-21.1z"/>
			<path fill-rule="evenodd" class="s0" d="m727.9 533.9l14.6 10-3.8 5.6-14.6-10z"/>
			<path fill-rule="evenodd" class="s0" d="m726.1 536.9l14.3 9.9"/>
			<path fill-rule="evenodd" class="s0" d="m735 539.4l-3.8 5.4"/>
			<path fill-rule="evenodd" class="s0" d="m742.2 542.9l-29.5 56"/>
			<path fill-rule="evenodd" class="s0" d="m736.8 585.7l9.5 5.2"/>
			<path fill-rule="evenodd" class="s4" d="m757.8 554.8q-0.3 0.5-0.6 0.9c-1.3 2.4-1.5 4.8-0.4 5.4 1.1 0.6 3-0.9 4.4-3.2 1.4-2.3 0.3-0.6 0.5-0.9l-3.9-2.1z"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m749.6 548.2l-3.5 5.7-7.6-4.6 3.5-5.8z"/>
				<path class="s2" d="m746.7 548.3c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m745.1 547.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m747.7 550.6c-0.6 0.9-2.2 1-3.6 0.2-1.3-0.9-2-2.3-1.4-3.2 0.6-1 2.2-1.1 3.5-0.2 1.4 0.8 2 2.2 1.5 3.2z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m740.8 568.3l13.7 7.4"/>
			<path fill-rule="evenodd" class="s0" d="m745.7 571.3l-4 7.2 9 4.9"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m731.9 575.6l-7.9 15.1-2.7-1.5-2.7-1.4 7.9-15z"/>
				<path fill-rule="evenodd" class="s0" d="m729.7 574.5l-7.9 15"/>
				<path fill-rule="evenodd" class="s0" d="m725.4 575.2l3.3 1.7"/>
				<path fill-rule="evenodd" class="s0" d="m724.1 577.7l3.3 1.7"/>
				<path fill-rule="evenodd" class="s0" d="m719.9 585.7l3.3 1.8"/>
				<path fill-rule="evenodd" class="s0" d="m724.6 583.1l3.2 1.7"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m667.3 578.5l-53.9 98.1"/>
			<path fill-rule="evenodd" class="s0" d="m671.6 570.7l31-57.2 62.9 43.5"/>
			<path fill-rule="evenodd" class="s0" d="m645.8 617.5l37.8 20"/>
			<path fill-rule="evenodd" class="s0" d="m690.3 615.4l-11.1 20.1"/>
			<path fill-rule="evenodd" class="s0" d="m708.8 613.6l-34.2 62.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m698 650.8l-16.2 29.2-3.6-2-3.5-2 16.1-29.2z"/>
				<path fill-rule="evenodd" class="s0" d="m694.4 648.8l-16.3 29.5"/>
				<path fill-rule="evenodd" class="s0" d="m679.1 668l7.2 3.9"/>
				<path fill-rule="evenodd" class="s0" d="m677.7 671.5l3.5 2"/>
				<path fill-rule="evenodd" class="s0" d="m682.7 661.4l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m686.5 654.6l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m688.8 659.1l3.6 2"/>
				<path fill-rule="evenodd" class="s0" d="m691.9 654.4l3.6 2"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m736.8 643.6l-28 50.5-3.6-2-3.6-2 27.9-50.4z"/>
				<path fill-rule="evenodd" class="s0" d="m733.1 641.7l-28.1 50.9"/>
				<path fill-rule="evenodd" class="s0" d="m709.3 676.2l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m706.5 682.2l3.6 2"/>
				<path fill-rule="evenodd" class="s0" d="m715.6 664.9l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m722.1 653.1l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m723.4 659.4l3.6 2"/>
				<path fill-rule="evenodd" class="s0" d="m728.5 651.1l3.6 2"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m731.6 620.1l-8.7 15.6 14.5 7.7"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m782.4 662.1l-29.4-15.9 2-3.6 1.9-3.6 29.3 15.9z"/>
				<path fill-rule="evenodd" class="s0" d="m784.3 658.5l-29.6-16.1"/>
				<path fill-rule="evenodd" class="s0" d="m765 643.4l-3.9 7.2"/>
				<path fill-rule="evenodd" class="s0" d="m761.5 642l-2 3.6"/>
				<path fill-rule="evenodd" class="s0" d="m771.6 646.9l-3.9 7.2"/>
				<path fill-rule="evenodd" class="s0" d="m778.2 650.2l-8.6 15.6"/>
				<path fill-rule="evenodd" class="s0" d="m773.9 653l-1.9 3.6"/>
				<path fill-rule="evenodd" class="s0" d="m778.7 656l-1.9 3.6"/>
			</g>
			<g>
				<path fill-rule="evenodd" class="s0" d="m767.5 687.5l-16.2 29.2-3.6-2-3.6-2 16.1-29.2z"/>
				<path fill-rule="evenodd" class="s0" d="m763.8 685.5l-16.2 29.4"/>
				<path fill-rule="evenodd" class="s0" d="m748.6 704.7l7.1 3.9"/>
				<path fill-rule="evenodd" class="s0" d="m747.1 708.2l3.6 2"/>
				<path fill-rule="evenodd" class="s0" d="m752.2 698.1l7.2 4"/>
				<path fill-rule="evenodd" class="s0" d="m756 691.3l7.1 4"/>
				<path fill-rule="evenodd" class="s0" d="m758.3 695.8l3.5 2"/>
				<path fill-rule="evenodd" class="s0" d="m761.3 691.1l3.6 1.9"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m777.3 669l-5.5 10.2-3.6-1.9-3.7-1.9 5.5-10.2z"/>
			<path fill-rule="evenodd" class="s0" d="m768.6 668.5l7.2 4"/>
			<g>
				<path fill-rule="evenodd" class="s4" d="m764.7 675.4l6 3.1-4.2 7.9-5.9-3.1z"/>
				<path class="s2" d="m763.5 679.4c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path class="s2" d="m762.6 681c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
				<path fill-rule="evenodd" class="s4" d="m766 681c-0.8 1.4-2.2 2.2-3.1 1.7-1-0.6-1.2-2.1-0.5-3.5 0.8-1.5 2.2-2.2 3.2-1.7 0.9 0.5 1.1 2.1 0.4 3.5z"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m773.7 728.3l2.2-4.3 65.1 34-2.2 4.6"/>
			<path fill-rule="evenodd" class="s0" d="m667.9 578.6l-9.4-5c0 0 2.6-8.8 13.5-2.5"/>
			<path fill-rule="evenodd" class="s0" d="m755.1 608.3l-9.2-5.4c0 0 3.7-7.1 11.4-2.7l1.4 0.8"/>
			<path fill-rule="evenodd" class="s0" d="m766.7 585.3l-9.2-5.4c0 0 3.7-7.1 11.4-2.7l1.4 0.8"/>
			<path fill-rule="evenodd" class="s0" d="m760.3 566l1.8 1 5.1-9.4c0 0 7.2 3.5 3 11.3l-0.8 1.4 3.4 1.9"/>
			<path fill-rule="evenodd" class="s0" d="m741.1 568.9l0.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6 8.9-2.5-1.4"/>
			<path fill-rule="evenodd" class="s0" d="m722.2 604.8l0.7-1.4c4-7.9-3.3-11.2-3.3-11.2l-4.6 8.9"/>
			<path fill-rule="evenodd" class="s0" d="m733.6 627.5l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-10.5 19.6"/>
			<path fill-rule="evenodd" class="s0" d="m775.4 632.9l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.7 8.5"/>
			<path fill-rule="evenodd" class="s0" d="m806 649l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.7 8.5 1.5 0.8"/>
			<path fill-rule="evenodd" class="s0" d="m787.2 665.4l0.8-1.4c4.3-7.7 11.2-3.5 11.2-3.5l-4.9 8.7"/>
			<path fill-rule="evenodd" class="s0" d="m812 657.2l1.4 0.8c7.7 4.3 3.5 11.2 3.5 11.2l-8.7-4.9-1 1.8"/>
			<path fill-rule="evenodd" class="s0" d="m886.6 663.9l-0.9 1.3c-5 7.3-11.4 2.4-11.4 2.4l5.7-8.2"/>
			<path fill-rule="evenodd" class="s0" d="m871.2 719.6l1.4 0.8c7.8 4.2 11.3-3 11.3-3l-8.8-4.8"/>
			<path fill-rule="evenodd" class="s0" d="m835.5 761l-1.2 2.3-208.5-109.4"/>
			<path fill-rule="evenodd" class="s3" d="m604 633.9l10.2 5.5"/>
			<path fill-rule="evenodd" class="s0" d="m590.9 624.9l-4.7 8.7c0 0 3.9 2.9 7.8 0.6 3.9-2.3 2.4-2.1 3.5-4.2"/>
			<path fill-rule="evenodd" class="s0" d="m604.6 633.1l-4.6 8.8c0 0-4.5-1.5-4.8-6-0.3-4.5 0.8-3.2 2.2-5.7"/>
			<path fill-rule="evenodd" class="s0" d="m589.2 626.1l-11.7 21.9c0 0-37.5-19.5-92.8-48.7"/>
			<path fill-rule="evenodd" class="s0" d="m614.3 638.3l-4.7 8.7c0 0 4.2 3 8.3 0.6 4.1-2.4 2.5-2.1 3.7-4.2"/>
			<path fill-rule="evenodd" class="s0" d="m629.1 646.4l-4.8 8.9c0 0-4.8-1.5-5.1-6.1-0.1-1.7 0.9-3.2 2.3-5.7"/>
			<path fill-rule="evenodd" class="s3" d="m591.8 657.8l10.2 5.6"/>
			<path fill-rule="evenodd" class="s0" d="m577.4 648.1l-4.7 8.7c0 0 4.7 3.4 8.9 1.2 4.2-2.2 2.5-2 3.7-4.1"/>
			<path fill-rule="evenodd" class="s0" d="m592.4 657l-4.6 8.8c0 0-4.5-1.5-4.8-6-0.3-4.5 0.8-3.2 2.2-5.7"/>
			<path fill-rule="evenodd" class="s0" d="m602 662.3l-4.7 8.7c0 0 4.2 3 8.3 0.6 4.1-2.4 2.5-2.1 3.7-4.2"/>
			<path fill-rule="evenodd" class="s0" d="m616.8 670.4l-4.8 8.9c0 0-4.8-1.5-5.1-6.1-0.1-1.7 0.9-3.2 2.3-5.7"/>
			<path fill-rule="evenodd" class="s0" d="m471 594.2l0.9-1.7 5.5 2.8"/>
			<path fill-rule="evenodd" class="s0" d="m362 496.1c3.5 1.8 5.2 2.8 6.2 4.4 2.5 3.8-0.2 7.7-0.2 7.7l-8.9-4.8-0.9 1.5"/>
			<path fill-rule="evenodd" class="s0" d="m231.2 372.4l8.9 4.8c0 0 2.8-3.8 0.4-7.7-2.4-3.9-2-2.6-5.3-4.5"/>
			<path fill-rule="evenodd" class="s0" d="m127.5 370.7l8.9 4.8c0 0 3-2.5 1.3-7-1.7-4.5-2-3.5-6.1-5.4"/>
			<path fill-rule="evenodd" class="s0" d="m166.8 408l-2.9 4.9c-3-2-5.2-2.8-7.1-2.7-4.5 0-6.3 4.4-6.3 4.4l8.8 5-3 5.5"/>
			<path fill-rule="evenodd" class="s0" d="m147.4 397.6l-2.9 4.9c-3-2-5.2-2.8-7.1-2.7-4.5 0-6.3 4.4-6.3 4.4l8.8 5-3 5.5"/>
			<path fill-rule="evenodd" class="s0" d="m217.2 297.2l6 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m215.1 309.8l3.4-6.3 2.3 1.3-3.4 6.2z"/>
			<path fill-rule="evenodd" class="s0" d="m225.3 283l6.1 3.4"/>
			<path fill-rule="evenodd" class="s0" d="m251.5 198.4l-8.3 15.1 2.9 1.6 2.5 1.3"/>
			<path fill-rule="evenodd" class="s0" d="m254.2 200.3l-7.8 14.4"/>
			<path fill-rule="evenodd" class="s0" d="m250 201.4l2.7 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m248.4 204.1l2.8 1.5"/>
			<path fill-rule="evenodd" class="s0" d="m246.9 207l2.7 1.5"/>
			<path fill-rule="evenodd" class="s0" d="m244.8 210.4l2.8 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m584.8 433.7l14.9 10.6-2.9 4.1-14.9-10.6z"/>
			<path fill-rule="evenodd" class="s0" d="m506.7 452l-8.5-5c0 0 1.7-4.4 6.3-4.5 4.6-0.1 3.4 0.4 6.4 2.4"/>
			<path fill-rule="evenodd" class="s0" d="m529 427.4l8.4 4.6-4.5 8.3-8.4-4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m505.4 414.7l8.4 4.6-4.5 8.3-8.4-4.5z"/>
			<path fill-rule="evenodd" class="s0" d="m226.2 205.1l11.5-16.4"/>
			<path fill-rule="evenodd" class="s0" d="m221.3 202.2l9.9-18.1"/>
			<path fill-rule="evenodd" class="s0" d="m223.8 204l6.2-10.6 2.3-4"/>
			<path fill-rule="evenodd" class="s0" d="m229.4 187.3l6.2 4.3"/>
			<path fill-rule="evenodd" class="s0" d="m232.9 195.4l-2.9-2"/>
			<path fill-rule="evenodd" class="s0" d="m223.8 198.3l2.4 1.6"/>
			<path fill-rule="evenodd" class="s0" d="m226.4 284.1c0 0-2.7 4.3 1.4 8.4"/>
			<path fill-rule="evenodd" class="s0" d="m144 341.2c-0.4-0.2-47.9-26.6-47.9-26.6l-8.8 15.2"/>
			<path fill-rule="evenodd" class="s0" d="m82.3 339.2l-8.9 15.7"/>
			<path fill-rule="evenodd" class="s0" d="m83.1 339.1l-10.9-5.8c0 0 0.4-4.7 6.2-6.1 2.3-0.5 4.9-0.4 9.7 2.4"/>
			<path fill-rule="evenodd" class="s4" d="m577.6 592.1v6.7l22.9 3.1 8.9-16.3c0 0 16.4-94.4 17.7-100.8 1.3-6.4-1.3-4.1-2.8-3.6-1.5 0.5-1.5 0.9-1.9 1.7-3 5.9-18.3 35.4-18.7 36.1-0.4 0.7-1.7 11-1.7 11l10.6 1.2-5.7 35.1-15.8 28.2-34.7-5.3"/>
			<path fill-rule="evenodd" class="s4" d="m559.5 583.5l29.1 5.4 13.4-25.4 5.6-32.8"/>
			<path fill-rule="evenodd" class="s4" d="m602 530.1l-5.5 32-11 20.6-23.1-4.2"/>
			<path fill-rule="evenodd" class="s4" d="m563.6 575.9l9.1 1.6 0.3 3"/>
			<path fill-rule="evenodd" class="s4" d="m561.1 581.1l9.3 1.6 0.4 3"/>
			<path fill-rule="evenodd" class="s4" d="m591.9 598.6l16.2-30.8h2.5l-3 17.2-8.5 14.8z"/>
			<path fill-rule="evenodd" class="s4" d="m604.8 528.4l12.2 1.3 7.4-42.4-1.4-0.5-16.7 31.6c-0.3 0.6-0.6 1.3-0.6 2l-0.9 7.9z"/>
			<path fill-rule="evenodd" class="s0" d="m158.4 435.3l3.6-6.7"/>
			<path fill-rule="evenodd" class="s0" d="m151.8 431.6l3.6-6.6"/>
			<path fill-rule="evenodd" class="s0" d="m146.4 428.7l3.6-6.6"/>
			<path fill-rule="evenodd" class="s0" d="m161.6 433.2l-33.9-18.3"/>
			<path fill-rule="evenodd" class="s0" d="m164 438.5l-4-2.2 2.5-4.5 3.9 2.2z"/>
			<path fill-rule="evenodd" class="s0" d="m135.1 422.5l3.6-6.6"/>
			<g>
				<path fill-rule="evenodd" class="s0" d="m202.9 452.3c18.6 9.9 36.1 19.3 52.4 27.9l1.2-2.2-42.2-22.3"/>
				<path fill-rule="evenodd" class="s0" d="m214.3 455.7c-3.4-1.8-6.6-3.5-10.2-5.3"/>
				<path fill-rule="evenodd" class="s0" d="m204.6 450.1l-11.9 22.1"/>
				<path fill-rule="evenodd" class="s0" d="m213.5 495.2l-10.3 19.4"/>
				<path fill-rule="evenodd" class="s0" d="m255.4 480.1l-10.6 19.7"/>
				<g>
					<path fill-rule="evenodd" class="s0" d="m173.9 527.9l7 3.8-2.5 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m180.9 531.7l7.1 3.8-2.6 4.8-7.1-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m188 535.5l7.1 3.7-2.6 4.9-7-3.7z"/>
					<path fill-rule="evenodd" class="s0" d="m195.2 539.2l7 3.7-2.5 4.9-7.1-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m202.1 542.9l7.1 3.8-2.6 4.8-7-3.7z"/>
				</g>
				<g>
					<path fill-rule="evenodd" class="s0" d="m184.7 506.7l7.3 3.8-2.5 4.9-7.4-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m192.1 510.5l7.3 3.9-2.6 4.9-7.3-3.9z"/>
					<path fill-rule="evenodd" class="s0" d="m199.3 514.4l7.3 3.9-2.5 4.8-7.4-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m206.7 518.3l7.4 3.9-2.6 4.8-7.3-3.8z"/>
					<path fill-rule="evenodd" class="s0" d="m214 522.2l7.4 3.8-2.6 4.9-7.3-3.9z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m171.1 532.5l6.4-11.9"/>
				<path fill-rule="evenodd" class="s0" d="m206.4 551.3l6.6-12.2"/>
				<path fill-rule="evenodd" class="s0" d="m180.4 514l15-27.7-8.6-4.8 1.2-2.2 9 4.7c0 0 2.7-3.9 0.3-7.7-2.4-3.8-1.8-2.4-5.1-4.1"/>
				<path fill-rule="evenodd" class="s0" d="m185.2 504.6l36.9 19.4"/>
				<path fill-rule="evenodd" class="s4" d="m206.1 507.7c-0.3-0.2-0.6-0.4-0.9-0.5-2.4-1.3-4.8-1.5-5.4-0.4-0.6 1.1 0.9 3 3.3 4.3 2.4 1.3 0.6 0.3 1 0.5l2.1-3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m190.6 495.2l5.9 3.2-4.2 7.9-5.9-3.2z"/>
					<path class="s2" d="m189.8 499.2c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m188.9 500.8c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m192.3 501.3c-0.7 1.4-2.1 2.1-3.1 1.6-1-0.5-1.1-2.1-0.4-3.5 0.8-1.4 2.2-2.1 3.2-1.6 0.9 0.5 1.1 2.1 0.3 3.5z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m204.3 490.2l18.3 10.1"/>
				<path fill-rule="evenodd" class="s4" d="m205 512.2c0.3 0.2 0.6 0.4 0.9 0.5 2.4 1.3 4.8 1.5 5.4 0.4 0.6-1.1-0.9-3-3.3-4.3-2.4-1.3-0.6-0.3-1-0.5l-2.1 3.9z"/>
				<g>
					<path fill-rule="evenodd" class="s4" d="m222.8 522.5l-5.9-3.2 4.3-7.9 5.9 3.2z"/>
					<path class="s2" d="m223.7 519.8c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path class="s2" d="m224.6 518.2c-0.3 0-0.6-0.3-0.6-0.6 0-0.3 0.3-0.6 0.6-0.6 0.3 0 0.6 0.3 0.6 0.6 0 0.3-0.3 0.6-0.6 0.6z"/>
					<path fill-rule="evenodd" class="s4" d="m224.6 518.6c-0.7 1.4-2.1 2.1-3.1 1.6-1-0.6-1.1-2.1-0.4-3.5 0.8-1.5 2.2-2.2 3.2-1.6 0.9 0.5 1.1 2.1 0.3 3.5z"/>
				</g>
				<path fill-rule="evenodd" class="s0" d="m190.4 513.5l21.9 11.4"/>
				<path fill-rule="evenodd" class="s0" d="m211.4 521.3l-1.2 2.6"/>
				<path fill-rule="evenodd" class="s0" d="m193.7 512l-1.2 2.6"/>
				<path fill-rule="evenodd" class="s0" d="m260.7 490.9c1.8-3.2 2.5-5.1 2.4-7-0.2-4.5-4.7-6.1-4.7-6.1l-4.6 9-1.3-0.7"/>
				<path fill-rule="evenodd" class="s0" d="m200.4 458.2l-1.8-0.9 4.9-8.6c0 0-3.7-2.9-7.7-0.7-4 2.2-2.8 2.5-4.7 5.8l-5.2-3"/>
				<path fill-rule="evenodd" class="s0" d="m223.1 500c-1.9 3.1-1.6 5.2-1.6 5.8 0.2 4.5 4.7 6.1 4.7 6.1l4-7.8 2.9 1.7"/>
				<path fill-rule="evenodd" class="s0" d="m204.4 489.6c-1.8 3-2.6 4.5-4.2 5.6-3.8 2.4-7.3-1-7.3-1l3.9-7.2-2.3-1.2"/>
				<path fill-rule="evenodd" class="s0" d="m245 500.4c-3.4-1.9-4.9-2.5-6.8-2.5-4.5 0-6.3 4.5-6.3 4.5l8.9 4.9-1.1 1.9-7.6-4-14.7 27.6"/>
				<path fill-rule="evenodd" class="s0" d="m217.4 532.2l8.9 4.8c0 0-1.7 4.4-6.2 4.5-4.5 0.1-4.3-1.1-7.5-2.8"/>
				<path fill-rule="evenodd" class="s0" d="m180.4 513.4l-9-4.6c0 0-2.7 3.9-0.2 7.7 2.5 3.8 3.3 3 6.7 4.7"/>
				<path fill-rule="evenodd" class="s0" d="m196.8 464.6l4.6 2.6 4.7-8.5 42.4 22.5-4.6 8.5 4.4 2.6"/>
				<path fill-rule="evenodd" class="s0" d="m200.1 465.9l5.3-9.6 45.9 23.9-5.8 10.6"/>
				<path fill-rule="evenodd" class="s0" d="m198.3 462.4l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m199.7 460.2l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m200.9 457.8l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m202.1 455.6l2.4 1.3"/>
				<path fill-rule="evenodd" class="s0" d="m247.1 488.4l2.5 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m248.5 486.2l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m249.7 483.8l2.4 1.4"/>
				<path fill-rule="evenodd" class="s0" d="m250.9 481.6l2.4 1.3"/>
			</g>
			<path fill-rule="evenodd" class="s0" d="m797.6 546.2l-5.9 7.4 8.8 6.1c0 0-4.3 6.8-11.6 1.8l-2-1.4-5.6 8"/>
			<path fill-rule="evenodd" class="s0" d="m815 558.8l-5.9 7.4 8.8 6.1c0 0-4.3 6.8-11.6 1.8l-2-1.4-5.6 8"/>
			<path fill-rule="evenodd" class="s0" d="m834.1 604.3l-1.7-1.1 6-8.6c0 0-6.4-4.9-11.5 2.3l-1.5 2.1"/>
			<path fill-rule="evenodd" class="s0" d="m736.9 638.5l2.8 1.5 5.1-9.4c0 0 7.2 3.5 3 11.3l-1 1.8"/>
			<path fill-rule="evenodd" class="s0" d="m731.7 620.6l-1.4-0.8c-7.7-4.4-3.4-11.2-3.4-11.2l8 4.4 0.7-1.1 29.4-55.2"/>
			<path fill-rule="evenodd" class="s0" d="m693.4 642.2l-2.8-1.5-5.1 9.4c0 0-7.2-3.6-3-11.3l1-1.8"/>
			<path fill-rule="evenodd" class="s0" d="m708.4 613.3l2.8 1.6-4.8 8.1c0 0 6.8 4.3 11.2-3.3l0.8-1.5"/>
			<path fill-rule="evenodd" class="s0" d="m695.9 606.1l-1.6 2.8-9.3-5.2c0 0-4.2 6.9 3.5 11.1l1.8 1"/>
			<path fill-rule="evenodd" class="s0" d="m200.3 215.5l9.3 5"/>
			<path fill-rule="evenodd" class="s0" d="m184.9 151.4l-23.5 44.4"/>
		</g>
		<g id="areas">
			<path id="room_145" class="s5" d="m766.5 522.1l48.6 34.9 13.5-17.4h98.7v-77.6h-16.5v-8.1h-16.3v-5.3h-76.1z"/>
			<path id="room_132" class="s5" d="m1177.6 333.5v17.4h-18.6v51.5h13.8v16.9h88.3v-85.3z"/>
			<path id="middle_east_wing" class="s5" d="m874.7 333.4h261.5v85.4h-261.5z"/>
			<path id="room_114" class="s5" d="m818 333.4v85.4h-115.4v-85.4z"/>
			<path id="room_142" class="s5" d="m944.2 454.2h16.4v-12.8h49v98.2h-79.2v-76.8h13.8z"/>
			<path id="room_133" class="s5" d="m1192.1 454.2h16.4v-12.8h49v98.2h-79.3v-76.8h13.9z"/>
			<path id="room_135" class="s5" d="m1109.5 454.2h16.3v-12.8h49v98.2h-79.2v-76.8h13.9z"/>
			<path id="room_139" class="s5" d="m1078.7 454.2h-16.3v-12.8h-49v98.2h79.2v-76.8h-13.9z"/>
			<path id="room_129" class="s5" d="m1126.7 302h16.4v12.8h49v-98.2h-79.3v76.8h13.9z"/>
			<path id="room_127" class="s5" d="m1096 302h-16.4v12.8h-49v-98.2h79.2v76.8h-13.8z"/>
			<path id="room_124" class="s5" d="m962.7 302h16.4v12.8h49v-98.2h-79.2v76.8h13.8z"/>
			<path id="room_119" class="s5" d="m932.5 302h-16.3v12.8h-49v-98.2h79.2v76.8h-13.9z"/>
			<path id="room_113" class="s5" d="m799 302h16.4v12.8h49v-98.2h-79.2v76.8h13.8z"/>
			<path id="room_108" class="s5" d="m585.8 282.5l16.1 2.7-2.1 12.7 48.3 8.1 16.2-96.9-78.1-13.1-12.7 75.8 13.7 2.3z"/>
			<path id="room_111" class="s5" d="m768.7 302h-16.3v12.8h-49v-98.2h79.2v76.8h-13.9z"/>
			<path id="room_105" class="s5" d="m555.5 277.6l-16.1-2.7-2.1 12.7-48.4-8.1 16.2-96.9 78.2 13-12.7 75.8-13.7-2.3z"/>
			<path id="middle_west_wing" class="s5" d="m489.8 302.6l-2.3 26 114.2 80.2 36.3 6 12.7-83.8-5.9-1.1-1.3 8.5-16.7-3 1.3-7.9z"/>
			<path id="room_175" class="s5" d="m408.4 658.6l81.9 43.4 41.7-75.2-61.1-32.3-3.1 5.8-14-7.5-11.5 21.4-7.5-4.2z"/>
			<path id="room_169" class="s5" d="m207.6 552.6l81.9 43.4 41.7-75.2-61.1-32.3-3 5.7-14.1-7.4-11.5 21.4-7.5-4.2z"/>
			<path id="room_172" class="s5" d="m290.1 596.3l82.6 44 24.1-46.3-7.4-4.1 13-23.6-15.2-8.6 3.1-5.5-58.8-31z"/>
			<path id="room_166" class="s5" d="m87.3 489.3l82.6 43.9 24.2-46.2-7.4-4.1 13-23.7-15.2-8.5 3.1-5.5-58.8-31.1z"/>
			<path id="front_office" class="s5" d="m702.6 513.5l-75.4 138 116.9 61.2 34.1-62.5-21.3-11.2-4.3 8-15.7-8.5 11-20.7 17.6 9.3 26.6-51.7z"/>
			<path id="back_office" class="s5" d="m766.1 627.4l26.7-51.3 113.7 78.3-59.7 112.6-101.4-53.6 40.8-75.2z"/>
			<path id="lunchroom" class="s5" d="m389.7 294.1l-93.5 180.6-223.3-118.8 23.2-41.3 47.4 25.7 64.4-119.2-49.1-26.6 25.3-46.6z"/>
			<path id="multi_purpose_room" class="s5" d="m390.3 294.5l236.1 165.8-80.4 148-249.3-133.3z"/>
			<path id="hallways" fill-rule="evenodd" class="s6" d="m1155.5 420.4h102v20.6h-438.9l-58.2 79.1 53.9 38.9-13 17.2-99.6-69.8-89.2 160.8-72.8-38.9-401.4-213.4 9.1-17.1 401 214.3 82.6-153.5-12.8-7.7-340.3-240.3 13.6-24.2 100 16.6 6.6-38.5 104 17.8-15.9 98.6 164.2 28.3 13.3-80.7 37.1 3.2v86.4h494.2v-102h45.3v114.9h-84.8zm-515.8-3.7l13.3-86.9-165.6-29.5-2.5 28.2 116.2 83.3 38.6 4.8zm497.8-85.7h-436.8v89.1h436.8z"/>
		</g>
		<g id="text">
			<text id="ROOM 133
" style="transform: matrix(1,0,0,1,1200.6,501.4)" >
				<tspan x="0" y="0" class="t7">ROOM 133
</tspan>
			</text>
			<text id="ROOM 135
" style="transform: matrix(1,0,0,1,1117.8,501.4)" >
				<tspan x="0" y="0" class="t7">ROOM 135
</tspan>
			</text>
			<text id="ROOM 139
" style="transform: matrix(1,0,0,1,1031.9,501.4)" >
				<tspan x="0" y="0" class="t7">ROOM 139
</tspan>
			</text>
			<text id="ROOM 142
" style="transform: matrix(1,0,0,1,951.3,501.4)" >
				<tspan x="0" y="0" class="t7">ROOM 142
</tspan>
			</text>
			<g>
				<text id="ROOM 145
" style="transform: matrix(1,0,0,1,841.1,495.3)" >
					<tspan x="0" y="0" class="t7">ROOM 145
</tspan>
				</text>
				<text id="LIBRARY
" style="transform: matrix(1,0,0,1,841.1,505.3)" >
					<tspan x="0" y="0" class="t7">LIBRARY
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 132
" style="transform: matrix(1,0,0,1,1193.9,374.2)" >
					<tspan x="0" y="0" class="t7">ROOM 132
</tspan>
				</text>
				<text id="MULTI-MEDIA
" style="transform: matrix(1,0,0,1,1187.8,383.2)" >
					<tspan x="0" y="0" class="t7">MULTI-MEDIA
</tspan>
				</text>
				<text id="ACTIVITY
" style="transform: matrix(1,0,0,1,1196.5,392.2)" >
					<tspan x="0" y="0" class="t7">ACTIVITY
</tspan>
				</text>
			</g>
			<text id="ROOM 126
" style="transform: matrix(1,0,0,1,1021.4,378.6)" >
				<tspan x="0" y="0" class="t7">ROOM 126
</tspan>
			</text>
			<text id="ELECTRICAL
" style="transform: matrix(0,1,-1,0,998.9,341.1)" >
				<tspan x="0" y="0" class="t8">ELECTRICAL
</tspan>
			</text>
			<text id="DATA
" style="transform: matrix(1,0,0,1,990.4,405.5)" >
				<tspan x="0" y="0" class="t7">DATA
</tspan>
			</text>
			<text id="MECHANICAL
" style="transform: matrix(0,1,-1,0,973.5,379.8)" >
				<tspan x="0" y="0" class="t9">MECHANICAL
</tspan>
			</text>
			<text id="122
" style="transform: matrix(1,0,0,1,939.6,359.3)" >
				<tspan x="0" y="0" class="t7">122
</tspan>
			</text>
			<text id="123
" style="transform: matrix(1,0,0,1,966.5,359.3)" >
				<tspan x="0" y="0" class="t7">123
</tspan>
			</text>
			<g>
				<text id="ROOM 114
" style="transform: matrix(1,0,0,1,731.8,375.3)" >
					<tspan x="0" y="0" class="t7">ROOM 114
</tspan>
				</text>
				<text id="STEM LAB
" style="transform: matrix(1,0,0,1,731.8,387.3)" >
					<tspan x="0" y="0" class="t7">STEM LAB
</tspan>
				</text>
			</g>
			<text id="ROOM 111
" style="transform: matrix(1,0,0,1,723,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 111
</tspan>
			</text>
			<text id="ROOM 113
" style="transform: matrix(1,0,0,1,804.5,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 113
</tspan>
			</text>
			<text id="ROOM 119
" style="transform: matrix(1,0,0,1,887.1,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 119
</tspan>
			</text>
			<text id="ROOM 124
" style="transform: matrix(1,0,0,1,967.8,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 124
</tspan>
			</text>
			<text id="ROOM 127
" style="transform: matrix(1,0,0,1,1051.3,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 127
</tspan>
			</text>
			<text id="ROOM 129
" style="transform: matrix(1,0,0,1,1131.9,264.5)" >
				<tspan x="0" y="0" class="t7">ROOM 129
</tspan>
			</text>
			<g>
				<text id="ROOM 185
" style="transform: matrix(.885,.465,-0.465,.885,799,703.3)" >
					<tspan x="0" y="0" class="t7">ROOM 185
</tspan>
				</text>
				<text id="FACULTY LOUNGE
" style="transform: matrix(.885,.465,-0.465,.885,782.067,704.575)" >
					<tspan x="0" y="0" class="t7">FACULTY LOUNGE
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 187
" style="transform: matrix(.885,.465,-0.465,.885,832.4,654.9)" >
					<tspan x="0" y="0" class="t7">ROOM 187
</tspan>
				</text>
				<text id="WORKROOM
" style="transform: matrix(.885,.465,-0.465,.885,824.498,660.916)" >
					<tspan x="0" y="0" class="t7">WORKROOM
</tspan>
				</text>
			</g>
			<g>
				<text id="183
" style="transform: matrix(.885,.465,-0.465,.885,738,669.9)" >
					<tspan x="0" y="0" class="t7">183
</tspan>
				</text>
				<text id="CONF
" style="transform: matrix(.885,.465,-0.465,.885,730.452,676.102)" >
					<tspan x="0" y="0" class="t7">CONF
</tspan>
				</text>
			</g>
			<g>
				<text id="179
" style="transform: matrix(.885,.465,-0.465,.885,655.4,644.4)" >
					<tspan x="0" y="0" class="t7">179
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,655.4,644.4)" >
					<tspan x="0" y="0" class="t7">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="178
" style="transform: matrix(.885,.465,-0.465,.885,663.1,610.9)" >
					<tspan x="0" y="0" class="t7">178
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,663.1,610.9)" >
					<tspan x="0" y="0" class="t7">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="177
" style="transform: matrix(.885,.465,-0.465,.885,698.8,558.1)" >
					<tspan x="0" y="0" class="t7">177
</tspan>
				</text>
				<text id="FRONT
" style="transform: matrix(.885,.465,-0.465,.885,698.8,558.1)" >
					<tspan x="0" y="0" class="t7">FRONT
</tspan>
				</text>
				<text id="OFFICE
" style="transform: matrix(.885,.465,-0.465,.885,698.8,558.1)" >
					<tspan x="0" y="0" class="t7">OFFICE
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 147
" style="transform: matrix(.885,.465,-0.465,.885,426.8,451.6)" >
					<tspan x="0" y="0" class="t7">ROOM 147
</tspan>
				</text>
				<text id="MULTI-PURPOSE
" style="transform: matrix(.885,.465,-0.465,.885,412.346,454.176)" >
					<tspan x="0" y="0" class="t7">MULTI-PURPOSE
</tspan>
				</text>
				<text id="ROOM
" style="transform: matrix(.885,.465,-0.465,.885,425.87,471.442)" >
					<tspan x="0" y="0" class="t7">ROOM
</tspan>
				</text>
			</g>
			<g>
				<text id="ROOM 149
" style="transform: matrix(.885,.465,-0.465,.885,515.6,497.9)" >
					<tspan x="0" y="0" class="t7">ROOM 149
</tspan>
				</text>
				<text id="MULTI-PURPOSE
" style="transform: matrix(.885,.465,-0.465,.885,500.438,500.105)" >
					<tspan x="0" y="0" class="t7">MULTI-PURPOSE
</tspan>
				</text>
				<text id="ROOM
" style="transform: matrix(.885,.465,-0.465,.885,513.962,517.37)" >
					<tspan x="0" y="0" class="t7">ROOM
</tspan>
				</text>
			</g>
			<text id="ROOM 175
" style="transform: matrix(.885,.465,-0.465,.885,453.6,642.8)" >
				<tspan x="0" y="0" class="t7">ROOM 175
</tspan>
			</text>
			<text id="ROOM 172
" style="transform: matrix(.885,.465,-0.465,.885,329.9,576.5)" >
				<tspan x="0" y="0" class="t7">ROOM 172
</tspan>
			</text>
			<text id="ROOM 169
" style="transform: matrix(.885,.465,-0.465,.885,249.6,532.4)" >
				<tspan x="0" y="0" class="t7">ROOM 169
</tspan>
			</text>
			<text id="ROOM 166
" style="transform: matrix(.885,.465,-0.465,.885,126,468.6)" >
				<tspan x="0" y="0" class="t7">ROOM 166
</tspan>
			</text>
			<g>
				<text id="ROOM 156
" style="transform: matrix(.885,.465,-0.465,.885,276.9,347.9)" >
					<tspan x="0" y="0" class="t7">ROOM 156
</tspan>
				</text>
				<text id="LUNCHROOM
" style="transform: matrix(.885,.465,-0.465,.885,266.9,355.9)" >
					<tspan x="0" y="0" class="t7">LUNCHROOM
</tspan>
				</text>
			</g>
			<text id="KITCHEN
" style="transform: matrix(.466,-0.885,.885,.466,259.1,285.4)" >
				<tspan x="0" y="0" class="t7">KITCHEN
</tspan>
			</text>
			<text id="STORAGE
" style="transform: matrix(.466,-0.885,.885,.466,157.8,378)" >
				<tspan x="0" y="0" class="t7">STORAGE
</tspan>
			</text>
			<text id="KITCHEN
" style="transform: matrix(.466,-0.885,.885,.466,232,254.2)" >
				<tspan x="0" y="0" class="t7">KITCHEN
</tspan>
			</text>
			<text id="STORAGE
" style="transform: matrix(.879,.477,-0.477,.879,509.9,404.5)" >
				<tspan x="0" y="0" class="t7">STORAGE
</tspan>
			</text>
			<text id="ROOM 108
" style="transform: matrix(.985,.174,-0.174,.985,598.5,243.9)" >
				<tspan x="0" y="0" class="t7">ROOM 108
</tspan>
			</text>
			<text id="ROOM 105
" style="transform: matrix(.985,.174,-0.174,.985,518.6,231.7)" >
				<tspan x="0" y="0" class="t7">ROOM 105
</tspan>
			</text>
			<text id="DATA
" style="transform: matrix(.992,.125,-0.125,.992,517.4,327.4)" >
				<tspan x="0" y="0" class="t7">DATA
</tspan>
			</text>
			<text id="OFFICE
" style="transform: matrix(.987,.163,-0.163,.987,545.6,352.3)" >
				<tspan x="0" y="0" class="t7">OFFICE
</tspan>
			</text>
			<g>
				<text id="ROOM 139
" style="transform: matrix(.987,.163,-0.163,.987,589.4,356.6)" >
					<tspan x="0" y="0" class="t7">ROOM 139
</tspan>
				</text>
				<text id="READING
" style="transform: matrix(.987,.163,-0.163,.987,590.298,365.871)" >
					<tspan x="0" y="0" class="t7">READING
</tspan>
				</text>
			</g>
			<text id="OFFICE
" style="transform: matrix(.99,.139,-0.139,.99,547.9,334.7)" >
				<tspan x="0" y="0" class="t7">OFFICE
</tspan>
			</text>
			<text id="PANTRY
" style="transform: matrix(.466,-0.885,.885,.466,191,203.2)" >
				<tspan x="0" y="0" class="t7">PANTRY
</tspan>
			</text>
			<text id="ENTRANCE
" style="transform: matrix(1,0,0,1,552.5,688.3)" >
				<tspan x="0" y="0" class="t7">ENTRANCE
</tspan>
			</text>
		</g>
		<g id="status">
			<g id="status_room_126">
				<g id="bg_status">
					<path class="bg_status_color" d="m1043.1 351.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m1048.2 332.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m1037.1 336.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m1042.2 334.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m1041.7 325h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m1040.1 329.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m1044.5 325.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m1054.7 357.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m1052.2 353.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m1030.7 357.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m1029.1 352.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_124">
				<g id="bg_status">
					<path class="bg_status_color" d="m989.1 231.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m994.2 212.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m983.1 216.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m988.2 214.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m987.7 205h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m986.1 209.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m990.5 205.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m1000.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m998.2 233.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m976.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m975.1 232.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_119">
				<g id="bg_status">
					<path class="bg_status_color" d="m909.1 231.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m914.2 212.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m903.1 216.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m908.2 214.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m907.7 205h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m906.1 209.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m910.5 205.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m920.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m918.2 233.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m896.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m895.1 232.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_114">
				<g id="bg_status">
					<path class="bg_status_color" d="m764.1 351.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m769.2 332.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m758.1 336.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m763.2 334.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m762.7 325h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m761.1 329.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m765.5 325.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m775.7 357.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m773.2 353.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m751.7 357.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m750.1 352.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_113">
				<g id="bg_status">
					<path class="bg_status_color" d="m823.1 231.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m828.2 212.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m817.1 216.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m822.2 214.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m821.7 205h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m820.1 209.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m824.5 205.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m834.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m832.2 233.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m810.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m809.1 232.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
				</g>
			</g>
			<g id="status_room_111">
				<g id="bg_status">
					<path class="bg_status_color" d="m743.1 231.7c-9.7 0-17.5-7.8-17.5-17.5 0-9.7 7.8-17.5 17.5-17.5 9.7 0 17.5 7.8 17.5 17.5 0 9.7-7.8 17.5-17.5 17.5z"/>
					<path id="bg_status_icon_fire" fill-rule="evenodd" class="s5" d="m748.2 212.4c0 0 0.6 0.8 0.9 1.3v0.3c1 2.3 0.3 4.9-1.5 6.6-1.7 1.5-4 1.9-6.1 1.6-2.1-0.2-3.9-1.5-5-3.2-0.3-0.5-0.6-1.1-0.7-1.7q-0.3-0.8-0.3-1.5c-0.2-2.1 0.7-4.4 2.4-5.8-0.7 1.6-0.5 3.7 0.6 5.1 0 0.1 0.1 0.2 0.1 0.2 0.2 0.1 0.5 0.1 0.7 0.1 0.2-0.1 0.3-0.3 0.3-0.5 0-0.1 0-0.3 0-0.3-1.2-3.2-0.2-6.8 2.4-8.9 0.7-0.5 1.6-1.1 2.5-1.3-0.9 1.8-0.6 4.2 0.9 5.7 0.7 0.7 1.4 1.1 2.1 1.7 0.3 0.2 0.6 0.5 0.8 0.8m-3.2 6.3c0.6-0.6 0.9-1.5 0.9-2.3 0-0.1 0-0.3 0-0.4-0.2-1.4-1.4-1.8-2.2-2.8-0.2-0.3-0.4-0.7-0.6-1.1-0.3 0.7-0.3 1.4-0.2 2.1 0.2 0.7 0.5 1.4 0.3 2.2-0.2 0.9-0.9 1.8-2.1 2.1 0.7 0.6 1.8 1.2 2.9 0.8 0.4-0.1 0.8-0.4 1.1-0.6z"/>
					<path id="bg_status_icon_weather" class="s5" d="m737.1 216.3c0.4 0.2 0.5 0.8 0.3 1.2-0.3 0.4-0.8 0.5-1.2 0.3-1.4-0.7-2.2-2.2-2.2-3.8 0-2.5 1.9-4.4 4.3-4.4 0.9-2.1 2.9-3.6 5.2-3.6 2.3 0 5.4 2.3 5.6 5.3h0.4c1.9 0 3.5 1.6 3.5 3.5 0 2-1.6 3.6-3.5 3.6-1.9 0-0.8-0.4-0.8-0.9 0-0.4 0.3-0.8 0.8-0.8 1 0 1.8-0.8 1.8-1.8 0-1-0.8-1.8-1.8-1.8h-1.7v-0.8c0-2.5-2-4.5-4.4-4.5-2.4 0-3.9 1.6-4.2 3.7q-0.5-0.2-0.9-0.2c-1.5 0-2.6 1.2-2.6 2.7 0 1.5 0.5 1.8 1.3 2.3m4.4-2.3h2.6l-1.8 3.5h1.8l-3.3 6.2 0.7-4.4h-2.2zm6.9 6.7c0 1.2-0.8 2.1-1.9 2.1-1.1 0-1.9-0.9-1.9-2.1 0-1.1 1.9-3.6 1.9-3.6 0 0 1.9 2.3 1.9 3.6z"/>
					<path id="bg_status_icon_suspicious" class="s5" d="m742.2 214.2c-2 0-3.6-1.6-3.6-3.6 0-2 1.6-3.6 3.6-3.6 2 0 3.6 1.6 3.6 3.6 0 2-1.6 3.6-3.6 3.6zm0 1.8c4 0 7.2 1.6 7.2 3.6v1.8h-14.4v-1.8c0-2 3.2-3.6 7.2-3.6zm9-1.8v-4.5h1.8v5.4h-1.8m1.8 1.7v1.9h-1.8v-1.9z"/>
					<path id="bg_status_icon_medical" fill-rule="evenodd" class="s5" d="m741.7 205h3.8l1.9 1.9v1.9h2.9c1 0 1.8 0.9 1.9 1.9l1 9.5c0.1 0.9-0.5 1.9-1.9 1.9h-15.4c-1.4 0-2-0.9-1.9-1.9l1-9.5c0.2-0.9 0.8-1.9 1.9-1.9h2.9v-1.9zm0 1.9v1.9h3.9v-1.9zm1 7.6h-3v1.9h3v2.9h1.9v-2.9h2.9v-1.9h-2.9v-2.8h-1.9z"/>
					<path id="bg_status_icon_weapon" fill-rule="evenodd" class="s5" d="m740.1 209.1h14v3.5h-0.9v0.9h-5.2c-0.5 0-0.9 0.4-0.9 0.9v0.9c0 1-0.8 1.7-1.7 1.7h-3c-0.3 0-0.6 0.2-0.8 0.5l-2.1 4.3c-0.1 0.3-0.4 0.5-0.8 0.5h-3c0 0-2.6 0 0.9-5.2 0 0 2.6-3.5-0.9-3.5v-4.4h0.9l0.4-0.9h2.6l0.4 0.9m6.2 6v-0.9c0-0.5-0.4-0.9-0.9-0.9h-0.9c0 0-0.9 0.9 0 1.7-1 0-1.7-0.8-1.7-1.7-0.5 0-0.9 0.4-0.9 0.9v0.9c0 0.5 0.4 0.9 0.9 0.9h2.6c0.5 0 0.9-0.4 0.9-0.9z"/>
					<path id="bg_status_icon_conflict" fill-rule="evenodd" class="s5" d="m744.5 205.5l7.3 7.4c0.7 0.7 0.7 1.9 0 2.6l-7.3 7.3c-0.7 0.7-1.9 0.7-2.6 0l-7.4-7.3c-0.7-0.7-0.7-1.9 0-2.6l7.4-7.4c0.3-0.3 0.8-0.5 1.3-0.5 0.4 0 0.9 0.2 1.3 0.5zm-2.2 4.1v5.5h1.8v-5.5zm0 7.3v1.9h1.8v-1.9z"/>
				</g>
				<g id="command" style="opacity: 0">
					<path class="s11" d="m754.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="+C" class="s12" d="m752.2 233.1h-1.1v-1.9h-1.8v-1h1.8v-1.9h1.1v1.9h1.7v1h-1.7zm5.6 1.1q-0.8 0-1.5-0.4-0.7-0.4-1.2-1.1-0.4-0.8-0.4-1.9 0-1 0.5-1.8 0.4-0.8 1.1-1.2 0.7-0.4 1.5-0.4 0.7 0 1.2 0.3 0.5 0.2 0.8 0.6l-0.8 0.9q-0.3-0.2-0.5-0.4-0.3-0.1-0.7-0.1-0.4 0-0.8 0.2-0.3 0.3-0.5 0.8-0.3 0.4-0.3 1.1 0 1 0.5 1.5 0.4 0.6 1.1 0.6 0.4 0 0.7-0.2 0.4-0.1 0.6-0.4l0.8 0.9q-0.8 1-2.1 1z"/>
				</g>
				<g id="counter" style="opacity: 0">
					<path class="s13" d="m730.7 237.9c-4.1 0-7.5-3.4-7.5-7.5 0-4.1 3.4-7.5 7.5-7.5 4.1 0 7.5 3.4 7.5 7.5 0 4.1-3.4 7.5-7.5 7.5z"/>
					<path id="counter" class="s14" d="m729.1 232.6h1.4v-3.7h-1.2v-0.9c0.7-0.1 1.1-0.3 1.6-0.6h1.1v5.2h1.2v1.2h-4v-1.2z"/>
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
      "room_114",
      "room_119",
      "room_124",
      "room_126",
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

    this.clickedRoom = sectionId;

    const rightMenu = this.shadowRoot!.querySelector(".right-menu");
    const svgContainer = this.shadowRoot!.querySelector(".svg-map");

    if (rightMenu) {
      rightMenu.setAttribute("style", "display: flex");
    }

    if (svgContainer) {
      svgContainer.setAttribute("style", "width: 75%");
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
