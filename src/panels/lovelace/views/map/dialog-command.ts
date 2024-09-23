import { property } from "lit/decorators";

import { css, CSSResultGroup, html, LitElement } from "lit";

import { mdiExitRun, mdiEyeOff, mdiHomeLock } from "@mdi/js";

import "../../../../components/ha-svg-icon";
import "../../../../components/ha-dialog";

import { HomeAssistant } from "../../../../types";

class DialogCommand extends LitElement {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean, attribute: "dialog-open" }) dialogOpen = false;

  @property({ type: String, attribute: "dialog-room-name" }) dialogRoomName =
    "";

  private _closeDialog() {
    this.dialogOpen = false;
    this.dispatchEvent(
      new CustomEvent("dialog-closed", { bubbles: true, composed: true })
    );
  }

  private async _sendCommand(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const cmdValue = target.getAttribute("value") || "";

    if (!this.hass) {
      return;
    }

    const roomEntityId = `room.${this.dialogRoomName.replace(" ", "_")}`;
    const roomState = this.hass.states[roomEntityId];
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

  protected render() {
    return html`
      <ha-dialog
        ?open=${this.dialogOpen}
        heading="Send Command"
        @closed=${this._closeDialog}
      >
        <div>
          Send instant command to
          <span style="font-weight: bold;"
            >${this.dialogRoomName.toUpperCase()}</span
          >
        </div>

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
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "dialog-command": DialogCommand;
  }
}

customElements.define("dialog-command", DialogCommand);
