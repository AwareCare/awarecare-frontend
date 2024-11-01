import { HassEntity } from "home-assistant-js-websocket";
import {
  css,
  CSSResultGroup,
  html,
  LitElement,
  nothing,
  PropertyValues,
} from "lit";
import { customElement, property, state } from "lit/decorators";
import { ifDefined } from "lit/directives/if-defined";
import { styleMap } from "lit/directives/style-map";
import { applyThemesOnElement } from "../../../common/dom/apply_themes_on_element";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { computeStateName } from "../../../common/entity/compute_state_name";
import {
  stateColorBrightness,
  stateColorCss,
} from "../../../common/entity/state_color";
import { isValidEntityId } from "../../../common/entity/valid_entity_id";
import {
  formatNumber,
  getNumberFormatOptions,
  isNumericState,
} from "../../../common/number/format_number";
import { iconColorCSS } from "../../../common/style/icon_color_css";
import "../../../components/ha-attribute-value";
import "../../../components/ha-card";
import "../../../components/ha-icon";
import { CLIMATE_HVAC_ACTION_TO_MODE } from "../../../data/climate";
import { isUnavailableState } from "../../../data/entity";
import { HomeAssistant } from "../../../types";
import { computeCardSize } from "../common/compute-card-size";
import { findEntities } from "../common/find-entities";
import { hasConfigOrEntityChanged } from "../common/has-changed";
import { createEntityNotFoundWarning } from "../components/hui-warning";
import { createHeaderFooterElement } from "../create-element/create-header-footer-element";
import { LovelaceCard, LovelaceHeaderFooter } from "../types";
import { HuiErrorCard } from "./hui-error-card";
import { EntityCardConfig } from "./types";

import { classroomCommandMap } from "../../../classroom-command-map";

@customElement("hui-entity-card")
export class HuiEntityCard extends LitElement implements LovelaceCard {
  public static getStubConfig(
    hass: HomeAssistant,
    entities: string[],
    entitiesFill: string[]
  ) {
    const includeDomains = ["sensor", "light", "switch"];
    const maxEntities = 1;
    const foundEntities = findEntities(
      hass,
      maxEntities,
      entities,
      entitiesFill,
      includeDomains
    );

    return {
      entity: foundEntities[0] || "",
    };
  }

  public static async getConfigForm() {
    return (await import("../editor/config-elements/hui-entity-card-editor"))
      .default;
  }

  @property({ attribute: false }) public hass?: HomeAssistant;

  @state() private _config?: EntityCardConfig;

  @state() private roomResponse: string = "";

  private _footerElement?: HuiErrorCard | LovelaceHeaderFooter;

  private getStateColor(stateObj: HassEntity, config: EntityCardConfig) {
    const domain = stateObj ? computeStateDomain(stateObj) : undefined;
    return config && (config.state_color ?? domain === "light");
  }

  public setConfig(config: EntityCardConfig): void {
    if (!config.entity) {
      throw new Error("Entity must be specified");
    }
    if (config.entity && !isValidEntityId(config.entity)) {
      throw new Error("Invalid entity");
    }

    this._config = config;

    if (this._config.footer) {
      this._footerElement = createHeaderFooterElement(this._config.footer);
    } else if (this._footerElement) {
      this._footerElement = undefined;
    }
  }

  public async getCardSize(): Promise<number> {
    let size = 2;
    if (this._footerElement) {
      const footerSize = computeCardSize(this._footerElement);
      size += footerSize instanceof Promise ? await footerSize : footerSize;
    }
    return size;
  }

  protected render() {
    if (!this._config || !this.hass) {
      return nothing;
    }

    const stateObj = this.hass.states[this._config.entity];
    const roomResponse = stateObj.attributes.response || "";

    if (!stateObj) {
      return html`
        <hui-warning>
          ${createEntityNotFoundWarning(this.hass, this._config.entity)}
        </hui-warning>
      `;
    }

    const domain = computeStateDomain(stateObj);
    const showUnit = this._config.attribute
      ? this._config.attribute in stateObj.attributes
      : !isUnavailableState(stateObj.state);

    const name = this._config.name || computeStateName(stateObj);

    const colored = stateObj && this.getStateColor(stateObj, this._config);

    const stateDetails = classroomCommandMap[stateObj.attributes.command];

    return html`
      <ha-card class="custom-card" tabindex="0">
        ${stateObj.entity_id.includes("room.")
          ? html`<div class="header custom-btn">
          <div class="state-icon" style="background-color: ${stateDetails?.color}">
            <ha-svg-icon
              .path=${stateDetails?.icon}
              .width=${36}
              .height=${36}
            ></ha-svg-icon>
          </div>
          <div class="command">
            <p class="value"></p>
              ${
                "attribute" in this._config
                  ? stateObj.attributes[this._config.attribute!] !== undefined
                    ? html`
                        <ha-attribute-value
                          hide-unit
                          .hass=${this.hass}
                          .stateObj=${stateObj}
                          .attribute=${this._config.attribute!}
                        >
                        </ha-attribute-value>
                      `
                    : this.hass.localize("state.default.unknown")
                  : isNumericState(stateObj) || this._config.unit
                    ? formatNumber(
                        stateObj.state,
                        this.hass.locale,
                        getNumberFormatOptions(
                          stateObj,
                          this.hass.entities[this._config.entity]
                        )
                      )
                    : this.hass.formatEntityState(stateObj)
              }
            </p>
            ${
              showUnit
                ? html`
                    <span class="measurement"
                      >${this._config.unit ||
                      (this._config.attribute
                        ? ""
                        : stateObj.attributes.unit_of_measurement)}</span
                    >
                  `
                : ""
            }

            <p>${stateDetails.message}</p>
          </div>
        </div>

        <div class="container-actions">
          <div class="custom-btn-actions">
              <button class="btn-action ${roomResponse === "ok" ? "active" : ""}" id="ok" @click=${this._sendResponse}>OK</button>
              <button class="btn-action ${roomResponse === "help" ? "active" : ""}" id="help" @click=${this._sendResponse}>HELP</button>
          </div>
          <div class="custom-btn-actions">
              <button class="btn-action ${roomResponse === "alert" ? "active" : ""}" id="alert" @click=${this._sendResponse}>ALERT</button>
              <button class="btn-action ${roomResponse === "medical" ? "active" : ""}" id="medical" @click=${this._sendResponse}>MEDICAL</button>
          </div>
        </div>
        `
          : html`<div class="header">
                <div class="name" .title=${name}>${name}</div>
                <div class="icon">
                  <ha-state-icon
                    .icon=${this._config.icon}
                    .stateObj=${stateObj}
                    .hass=${this.hass}
                    data-domain=${ifDefined(domain)}
                    data-state=${stateObj.state}
                    style=${styleMap({
                      color: colored ? this._computeColor(stateObj) : undefined,
                      filter: colored
                        ? stateColorBrightness(stateObj)
                        : undefined,
                      height: this._config.icon_height
                        ? this._config.icon_height
                        : "",
                    })}
                  ></ha-state-icon>
                </div>
              </div>
              <div class="info">
                <span class="value"
                  >${"attribute" in this._config
                    ? stateObj.attributes[this._config.attribute!] !== undefined
                      ? html`
                          <ha-attribute-value
                            hide-unit
                            .hass=${this.hass}
                            .stateObj=${stateObj}
                            .attribute=${this._config.attribute!}
                          >
                          </ha-attribute-value>
                        `
                      : this.hass.localize("state.default.unknown")
                    : isNumericState(stateObj) || this._config.unit
                      ? formatNumber(
                          stateObj.state,
                          this.hass.locale,
                          getNumberFormatOptions(
                            stateObj,
                            this.hass.entities[this._config.entity]
                          )
                        )
                      : this.hass.formatEntityState(stateObj)}</span
                >${showUnit
                  ? html`
                      <span class="measurement"
                        >${this._config.unit ||
                        (this._config.attribute
                          ? ""
                          : stateObj.attributes.unit_of_measurement)}</span
                      >
                    `
                  : ""}
              </div>`}
        ${this._footerElement}
      </ha-card>
    `;
  }

  private _computeColor(stateObj: HassEntity): string | undefined {
    if (stateObj.attributes.hvac_action) {
      const hvacAction = stateObj.attributes.hvac_action;
      if (hvacAction in CLIMATE_HVAC_ACTION_TO_MODE) {
        return stateColorCss(stateObj, CLIMATE_HVAC_ACTION_TO_MODE[hvacAction]);
      }
      return undefined;
    }
    if (stateObj.attributes.rgb_color) {
      return `rgb(${stateObj.attributes.rgb_color.join(",")})`;
    }
    const iconColor = stateColorCss(stateObj);
    if (iconColor) {
      return iconColor;
    }
    return undefined;
  }

  protected shouldUpdate(changedProps: PropertyValues): boolean {
    // Side Effect used to update footer hass while keeping optimizations
    if (this._footerElement) {
      this._footerElement.hass = this.hass;
    }

    return hasConfigOrEntityChanged(this, changedProps);
  }

  protected updated(changedProps: PropertyValues) {
    super.updated(changedProps);
    if (!this._config || !this.hass) {
      return;
    }

    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    const oldConfig = changedProps.get("_config") as
      | EntityCardConfig
      | undefined;

    if (
      !oldHass ||
      !oldConfig ||
      oldHass.themes !== this.hass.themes ||
      oldConfig.theme !== this._config.theme
    ) {
      applyThemesOnElement(this, this.hass.themes, this._config!.theme);
    }
  }

  private async _sendResponse(event: Event) {
    const target = event.currentTarget as HTMLElement;
    const cmdValue = target.getAttribute("id") || "";

    if (!this.hass) {
      return;
    }

    const roomState = this.hass.states[this._config!.entity];
    const roomStateAttributes = roomState.attributes;

    roomStateAttributes.response = cmdValue;
    this.roomResponse = cmdValue;

    try {
      await this.hass.callApi("POST", "states/" + this._config!.entity, {
        state: roomState.state,
        attributes: roomStateAttributes,
      });
    } catch (e: any) {
      throw e.body?.message || "Unknown error";
    }
  }

  static get styles(): CSSResultGroup {
    return [
      iconColorCSS,
      css`
        ha-card {
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          cursor: pointer;
          outline: none;
        }
        .custom-card {
          background-color: #ffcf68;
          color: #222021;
        }
        .container-actions {
          margin: 12px 0 24px 0;
        }
        .custom-btn {
          justify-content: start !important;
          padding: 24px 32px 0 !important;
          align-items: center;
        }
        .custom-btn p {
          margin: 0;
        }
        .custom-btn ha-attribute-value {
          text-transform: uppercase;
          font-size: 22px;
          font-weight: bold;
        }
        .custom-btn-actions {
          padding: 6px 32px !important;
          display: flex;
          justify-content: space-between;
        }
        .custom-btn-actions .btn-action {
          cursor: pointer;
          font-weight: bold;
          font-size: 16px;
          border-radius: 8px;
          width: 100%;
          margin: 0 4px;
          height: 56px;
          background: #212222;
          border-color: #454545;
        }
        .custom-btn-actions .btn-action.active#ok {
          background: #1dd1a1 !important;
        }
        .custom-btn-actions .btn-action.active#help {
          background: #ed5d5d !important;
        }
        .custom-btn-actions .btn-action.active#alert {
          background: #ffcb2d !important;
        }
        .custom-btn-actions .btn-action.active#medical {
          background: #6fa1d6 !important;
        }
        .custom-btn-actions .btn-action:hover {
          background-color: #2e2e2e !important;
        }
        .state-icon {
          background-color: red;
          border-radius: 50%;
          padding: 8px;
          margin-right: 12px;
          color: white;
        }
        .header {
          display: flex;
          padding: 8px 16px 0;
          justify-content: space-between;
        }
        .name {
          color: var(--secondary-text-color);
          line-height: 40px;
          font-weight: 500;
          font-size: 16px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
        }
        .icon {
          color: var(--paper-item-icon-color, #44739e);
          --state-inactive-color: var(--paper-item-icon-color, #44739e);
          line-height: 40px;
        }
        .info {
          padding: 0px 16px 16px;
          margin-top: -4px;
          overflow: hidden;
          white-space: nowrap;
          text-overflow: ellipsis;
          line-height: 28px;
        }
        .value {
          font-size: 28px;
          margin-right: 4px;
          margin-inline-end: 4px;
          margin-inline-start: initial;
        }
        .measurement {
          font-size: 18px;
          color: var(--secondary-text-color);
        }
      `,
    ];
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "hui-entity-card": HuiEntityCard;
  }
}
