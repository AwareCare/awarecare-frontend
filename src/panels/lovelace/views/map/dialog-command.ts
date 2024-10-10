import { property, state } from "lit/decorators";

import { css, CSSResultGroup, html, LitElement } from "lit";

import "../../../../components/ha-svg-icon";
import "../../../../components/ha-dialog";

import { HomeAssistant } from "../../../../types";
import { classroomCommandMap } from "../../../../classroom-command-map";

class DialogCommand extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, attribute: "dialog-open" }) dialogOpen = false;

  @property({ type: String, attribute: "dialog-room-name" }) dialogRoomName =
    "";

  @property({ type: Array, attribute: "selected-rooms" })
  selectedRooms: any[] = [];

  @state() private commandHeaderMessage: string = "";

  @state() private isMultipleRooms: string = "";

  firstUpdated() {}

  updated(changedProperties) {
    if (
      changedProperties.has("selectedRooms") ||
      changedProperties.has("dialogRoomName")
    ) {
      this.isMultipleRooms = this.dialogRoomName === "room_selected";

      const roomName = this.selectedRooms
        .join(this.isMultipleRooms ? ", " : "")
        .toUpperCase()
        .replace(/_/g, " ");

      if (this.isMultipleRooms) {
        this.commandHeaderMessage = html`<p>
            Send instant command to the following rooms
          </p>
          <p class="roomName">${roomName}</p>`;
      } else {
        this.commandHeaderMessage = html`
          <p>
            Send instant command to
            <span class="roomName">${this.dialogRoomName}</span>
          </p>
        `;
      }
    }
  }

  private async _sendCommand(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const cmdValue = target.getAttribute("value") || "";

    if (!this.hass) {
      return;
    }

    const promises: Promise<any>[] = [];

    if (!this.isMultipleRooms) {
      const roomEntityId = `room.${this.dialogRoomName.replace(" ", "_")}`;
      const roomState = this.hass.states[roomEntityId];
      const roomStateAttributes = {
        ...roomState.attributes,
        command: cmdValue,
      };

      promises.push(
        this.hass.callApi("POST", `states/${roomEntityId}`, {
          state: roomState.state,
          attributes: roomStateAttributes,
        })
      );
    } else {
      if (!this.selectedRooms || this.selectedRooms.length === 0) {
        return;
      }

      for (const room of this.selectedRooms) {
        const roomEntityId = `room.${room.replace(" ", "_")}`;
        const roomState = this.hass.states[roomEntityId];

        if (!roomState) {
          continue;
        }

        const roomStateAttributes = {
          ...roomState.attributes,
          command: cmdValue,
        };

        promises.push(
          this.hass.callApi("POST", `states/${roomEntityId}`, {
            state: roomState.state,
            attributes: roomStateAttributes,
          })
        );
      }
    }

    try {
      await Promise.all(promises);
    } catch (e: any) {
      throw e.body?.message || "Unknown error";
    }
  }

  private _closeDialog() {
    this.dialogOpen = false;
    this.dispatchEvent(
      new CustomEvent("dialog-closed", { bubbles: true, composed: true })
    );
  }

  protected render() {
    return html`
      <ha-dialog
        ?open=${this.dialogOpen}
        heading="Send Command"
        @closed=${this._closeDialog}
      >
        <div>${this.commandHeaderMessage}</div>

        <div class="row">
          ${Object.entries(classroomCommandMap)
            .slice(0, 3)
            .map(
              ([key, item]) =>
                html` <button
                  class="command-button ${key}"
                  key=${key}
                  dialogAction="send"
                  id="cmd-${key}"
                  value=${key}
                  @click=${this._sendCommand}
                >
                  <div class="content-wrapper">
                    <span>
                      <ha-svg-icon
                        .path=${item.icon}
                        .width=${38}
                        .height=${38}
                      ></ha-svg-icon>
                    </span>
                    <span>${item.name}</span>
                  </div>
                </button>`
            )}
        </div>

        <div class="row">
          ${Object.entries(classroomCommandMap)
            .slice(3, 5)
            .map(
              ([key, item]) =>
                html` <button
                  class="command-button ${key}"
                  key=${key}
                  dialogAction="send"
                  id="cmd-${key}"
                  value=${key}
                  @click=${this._sendCommand}
                >
                  <div class="content-wrapper">
                    <span>
                      <ha-svg-icon
                        .path=${item.icon}
                        .width=${38}
                        .height=${38}
                      ></ha-svg-icon>
                    </span>
                    <span>${item.name}</span>
                  </div>
                </button>`
            )}
        </div>

        <mwc-button slot="primaryAction" dialogAction="send"
          >Send Command</mwc-button
        >
        <mwc-button slot="primaryAction" dialogAction="close">Close</mwc-button>
      </ha-dialog>
    `;
  }

  static get styles(): CSSResultGroup {
    return css`
      .row {
        display: inline-flex;
        justify-content: space-between;
        margin: 16px;

        .content-wrapper {
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .command-button {
          cursor: pointer;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 80px;
          background-color: #212222;
          color: #dfdfdf;
          flex: 1 1 calc(33.333% - 8px);
          margin-right: 8px;
          border: 1px solid #e1e1e11f;
          border-radius: 8px;
          width: 154px;
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

      .roomName {
        font-weight: bold;
        text-transform: uppercase;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-command": DialogCommand;
  }
}

customElements.define("dialog-command", DialogCommand);
