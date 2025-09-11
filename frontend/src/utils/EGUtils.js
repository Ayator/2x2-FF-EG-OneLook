import { ollCasesFolder, egImagesFolder } from  "./locationUtils"

// EG

export function getEGImageSrc(ollName, pllCaseType) {
    const code = ollName ? OLL_CODES[ollName.toUpperCase()] : "O";
    return `${egImagesFolder}/${code}_${pllCaseType}.svg`;
}

// OLL

export function ollImage(oll, orientation = "F") {
  return `/${ollCasesFolder}/${oll}_${orientation}.jpg`;
}

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

// PLL
// The moves as start/end pairs in order: BACK, DIAG1, RIGHT, DIAG2, FRONT, DIAG1, LEFT, DIAG2
export const PLL_MOVES = [
    ["BL", "BR"],   // 0 BACK
    ["BL", "FR"],   // 1 DIAGONAL1
    ["BR", "FR"],   // 2 RIGHT
    ["BR", "FL"],   // 3 DIAGONAL2
    ["FR", "FL"],   // 4 FRONT
    ["FR", "BL"],   // 5 DIAGONAL1 (reverse)
    ["FL", "BL"],   // 6 LEFT
    ["FL", "BR"],   // 7 DIAGONAL2 (reverse)
];

export const PIECE_KEY_MAP = {
    d: "BL",
    f: "BR",
    c: "FL",
    v: "FR",
};

export const PLL_CASES = ["BACK", "DIAGONAL1", "RIGHT", "DIAGONAL2", "FRONT", "DIAGONAL1", "LEFT", "DIAGONAL2"];
export const ORIENT_TO_STEPS = { F: 0, R: 2, B: 4, L: 6 }; // Each orientation is 2 steps in this 8-direction list

export function getMoveIndex(start, end) {
    for (let i = 0; i < 8; i++) {
        if ((PLL_MOVES[i][0] === start && PLL_MOVES[i][1] === end) ||
            (PLL_MOVES[i][1] === start && PLL_MOVES[i][0] === end)) {
        return i;
        }
    }
    return null;
}

/**
 * Returns the visual pll case to display,
 * given the logicalPerm, orientation, and list of all PLL_CASES.
 * - logicalPerm: string of the logical permutation (e.g. "BACK")
 * - orientation: cube orientation ("F", "R", "B", "L")
 * - PLL_CASES: ordered array of all case labels (length 8)
 * - ORIENT_TO_STEPS: map of orientation letter to index step (F:0, R:2, ...)
 */
export function getDisplayPLLCase(logicalPerm, orientation = "F") {
    if (logicalPerm === "VANILLA") return "VANILLA";
    const logicalIdx = PLL_CASES.findIndex(v => v === logicalPerm);
    if (logicalIdx === -1) return "VANILLA";
    const steps = ORIENT_TO_STEPS[orientation || "F"];
    const displayIdx = (logicalIdx + steps) % PLL_CASES.length;
    return PLL_CASES[displayIdx];
}

// Timer

export function formatTimer(ms) {
    // Format MM:SS.CS
    const mm = String(Math.floor((ms / 60000) % 60)).padStart(2, '0');
    const ss = String(Math.floor((ms / 1000) % 60)).padStart(2, '0');
    const cs = String(Math.floor((ms / 10) % 100)).padStart(2, '0');
    // Compose the timer string:
    return mm > 0 ? `${mm}:${ss}.${cs}` : `${ss}.${cs}`;
}

export function avg12(times) {
    if (times.length < 12) return "-";
    const last12 = times.slice(-12).map(s => s.time);
    const best = Math.min(...last12), worst = Math.max(...last12);
    const trimmed = last12.filter(t => t !== best && t !== worst);
    if (trimmed.length < 10) return "-";
    const avg = Math.round(trimmed.reduce((a, b) => a + b, 0) / trimmed.length);
    return formatTimer(avg);
}