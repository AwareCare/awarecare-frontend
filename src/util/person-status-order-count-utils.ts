import { studentStateOrder } from "../response-state-status-order";

export function getPersonCountByStatus(
  persons: Array<{ attributes: { status: string } }>
) {
  for (const state of studentStateOrder) {
    const count = persons.filter(
      (person) => person.attributes.status === state
    ).length;
    if (count > 0) {
      return {
        type: state,
        count: count,
      };
    }
  }
  return null;
}
