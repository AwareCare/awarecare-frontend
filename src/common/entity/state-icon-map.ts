import {
  mdiBandage,
  mdiMedicalBag,
  mdiSchool,
  mdiAccountAlert,
  mdiAccountCancel,
  mdiCheckCircle,
} from "@mdi/js";

export const stateIconMap = (status: string) => {
  const mapIcon = {
    wounded: mdiBandage,
    medical: mdiMedicalBag,
    disciplinary: mdiSchool,
    unaccounted: mdiAccountAlert,
    absent: mdiAccountCancel,
    ok: mdiCheckCircle,
  };

  return mapIcon[status];
};
