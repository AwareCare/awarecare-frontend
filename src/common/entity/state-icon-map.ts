import {
  mdiBandage,
  mdiMedicalBag,
  mdiSchool,
  mdiAccountAlert,
  mdiAccountOff,
  mdiCheckCircle,
} from "@mdi/js";

export const stateIconMap = (status: string) => {
  const mapIcon = {
    wounded: mdiBandage,
    medical: mdiMedicalBag,
    disciplinary: mdiSchool,
    unaccounted: mdiAccountAlert,
    absent: mdiAccountOff,
    ok: mdiCheckCircle,
  };

  return mapIcon[status];
};
