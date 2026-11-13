import { PEGS, isSolved, ringCount, top, type Round } from '../lib/game';
import type { Strings } from '../lib/i18n';

// Each ring's colour by size, so a child can tell them apart and name them:
// a rainbow from the big red one at the bottom up.
const COLOURS = ['', '#3b82f6', '#2fa36b', '#f2b200', '#e5484d'];

// Drawing units: each peg is drawn in its own box this wide.
const WIDTH = 100;
const RING = 26;
const BASE = 14;
// Room above the peg for a lifted ring.
const LIFT = RING * 1.6;

function Star({ y }: { y: number }) {
  const points = Array.from({ length: 10 }, (_, i) => {
    const a = (i * Math.PI) / 5 - Math.PI / 2;
    const r = i % 2 ? 6.5 : 14;
    return `${(WIDTH / 2 + r * Math.cos(a)).toFixed(1)},${(y + r * Math.sin(a)).toFixed(1)}`;
  });
  return <polygon className='peg__star' points={points.join(' ')} />;
}

export function Board({
  round,
  held,
  shake,
  onPeg,
  t,
}: {
  round: Round;
  // The peg whose top ring is lifted, if any.
  held?: number;
  // Counts the moves not allowed, so the lifted ring shakes on each.
  shake: number;
  onPeg: (peg: number) => void;
  t: Strings;
}) {
  const rings = ringCount(round.pegs);
  const solved = isSolved(round);
  const peg = RING * rings + RING * 0.6;
  const floor = LIFT + peg;
  const height = floor + BASE + 36;
  const widthOf = (size: number) => 30 + (62 * size) / rings;

  return (
    <div className={solved ? 'board board--solved' : 'board'}>
      {Array.from({ length: PEGS }, (_, i) => {
        const stack = round.pegs[i];
        const goal = i === round.goal;
        return (
          <button
            key={i}
            className={held === i ? 'peg peg--held' : 'peg'}
            onClick={() => onPeg(i)}
            disabled={solved}
            aria-label={`${goal ? t.goalPeg : t.peg} ${i + 1}`}
          >
            <svg viewBox={`0 0 ${WIDTH} ${height}`} aria-hidden='true'>
              <rect
                className='peg__pole'
                x={WIDTH / 2 - 4}
                y={LIFT}
                width='8'
                height={peg + 4}
                rx='4'
              />
              <rect
                className='peg__base'
                x='-1'
                y={floor}
                width={WIDTH + 2}
                height={BASE}
              />
              {goal && <Star y={floor + BASE + 18} />}
              {stack.map((size, n) => {
                const lifted = held === i && size === top(stack);
                const w = widthOf(size);
                const y = floor - RING * (n + 1);
                // Two names for the same shake, so it plays again each time.
                const shaking =
                  lifted && shake ? `shake${shake % 2}` : undefined;
                return (
                  <g
                    key={size}
                    className={lifted ? 'ring ring--lifted' : 'ring'}
                    style={{ '--lift': `${2 - y}px` } as React.CSSProperties}
                  >
                    <rect
                      className={shaking}
                      x={(WIDTH - w) / 2}
                      y={y}
                      width={w}
                      height={RING - 2}
                      rx={(RING - 2) / 2}
                      style={{ fill: COLOURS[size] }}
                    />
                  </g>
                );
              })}
            </svg>
          </button>
        );
      })}
    </div>
  );
}
