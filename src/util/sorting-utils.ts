import {
  responseOrder,
  studentStateOrder,
} from "../response-state-status-order";

export function sortRoomsByResponse(roomUnsorted: Record<string, any>) {
  // Convert the object into an array of entries
  const roomEntries = Object.entries(roomUnsorted);

  // Sort the entries based on the response field, using the responseOrder array
  const sortedEntries = roomEntries.sort(([, a], [, b]) => {
    const aResponseIndex = responseOrder.indexOf(a.response);
    const bResponseIndex = responseOrder.indexOf(b.response);

    // If the response is not found in the order, place it at the end
    return (
      (aResponseIndex === -1 ? responseOrder.length : aResponseIndex) -
      (bResponseIndex === -1 ? responseOrder.length : bResponseIndex)
    );
  });

  // Convert the sorted array back to an object
  return Object.fromEntries(sortedEntries);
}

export function sortPersonsByStatus(personStates: Array<any>) {
  return personStates.sort((a, b) => {
    const aStatusIndex = studentStateOrder.indexOf(a.attributes.status);
    const bStatusIndex = studentStateOrder.indexOf(b.attributes.status);

    return (
      (aStatusIndex === -1 ? studentStateOrder.length : aStatusIndex) -
      (bStatusIndex === -1 ? studentStateOrder.length : bStatusIndex)
    );
  });
}
