import re

def format_algorithm_string(alg):
    # Remove redundant spaces
    alg = re.sub(r"\s+", " ", alg).strip()
    # Capture L, L', L2, L2', etc.
    moves = re.findall(r"[RLUDFBMSExyz](?:2'?|'?2?)?", alg)
    return ' '.join(moves)

# assume input is a proper move notation
# note it can contain combinations such as R2' or R2,
# and will return R2 in both cases
def invert_move(move):
    if move.endswith("2"):
        return move  # 180-degree turns remain the same
    elif move.endswith("'"):
        return move[:-1]  # remove the apostrophe to invert
    else:
        return move + "'"  # add an apostrophe to invert

# Invert an entire algorithm
def invert_algorithm(alg):
    moves = alg.split()
    inverted_moves = [invert_move(move) for move in reversed(moves)]
    return ' '.join(inverted_moves)

def rotate_x(move):
    mapping = {'F': 'U', 'U': 'B', 'B': 'D', 'D': 'F', 'L': 'L', 'R': 'R'}
    return _transform_move(move, mapping)

def rotate_y(move):
    mapping = {'F': 'R', 'R': 'B', 'B': 'L', 'L': 'F', 'U': 'U', 'D': 'D'}
    return _transform_move(move, mapping)

def rotate_z(move):
    mapping = {'U': 'R', 'R': 'D', 'D': 'L', 'L': 'U', 'F': 'F', 'B': 'B'}
    return _transform_move(move, mapping)

def mirror_lr(move):  # swaps L<->R, keeps others
    mapping = {'L': 'R', 'R': 'L', 'U': 'U', 'D': 'D', 'F': 'F', 'B': 'B'}
    return _transform_move(move, mapping)

def mirror_fb(move):  # swaps F<->B, keeps others
    mapping = {'F': 'B', 'B': 'F', 'U': 'U', 'D': 'D', 'L': 'L', 'R': 'R'}
    return _transform_move(move, mapping)

def mirror_ud(move):  # swaps U<->D, keeps others
    mapping = {'U': 'D', 'D': 'U', 'F': 'F', 'B': 'B', 'L': 'L', 'R': 'R'}
    return _transform_move(move, mapping)

# helper function to transform a single move based on a mapping
def _transform_move(move, mapping):
    m = re.match(r"([RLUDFBMSExyz])((?:2'?)|')?", move)
    if not m:
        return move
    face, suffix = m.groups()
    if face in mapping:
        face_t = mapping[face]
    else:
        face_t = face
    # note suffix doesn't change with these transformations
    return face_t + (suffix if suffix else "")

# apply a transformation function to an entire algorithm
def transform_algorithm(alg, transform_func):
    moves = alg.strip().split()
    return ' '.join(transform_func(move) for move in moves)