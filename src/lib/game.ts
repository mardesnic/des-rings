// Rings on three pegs. The child moves them one at a time, never a bigger
// ring on a smaller one, until they are all on the peg with the star.

export const LEVELS = ['easy', 'medium', 'hard'] as const;
export type Level = (typeof LEVELS)[number];

// How many rings each level has.
export const RINGS: Record<Level, number> = { easy: 2, medium: 3, hard: 4 };

// The rings on each peg, from the bottom up, by size: 1 is the smallest.
export type Pegs = number[][];

export type Round = {
  level: Level;
  // Where the rings were at the start, for Start over.
  start: Pegs;
  pegs: Pegs;
  // The peg with the star, where all the rings must go.
  goal: number;
  // Earlier `pegs`, for Undo.
  history: Pegs[];
};

export const PEGS = 3;

export const ringCount = (pegs: Pegs) =>
  pegs.reduce((n, peg) => n + peg.length, 0);

export const top = (peg: number[]) => peg[peg.length - 1];

export const isSolved = (round: Round) =>
  round.pegs[round.goal].length === ringCount(round.pegs);

// Whether the top ring of `from` may go on `to`.
export function canMove(pegs: Pegs, from: number, to: number) {
  const ring = top(pegs[from] ?? []);
  if (ring === undefined || from === to || !pegs[to]) return false;
  const under = top(pegs[to]);
  return under === undefined || under > ring;
}

export function move(round: Round, from: number, to: number): Round {
  if (isSolved(round) || !canMove(round.pegs, from, to)) return round;
  const pegs = round.pegs.map((p) => [...p]);
  pegs[to].push(pegs[from].pop()!);
  return { ...round, pegs, history: [...round.history, round.pegs] };
}

export function undo(round: Round): Round {
  if (!round.history.length || isSolved(round)) return round;
  return {
    ...round,
    pegs: round.history[round.history.length - 1],
    history: round.history.slice(0, -1),
  };
}

const samePegs = (a: Pegs, b: Pegs) =>
  a.every((peg, i) => peg.join() === b[i].join());

export const isAtStart = (round: Round) => samePegs(round.pegs, round.start);

export function startOver(round: Round): Round {
  if (isSolved(round) || isAtStart(round)) return round;
  return {
    ...round,
    pegs: round.start,
    history: [...round.history, round.pegs],
  };
}

// The fewest moves that put every ring on `goal`. From the biggest ring
// down: a ring not yet on its peg needs all the smaller ones out of the way
// on the third peg, one move of its own, and then the smaller ones moved
// back on top of it.
export function movesLeft(pegs: Pegs, goal: number) {
  const where: number[] = [];
  pegs.forEach((peg, i) => peg.forEach((ring) => (where[ring] = i)));
  let target = goal;
  let moves = 0;
  for (let ring = where.length - 1; ring >= 1; ring--) {
    if (where[ring] === target) continue;
    moves += 2 ** (ring - 1);
    target = PEGS - where[ring] - target;
  }
  return moves;
}

const tower = (rings: number) =>
  Array.from({ length: rings }, (_, i) => rings - i);

const pick = (n: number, random: () => number) => Math.floor(random() * n);

// All the rings on one peg, and the star on another.
function make(level: Level, random: () => number) {
  const goal = pick(PEGS, random);
  const from = (goal + 1 + pick(PEGS - 1, random)) % PEGS;
  const pegs: Pegs = [[], [], []];
  pegs[from] = tower(RINGS[level]);
  return { pegs, goal };
}

// A new game for the level, not the same as `last`.
export function newRound(
  level: Level,
  random = Math.random,
  last?: Round
): Round {
  for (;;) {
    const { pegs, goal } = make(level, random);
    if (
      last &&
      last.level === level &&
      last.goal === goal &&
      samePegs(last.start, pegs)
    )
      continue;
    return { level, start: pegs, pegs, goal, history: [] };
  }
}

export type Store = { round?: Round };

export const initialStore: Store = {};

export type Stats = { [L in Level]: { solved: number } };

export const initialStats = Object.fromEntries(
  LEVELS.map((l) => [l, { solved: 0 }])
) as Stats;

export const recordWin = (stats: Stats, round: Round): Stats =>
  isSolved(round)
    ? {
        ...stats,
        [round.level]: { solved: (stats[round.level]?.solved ?? 0) + 1 },
      }
    : stats;
