import "@lrnwebcomponents/simple-tooltip/simple-tooltip";
import "@material/mwc-list/mwc-list";
import { mdiPencil, mdiPencilOff, mdiPlus } from "@mdi/js";
import { HassEntity, UnsubscribeFunc } from "home-assistant-js-websocket";
import {
  CSSResultGroup,
  LitElement,
  PropertyValues,
  TemplateResult,
  css,
  html,
  nothing,
} from "lit";
import { customElement, property, query, state } from "lit/decorators";
import memoizeOne from "memoize-one";
import { computeStateDomain } from "../../../common/entity/compute_state_domain";
import { shouldHandleRequestSelectedEvent } from "../../../common/mwc/handle-request-selected-event";
import { navigate } from "../../../common/navigate";
import { stringCompare } from "../../../common/string/compare";
import "../../../components/ha-card";
import "../../../components/ha-fab";
import "../../../components/ha-icon-button";
import "../../../components/ha-list-item";
import "../../../components/ha-svg-icon";
import "../../../components/map/ha-locations-editor";
import type {
  HaLocationsEditor,
  MarkerLocation,
} from "../../../components/map/ha-locations-editor";
import { saveCoreConfig } from "../../../data/core";
import { subscribeEntityRegistry } from "../../../data/entity_registry";
import {
  Room,
  RoomMutableParams,
  createRoom,
  deleteRoom,
  fetchRooms,
  updateRoom,
} from "../../../data/room";
import { showConfirmationDialog } from "../../../dialogs/generic/show-dialog-box";
import "../../../layouts/hass-loading-screen";
import "../../../layouts/hass-tabs-subpage";
import { SubscribeMixin } from "../../../mixins/subscribe-mixin";
import type { HomeAssistant, Route } from "../../../types";
import "../ha-config-section";
import { configSections } from "../ha-panel-config";
import { showRoomDetailDialog } from "./show-dialog-room-detail";

@customElement("ha-config-room")
export class HaConfigRoom extends SubscribeMixin(LitElement) {
  @property({ attribute: false }) public hass!: HomeAssistant;

  @property({ type: Boolean }) public isWide = false;

  @property({ type: Boolean }) public narrow = false;

  @property({ attribute: false }) public route!: Route;

  @state() private _searchParms = new URLSearchParams(window.location.search);

  @state() private _storageItems?: Room[];

  @state() private _stateItems?: HassEntity[];

  @state() private _activeEntry = "";

  @state() private _canEditCore = false;

  @query("ha-locations-editor") private _map?: HaLocationsEditor;

  private _regEntities: string[] = [];

  private _getRooms = memoizeOne(
    (storageItems: Room[], stateItems: HassEntity[]): MarkerLocation[] => {
      const computedStyles = getComputedStyle(this);
      const roomRadiusColor = computedStyles.getPropertyValue("--accent-color");

      const stateLocations: MarkerLocation[] = stateItems
        ? stateItems.map((entityState) => ({
            id: entityState.entity_id,
            icon: entityState.attributes.icon,
            name: entityState.attributes.friendly_name || entityState.entity_id,
            latitude: entityState.attributes.latitude,
            longitude: entityState.attributes.longitude,
            radius: entityState.attributes.radius,
            radius_color: roomRadiusColor,
            location_editable: this._canEditCore,
            radius_editable: false,
          }))
        : [];
      const storageLocations: MarkerLocation[] = storageItems
        ? storageItems.map((room) => ({
            ...room,
            radius_color: roomRadiusColor,
            location_editable: true,
            radius_editable: true,
          }))
        : [];
      return storageLocations.concat(stateLocations);
    }
  );

  public hassSubscribe(): UnsubscribeFunc[] {
    return [
      subscribeEntityRegistry(this.hass.connection!, (entities) => {
        this._regEntities = entities.map(
          (registryEntry) => registryEntry.entity_id
        );
        this._filterStates();
      }),
    ];
  }

  protected render(): TemplateResult {
    if (!this.hass || this._storageItems === undefined) {
      return html`<hass-loading-screen></hass-loading-screen>`;
    }

    const hass = this.hass;
    const listBox =
      this._storageItems.length === 0
        ? html`
            <div class="empty">
              ${hass.localize("ui.panel.config.room.no_rooms_created_yet")}
              <br />
              <mwc-button @click=${this._createRoom}>
                ${hass.localize("ui.panel.config.room.create_room")}</mwc-button
              >
            </div>
          `
        : html`
            <mwc-list>
              ${this._storageItems.map((entry) => {
                console.log(entry);
                return html`
                  <ha-list-item
                    .entry=${entry}
                    .id=${this.narrow ? entry.id : ""}
                    graphic="icon"
                    .hasMeta=${!this.narrow}
                    @request-selected=${this._itemClicked}
                    .value=${entry.id}
                    ?selected=${this._activeEntry === entry.id}
                  >
                    <ha-icon .icon=${entry.icon} slot="graphic"></ha-icon>
                    ${entry.name}
                    ${!this.narrow
                      ? html`
                          <div slot="meta">
                            <ha-icon-button
                              .id=${entry.id}
                              .entry=${entry}
                              @click=${this._openEditEntry}
                              .path=${mdiPencil}
                              .label=${hass.localize(
                                "ui.panel.config.room.edit_room"
                              )}
                            ></ha-icon-button>
                          </div>
                        `
                      : ""}
                  </ha-list-item>
                `;
              })}
              ${this._stateItems &&
              this._stateItems.map(
                (stateObject) => html`
                  <ha-list-item
                    graphic="icon"
                    .id=${this.narrow ? stateObject.entity_id : ""}
                    .hasMeta=${!this.narrow}
                    .value=${stateObject.entity_id}
                    @request-selected=${this._stateItemClicked}
                    ?selected=${this._activeEntry === stateObject.entity_id}
                    .noEdit=${!this._canEditCore}
                  >
                    <ha-icon
                      .icon=${stateObject.attributes.icon}
                      slot="graphic"
                    >
                    </ha-icon>

                    ${stateObject.attributes.friendly_name ||
                    stateObject.entity_id}
                  </ha-list-item>
                `
              )}
            </mwc-list>
          `;

    return html`
      <hass-tabs-subpage
        .hass=${this.hass}
        .narrow=${this.narrow}
        .route=${this.route}
        .backPath=${this._searchParms.has("historyBack")
          ? undefined
          : "/config"}
        .tabs=${configSections.areas}
      >
        ${this.narrow
          ? html`
              <ha-config-section .isWide=${this.isWide}>
                <span slot="introduction">
                  ${hass.localize("ui.panel.config.room.introduction")}
                </span>
                <ha-card outlined>${listBox}</ha-card>
              </ha-config-section>
            `
          : ""}
        ${!this.narrow
          ? html`
              <div class="flex">
                <ha-locations-editor
                  .hass=${this.hass}
                  .locations=${this._getRooms(
                    this._storageItems,
                    this._stateItems
                  )}
                  @location-updated=${this._locationUpdated}
                  @radius-updated=${this._radiusUpdated}
                  @marker-clicked=${this._markerClicked}
                ></ha-locations-editor>
                <div class="overflow">${listBox}</div>
              </div>
            `
          : ""}
        <ha-fab
          slot="fab"
          .label=${hass.localize("ui.panel.config.room.add_room")}
          extended
          @click=${this._createRoom}
        >
          <ha-svg-icon slot="icon" .path=${mdiPlus}></ha-svg-icon>
        </ha-fab>
      </hass-tabs-subpage>
    `;
  }

  protected firstUpdated(changedProps: PropertyValues) {
    super.firstUpdated(changedProps);
    this._canEditCore =
      Boolean(this.hass.user?.is_admin) &&
      ["storage", "default"].includes(this.hass.config.config_source);
    this._fetchData();
    if (this.route.path === "/new") {
      navigate("/config/room", { replace: true });
      this._createRoom();
    }
  }

  protected updated() {
    if (
      !this.route.path.startsWith("/edit/") ||
      !this._stateItems ||
      !this._storageItems
    ) {
      return;
    }
    const id = this.route.path.slice(6);
    this._editRoom(id);
    navigate("/config/room", { replace: true });
    if (this.narrow) {
      return;
    }
    this._zoomRoom(id);
  }

  public willUpdate(changedProps: PropertyValues) {
    super.updated(changedProps);
    const oldHass = changedProps.get("hass") as HomeAssistant | undefined;
    if (oldHass && this._stateItems) {
      this._getStates(oldHass);
    }
  }

  private async _fetchData() {
    this._storageItems = (await fetchRooms(this.hass!)).sort((ent1, ent2) =>
      stringCompare(ent1.name, ent2.name, this.hass!.locale.language)
    );
    this._getStates();
  }

  private _getStates(oldHass?: HomeAssistant) {
    let changed = false;
    const tempStates = Object.values(this.hass!.states).filter((entity) => {
      if (computeStateDomain(entity) !== "room") {
        return false;
      }
      if (oldHass?.states[entity.entity_id] !== entity) {
        changed = true;
      }
      if (this._regEntities.includes(entity.entity_id)) {
        return false;
      }
      return true;
    });

    if (changed) {
      this._stateItems = tempStates;
    }
  }

  private _filterStates() {
    if (!this._stateItems) {
      return;
    }
    const tempStates = this._stateItems.filter(
      (entity) => !this._regEntities.includes(entity.entity_id)
    );
    if (tempStates.length !== this._stateItems.length) {
      this._stateItems = tempStates;
    }
  }

  private async _locationUpdated(ev: CustomEvent) {
    this._activeEntry = ev.detail.id;
    if (this._canEditCore) {
      await saveCoreConfig(this.hass, {
        latitude: ev.detail.location[0],
        longitude: ev.detail.location[1],
      });
      return;
    }
    const entry = this._storageItems!.find((item) => item.id === ev.detail.id);
    if (!entry) {
      return;
    }
    this._updateEntry(entry, {
      latitude: ev.detail.location[0],
      longitude: ev.detail.location[1],
    });
  }

  private _radiusUpdated(ev: CustomEvent) {
    this._activeEntry = ev.detail.id;
    const entry = this._storageItems!.find((item) => item.id === ev.detail.id);
    if (!entry) {
      return;
    }
    this._updateEntry(entry, {
      radius: ev.detail.radius,
    });
  }

  private _markerClicked(ev: CustomEvent) {
    this._activeEntry = ev.detail.id;
  }

  private _createRoom() {
    this._openDialog();
  }

  private _itemClicked(ev: CustomEvent) {
    if (!shouldHandleRequestSelectedEvent(ev)) {
      return;
    }

    if (this.narrow) {
      this._openEditEntry(ev);
      return;
    }
    const entryId: string = (ev.currentTarget! as any).value;
    this._zoomRoom(entryId);
    this._activeEntry = entryId;
  }

  private _stateItemClicked(ev: CustomEvent) {
    if (!shouldHandleRequestSelectedEvent(ev)) {
      return;
    }

    const entryId: string = (ev.currentTarget! as any).value;

    this._zoomRoom(entryId);
    this._activeEntry = entryId;
  }

  private async _zoomRoom(id: string) {
    this._map?.fitMarker(id);
  }

  private async _editRoom(id: string) {
    await this.updateComplete;
    (this.shadowRoot?.querySelector(`[id="${id}"]`) as HTMLElement)?.click();
  }

  private _openEditEntry(ev: Event) {
    const entry: Room = (ev.currentTarget! as any).entry;
    this._openDialog(entry);
    ev.stopPropagation();
  }

  private async _createEntry(values: RoomMutableParams) {
    const created = await createRoom(this.hass!, values);
    this._storageItems = this._storageItems!.concat(created).sort(
      (ent1, ent2) =>
        stringCompare(ent1.name, ent2.name, this.hass!.locale.language)
    );
    if (this.narrow) {
      return;
    }
    this._activeEntry = created.id;
    await this.updateComplete;
    await this._map?.updateComplete;
    this._map?.fitMarker(created.id);
  }

  private async _updateEntry(
    entry: Room,
    values: Partial<RoomMutableParams>,
    fitMap = false
  ) {
    const updated = await updateRoom(this.hass!, entry!.id, values);
    this._storageItems = this._storageItems!.map((ent) =>
      ent === entry ? updated : ent
    );
    if (this.narrow || !fitMap) {
      return;
    }
    this._activeEntry = entry.id;
    await this.updateComplete;
    await this._map?.updateComplete;
    this._map?.fitMarker(entry.id);
  }

  private async _removeEntry(entry: Room) {
    if (
      !(await showConfirmationDialog(this, {
        title: this.hass!.localize("ui.panel.config.room.confirm_delete"),
        dismissText: this.hass!.localize("ui.common.cancel"),
        confirmText: this.hass!.localize("ui.common.delete"),
      }))
    ) {
      return false;
    }

    try {
      await deleteRoom(this.hass!, entry!.id);
      this._storageItems = this._storageItems!.filter((ent) => ent !== entry);
      if (!this.narrow) {
        this._map?.fitMap();
      }
      return true;
    } catch (err: any) {
      return false;
    }
  }

  private async _openDialog(entry?: Room) {
    console.log(entry);
    showRoomDetailDialog(this, {
      entry,
      createEntry: (values) => this._createEntry(values),
      updateEntry: entry
        ? (values) => this._updateEntry(entry, values, true)
        : undefined,
      removeEntry: entry ? () => this._removeEntry(entry) : undefined,
    });
  }

  static get styles(): CSSResultGroup {
    return css`
      hass-loading-screen {
        --app-header-background-color: var(--sidebar-background-color);
        --app-header-text-color: var(--sidebar-text-color);
      }
      ha-list-item {
        --mdc-list-item-meta-size: 48px;
      }
      a {
        color: var(--primary-color);
      }
      ha-card {
        margin: 16px auto;
        overflow: hidden;
      }
      ha-icon,
      ha-icon-button:not([disabled]) {
        color: var(--secondary-text-color);
      }
      ha-icon-button {
        --mdc-theme-text-disabled-on-light: var(--disabled-text-color);
      }
      .empty {
        text-align: center;
        padding: 8px;
      }
      .flex {
        display: flex;
        height: 100%;
      }
      .overflow {
        height: 100%;
        overflow: auto;
      }
      ha-locations-editor {
        flex-grow: 1;
        height: 100%;
      }
      .flex mwc-list {
        padding-bottom: 64px;
      }
      .flex mwc-list,
      .flex .empty {
        border-left: 1px solid var(--divider-color);
        width: 250px;
        min-height: 100%;
        box-sizing: border-box;
      }
      ha-card {
        margin-bottom: 100px;
      }
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ha-config-room": HaConfigRoom;
  }
}
