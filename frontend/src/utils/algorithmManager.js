// frontend/src/algorithmManager.js

// SINGLE MOVE CLASS
export class Move {
  constructor(moveStr) {
    this.move = moveStr.trim();
  }

  static from(moveStr) {
    return new Move(moveStr);
  }

  // Invert a move (R2 -> R2, R' -> R, R -> R')
  inverse() {
    if (this.move.endsWith("2")) return new Move(this.move);
    if (this.move.endsWith("'")) return new Move(this.move.slice(0, -1));
    return new Move(this.move + "'");
  }

  // For applying a rotation or mirroring function
  transform(mapping) {
    const match = this.move.match(/^([RLUDFBMSExyz])(2'?|'?2?)?$/);
    if (!match) return new Move(this.move);
    const [, face, suffix = ''] = match;
    const faceOut = mapping[face] || face;
    return new Move(faceOut + suffix);
  }

  toString() {
    return this.move;
  }
}

// ALGORITHM CLASS (LIST OF MOVES)
export class Algorithm {
  constructor(algStr) {
    // Sanitized and split
    this.moves = Algorithm._parseAlg(algStr);
  }

  static _parseAlg(algStr) {
    // Extract only valid moves
    const found = algStr.match(/[RLUDFBMSExyz](?:2'?|'?2?)?/g);
    return found ? found.map((m) => new Move(m)) : [];
  }

  static from(algStr) {
    return new Algorithm(algStr);
  }

  toString() {
    return this.moves.map((m) => m.toString()).join(" ");
  }

  inverse() {
    // Reverse and invert each move
    const inverted = this.moves.slice().reverse().map((m) => m.inverse());
    const result = new Algorithm("");
    result.moves = inverted;
    return result;
  }

  transform(transformFn) {
    // transformFn: a Move -> Move transformation
    const transformed = this.moves.map(transformFn);
    const result = new Algorithm("");
    result.moves = transformed;
    return result;
  }

  // Convenience: mirror and rotations
  rotateX() { return this.transform((m) => m.transform({F:"U",U:"B",B:"D",D:"F",L:"L",R:"R"})); }
  rotateY() { return this.transform((m) => m.transform({F:"R",R:"B",B:"L",L:"F",U:"U",D:"D"})); }
  rotateZ() { return this.transform((m) => m.transform({U:"R",R:"D",D:"L",L:"U",F:"F",B:"B"})); }
  mirrorLR() { return this.transform((m) => m.transform({L:"R",R:"L",U:"U",D:"D",F:"F",B:"B"})); }
  mirrorFB() { return this.transform((m) => m.transform({F:"B",B:"F",U:"U",D:"D",L:"L",R:"R"})); }
  mirrorUD() { return this.transform((m) => m.transform({U:"D",D:"U",F:"F",B:"B",L:"L",R:"R"})); }
}
