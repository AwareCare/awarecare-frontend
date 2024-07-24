import { fireEvent } from "../../../common/dom/fire_event";
import { Room, RoomMutableParams } from "../../../data/room";

export interface RoomDetailDialogParams {
  entry?: Room;
  createEntry: (values: RoomMutableParams) => Promise<unknown>;
  updateEntry?: (updates: Partial<RoomMutableParams>) => Promise<unknown>;
  removeEntry?: () => Promise<boolean>;
}

export const loadRoomDetailDialog = () => import("./dialog-room-detail");

export const showRoomDetailDialog = (
  element: HTMLElement,
  systemLogDetailParams: RoomDetailDialogParams
): void => {
  fireEvent(element, "show-dialog", {
    dialogTag: "dialog-room-detail",
    dialogImport: loadRoomDetailDialog,
    dialogParams: systemLogDetailParams,
  });
};
