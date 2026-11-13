import { describe, expect, it } from 'vitest';

import {
  FEWEST_SCATTERED,
  LEVELS,
  RINGS,
  canMove,
  initialStats,
  isSolved,
  move,
  movesLeft,
  newRound,
  recordWin,
  startOver,
  undo,
  type Pegs,
  type Round,
} from './game';

const round = (pegs: Pegs, goal = 2): Round => ({
  level: 'medium',
  start: pegs,
  pegs,
  goal,
  history: [],
});

// The fewest moves found by trying every move, to check `movesLeft`.
function search(start: Pegs, goal: number) {
  const n = start.flat().length;
  const key = (p: Pegs) => p.map((x) => x.join()).join('|');
  let now = [start];
  const seen = new Set([key(start)]);
  for (let moves = 0; ; moves++) {
    if (now.some((p) => p[goal].length === n)) return moves;
    const next: Pegs[] = [];
    for (const p of now)
      for (let a = 0; a < 3; a++)
        for (let b = 0; b < 3; b++) {
          if (!canMove(p, a, b)) continue;
          const q = p.map((x) => [...x]);
          q[b].push(q[a].pop()!);
          if (!seen.has(key(q))) {
            seen.add(key(q));
            next.push(q);
          }
        }
    now = next;
  }
}

describe('moves', () => {
  it('lets a ring go on an empty peg or a bigger ring only', () => {
    const pegs = [[3, 1], [2], []];
    expect(canMove(pegs, 0, 1)).toBe(true);
    expect(canMove(pegs, 0, 2)).toBe(true);
    expect(canMove(pegs, 1, 0)).toBe(false);
    expect(canMove(pegs, 2, 0)).toBe(false);
    expect(canMove(pegs, 0, 0)).toBe(false);
  });

  it('moves the top ring', () => {
    const r = move(round([[3, 2, 1], [], []]), 0, 2);
    expect(r.pegs).toEqual([[3, 2], [], [1]]);
    expect(r.history).toEqual([[[3, 2, 1], [], []]]);
  });

  it('does nothing for a move that is not allowed', () => {
    const r = round([[3, 2], [1], []]);
    expect(move(r, 0, 1)).toBe(r);
  });

  it('is solved with every ring on the star', () => {
    expect(isSolved(round([[], [], [2, 1]]))).toBe(true);
    expect(isSolved(round([[], [2, 1], []]))).toBe(false);
  });

  it('undoes and starts over, but not after a win', () => {
    let r = round([[2, 1], [], []]);
    r = move(r, 0, 1);
    expect(undo(r).pegs).toEqual([[2, 1], [], []]);
    r = move(r, 0, 2);
    expect(startOver(r).pegs).toEqual([[2, 1], [], []]);
    expect(undo(startOver(r)).pegs).toEqual(r.pegs);
    r = move(r, 1, 2);
    expect(isSolved(r)).toBe(true);
    expect(undo(r)).toBe(r);
    expect(startOver(r)).toBe(r);
  });
});

describe('moves left', () => {
  it('is 2ⁿ − 1 for a whole tower', () => {
    for (const n of [1, 2, 3, 4]) {
      const tower = Array.from({ length: n }, (_, i) => n - i);
      expect(movesLeft([tower, [], []], 2)).toBe(2 ** n - 1);
    }
  });

  it('matches trying every move, for every way to place 4 rings', () => {
    for (let code = 0; code < 81; code++) {
      const pegs: Pegs = [[], [], []];
      for (let ring = 4, c = code; ring >= 1; ring--, c = Math.floor(c / 3))
        pegs[c % 3].push(ring);
      for (const goal of [0, 1, 2])
        expect(movesLeft(pegs, goal)).toBe(search(pegs, goal));
    }
  });
});

describe('new games', () => {
  it('have the rings of the level, never already solved', () => {
    for (const level of LEVELS)
      for (let i = 0; i < 200; i++) {
        const r = newRound(level);
        expect(r.pegs.flat().sort()).toEqual(
          Array.from({ length: RINGS[level] }, (_, k) => k + 1)
        );
        for (const peg of r.pegs)
          expect([...peg].sort((a, b) => b - a)).toEqual(peg);
        expect(isSolved(r)).toBe(false);
      }
  });

  it('start as one tower on Easy and Medium', () => {
    for (const level of ['easy', 'medium'] as const)
      for (let i = 0; i < 100; i++) {
        const r = newRound(level);
        expect(movesLeft(r.pegs, r.goal)).toBe(2 ** RINGS[level] - 1);
      }
  });

  it('on Hard, are sometimes scattered, but never easier than Medium', () => {
    let scattered = 0;
    for (let i = 0; i < 400; i++) {
      const r = newRound('hard');
      expect(movesLeft(r.pegs, r.goal)).toBeGreaterThanOrEqual(
        FEWEST_SCATTERED
      );
      if (!r.pegs.some((p) => p.length === 4)) scattered++;
    }
    expect(scattered).toBeGreaterThan(100);
  });

  it('are not the same game twice in a row', () => {
    let last = newRound('easy');
    for (let i = 0; i < 100; i++) {
      const r = newRound('easy', Math.random, last);
      expect([r.goal, r.start]).not.toEqual([last.goal, last.start]);
      last = r;
    }
  });

  it('count a win', () => {
    const r = round([[], [], [2, 1]]);
    expect(recordWin(initialStats, r).medium.solved).toBe(1);
    expect(recordWin(initialStats, round([[2, 1], [], []]))).toBe(initialStats);
  });
});
