import { HassEntity } from "home-assistant-js-websocket";
import { computeObjectId } from "./compute_object_id";

export const computeStateRoleFromEntityAttributes = (
  entityId: string,
  attributes: { [key: string]: any }
): string =>
  attributes.role === undefined
    ? computeObjectId(entityId).replace(/_/g, " ")
    : (attributes.role ?? "").toString();

export const computeStateRole = (stateObj: HassEntity): string =>
  computeStateRoleFromEntityAttributes(stateObj.entity_id, stateObj.attributes);
