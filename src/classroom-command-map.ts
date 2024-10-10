import {
  mdiExitRun,
  mdiDoorClosedLock,
  mdiLock,
  mdiSecurity,
  mdiHomeRoof,
} from "@mdi/js";

interface Command {
  name: string;
  icon: string;
  color: string;
  message: string;
}

export const classroomCommandMap: Record<string, Command> = {
  hold: {
    name: "HOLD",
    icon: mdiDoorClosedLock,
    color: "#69297a",
    message: "IN YOUR ROOM AREA",
  },
  secure: {
    name: "SECURE",
    icon: mdiSecurity,
    color: "#0071d9",
    message: "GET INSIDE, LOCK OUTSIDE DOORS",
  },
  lockdown: {
    name: "LOCKDOWN",
    icon: mdiLock,
    color: "#e01820",
    message: "LOCKS, LIGHTS, OUT OF SIGHT",
  },
  evacuate: {
    name: "EVACUATE",
    icon: mdiExitRun,
    color: "#007e13",
    message: "LOCKS, LIGHTS, OUT OF SIGHT",
  },
  shelter: {
    name: "SHELTER",
    icon: mdiHomeRoof,
    color: "#f27b00",
    message: "LOCKS, LIGHTS, OUT OF SIGHT",
  },
};
