# Rings

A free ring puzzle for young kids that works offline. Rings of different sizes sit on three pegs, and the child moves them one at a time until they are all on the peg with the star. A bigger ring may never go on a smaller one. It is the old Tower of Hanoi puzzle, made small enough for a five-year-old.

Made for ages 5 and up. There is no timer, no move counter and no way to lose. A move that is not allowed only makes the ring shake. Undo takes back the last move, and Start over puts the rings back where they started.

## Demo

Check out the live demo at: https://mardesnic.github.io/des-rings/

On your phone, open it and choose **Add to Home Screen** (Safari) or **Install app** (Chrome). It then opens like an app and works offline.

## Features

- Three levels:
  - **Easy**: 2 rings, 3 moves, to learn the rule
  - **Medium**: 3 rings, the classic 7-move puzzle
  - **Hard**: 4 rings; every other game starts with the rings scattered, and it always takes at least 8 moves
- Tap a peg to lift its top ring, then tap another peg to put it there
- Each ring size has its own colour
- A count of puzzles solved at each level
- Picks up where you left off after a reload
- Keeps the screen on while you play
- In English and Croatian, following the phone's language unless you pick one
- Light and dark mode
- No ads, accounts or tracking

## Development

```bash
npm install
npm run dev        # local dev server
npm test           # game and translation tests
npm run build      # production build in dist/
```

`npm run deploy` builds the app and publishes it to GitHub Pages.
