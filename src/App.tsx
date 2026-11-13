import { useEffect, useState } from 'react';

import { Board } from './components/Board';
import { HomeLink } from './components/HomeLink';
import { Icon } from './components/Icon';
import { NewGame, SettingsView } from './components/Menu';
import { Confetti } from './components/Confetti';
import {
  canMove,
  initialStats,
  initialStore,
  isAtStart,
  isSolved,
  move,
  newRound,
  recordWin,
  startOver,
  top,
  undo,
  type Level,
  type Round,
  type Stats,
  type Store,
} from './lib/game';
import { STRINGS, detectLang } from './lib/i18n';
import { popMenu, pushMenu, useBackButton } from './lib/use-back-button';
import { useCheer, usePlop } from './lib/use-cheer';
import { useLanguage, useSound } from './lib/use-shared-settings';
import { useStoredState } from './lib/use-stored-state';
import { useWakeLock } from './lib/use-wake-lock';

type View = 'play' | 'new' | 'settings';

export default function App() {
  // Keys are prefixed: other apps on the same GitHub Pages origin share
  // this storage.
  const [store, setStore] = useStoredState<Store>('rings', initialStore);
  const [stats, setStats] = useStoredState<Stats>('rings-stats', initialStats);

  const [language, setLanguage] = useLanguage();
  const lang = language === 'auto' ? detectLang() : language;
  const t = STRINGS[lang];
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = t.title;
  }, [lang, t]);

  const [view, setViewState] = useState<View>(store.round ? 'play' : 'new');
  // Menus open over the game, so the phone's Back button closes them.
  const setView = (next: View) => {
    if (next === 'play') popMenu();
    else pushMenu();
    setViewState(next);
  };
  useBackButton(() => {
    if (store.round) setViewState('play');
  });
  useWakeLock();
  const [sound, setSound] = useSound();
  const cheer = useCheer(sound);
  const plop = usePlop(sound);
  const [celebrating, setCelebrating] = useState(false);
  // The peg whose top ring is lifted, and how many times it was put where
  // it may not go (it shakes each time).
  const [held, setHeld] = useState<number>();
  const [shake, setShake] = useState(0);

  const round = store.round;

  const start = (level: Level) => {
    setHeld(undefined);
    setStore({
      round: newRound(level, Math.random, round),
    });
    setView('play');
  };

  const update = (next: Round) => {
    setHeld(undefined);
    if (!round || next === round) return;
    setStore({ round: next });
    if (isSolved(next)) {
      setStats(recordWin(stats, next));
      // Once the last ring has dropped into place.
      setTimeout(() => {
        setCelebrating(true);
        cheer();
      }, 400);
    }
  };

  // Tap a peg to lift its top ring, then another to put it there. Tapping
  // the same peg puts the ring back down.
  const onPeg = (peg: number) => {
    if (!round) return;
    if (held === undefined) {
      if (round.pegs[peg].length) {
        setHeld(peg);
        setShake(0);
      }
    } else if (held === peg) setHeld(undefined);
    else if (canMove(round.pegs, held, peg)) {
      plop(top(round.pegs[held]));
      update(move(round, held, peg));
    } else setShake((n) => n + 1);
  };

  const solved = round && isSolved(round);

  return (
    <main className={view === 'play' && round ? 'app app--play' : 'app'}>
      <header className='header'>
        <div className='header__title'>
          <HomeLink label={t.allGames} />
          <h1>{t.title}</h1>
        </div>
        <div className='header__actions'>
          {view === 'play' ? (
            <>
              <button
                className='button button--small'
                onClick={() => setView('new')}
              >
                {t.newGame}
              </button>
              <button
                className='button button--small button--icon'
                onClick={() => setView('settings')}
                aria-label={t.settings}
              >
                <Icon name='settings' />
              </button>
            </>
          ) : (
            round && (
              <button
                className='button button--small button--icon'
                onClick={() => setView('play')}
                aria-label={t.close}
              >
                <Icon name='close' />
              </button>
            )
          )}
        </div>
      </header>

      {view === 'new' && <NewGame onStart={start} t={t} />}
      {view === 'settings' && (
        <SettingsView
          language={language}
          setLanguage={setLanguage}
          sound={sound}
          setSound={setSound}
          stats={stats}
          t={t}
        />
      )}

      {view === 'play' && round && (
        <>
          <div className='stage'>
            <Board
              round={round}
              held={held}
              shake={shake}
              onPeg={onPeg}
              t={t}
            />
          </div>

          {solved ? (
            <section className='card solved'>
              <h2>{t.solved}</h2>
              <div className='solved__actions'>
                <button className='button' onClick={() => start(round.level)}>
                  {t.next}
                </button>
                <button
                  className='button button--secondary'
                  onClick={() => setView('new')}
                >
                  {t.changeLevel}
                </button>
              </div>
            </section>
          ) : (
            <div className='bar'>
              <div className='tools'>
                <button
                  className='tool'
                  onClick={() => update(undo(round))}
                  disabled={!round.history.length}
                  aria-label={t.undo}
                >
                  <Icon name='undo' />
                </button>
                <button
                  className='tool'
                  onClick={() => update(startOver(round))}
                  disabled={isAtStart(round)}
                  aria-label={t.startOver}
                >
                  <Icon name='clear' />
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {view === 'settings' && (
        <footer className='footer'>
          <a href='/des-kids-games/'>{t.allGames}</a>
          <a href='https://github.com/mardesnic/des-rings'>{t.source}</a>
          <span className='footer__version'>
            {t.version} {__VERSION__}
          </span>
        </footer>
      )}
      {celebrating && <Confetti onDone={() => setCelebrating(false)} />}
    </main>
  );
}
