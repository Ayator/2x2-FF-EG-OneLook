import { ollCasesFolder } from  "./locationUtils"

// Helper: mapping OLL name to file code
export const OLL_CODES = {
  SUNE: "S",
  ANTISUNE: "A",
  T: "T",
  L: "L",
  U: "U",
  PI: "P",
  H: "H"
};

export const ROTATION_DEGREES = { F: 0, L: 90, B: 180, R: 270 };

export function ollImage(oll, orientation = "F") {
  return `/${ollCasesFolder}/${oll}_${orientation}.jpg`;
}