import { studentStateOrder } from "../response-state-status-order";

const stateMap = {
  wounded: "#ee5253",
  medical: "#54a0ff",
  disciplinary: "#f368e0",
  unaccounted: "#01a3a4",
};

export function getPersonCountByStatus(
  persons: Array<{ attributes: { status: string } }>
) {
  for (const state of studentStateOrder) {
    const count = persons.filter(
      (person) => person.attributes.status === state
    ).length;

    if (count > 0 && !["unaccounted", "absent", "ok"].includes(state)) {
      return {
        type: state,
        count: count,
        color: stateMap[state],
      };
    }
  }
  return null;
}
