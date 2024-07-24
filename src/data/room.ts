import { navigate } from "../common/navigate";
import { HomeAssistant } from "../types";

export interface Room {
  id: string;
  name: string;
  icon?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  coordinates?: string;
  context?: string;
  command?: string;
  response?: string;
}

export interface RoomMutableParams {
  name: string;
  icon?: string;
  latitude: number;
  longitude: number;
  radius?: number;
  coordinates?: string;
  context?: string;
  command?: string;
  response?: string;
}

export const fetchRooms = (hass: HomeAssistant) =>
  hass.callWS<Room[]>({ type: "room/list" });

export const createRoom = (hass: HomeAssistant, values: RoomMutableParams) =>
  hass.callWS<Room>({
    type: "room/create",
    ...values,
  });

export const updateRoom = (
  hass: HomeAssistant,
  roomId: string,
  updates: Partial<RoomMutableParams>
) =>
  hass.callWS<Room>({
    type: "room/update",
    room_id: roomId,
    ...updates,
  });

export const deleteRoom = (hass: HomeAssistant, roomId: string) =>
  hass.callWS({
    type: "room/delete",
    room_id: roomId,
  });

let inititialRoomEditorData: Partial<RoomMutableParams> | undefined;

export const showRoomEditor = (data?: Partial<RoomMutableParams>) => {
  inititialRoomEditorData = data;
  navigate("/config/room/new");
};

export const getRoomEditorInitData = () => {
  const data = inititialRoomEditorData;
  inititialRoomEditorData = undefined;
  return data;
};
