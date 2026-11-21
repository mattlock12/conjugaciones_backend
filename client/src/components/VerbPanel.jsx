import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import capitalize from 'lodash/capitalize';

import ConjugationForm from './ConjugationForm';
import { slideAnimation, SLIDE_MS } from './slide';
import useMediaQuery from './useMediaQuery';
import { applicablePersons } from '../constants/Constants';
import {
  ACCENT,
  EASE_IOS,
  LABEL,
  SUCCESS_TEXT,
  SUCCESS_SOFT,
  PANE_SHADOW,
  PANE_DONE_TINT,
  PANE_TINTS,
  SECONDARY_LABEL,
  SURFACE,
} from '../constants/StyleConstants';


const PanelRoot = styled.div`
  grid-area: 1 / 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  ${slideAnimation}
`

const TenseTabs = styled.div`
  position: relative;
  flex: 0 0 auto;
  display: flex;
  gap: 6px;
  overflow-x: auto;
  padding: 16px 20px 0;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 900px) {
    padding: 12px 12px 0;
  }
`

const TenseTab = styled.button`
  flex: 0 0 auto;
  padding: 6px 14px;
  border: none;
  border-radius: 999px;
  background: ${props => props.$active ? ACCENT : props.$done ? SUCCESS_SOFT : props.$tint};
  color: ${props => props.$done && !props.$active ? SUCCESS_TEXT : LABEL};
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  cursor: pointer;
`


const PaneArea = styled.div`
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  /* panes slide sideways when switching tenses */
  overflow-x: hidden;
  padding: 16px 20px 24px;

  @media (max-width: 900px) {
    padding: 12px;
  }
`

const PANE_WIDTH = 560;
const PANE_GAP = 24;

// Phones: panes share one grid cell so the outgoing and incoming ones overlap while sliding.
// Desktop: panes sit in a row that glides sideways to centre the active one.
const PaneStack = styled.div`
  display: grid;
  align-items: start;

  &.row {
    display: flex;
    gap: ${PANE_GAP}px;
    transition: transform ${SLIDE_MS}ms ${EASE_IOS};

    @media (prefers-reduced-motion: reduce) {
      transition: none;
    }
  }
`

const PaneSlot = styled.div`
  position: relative;
  grid-area: 1 / 1;
  min-width: 0;

  .row > & {
    flex: 0 0 auto;
  }

  /* covers a greyed-out pane so clicking anywhere on it switches to that tense */
  .activate {
    position: absolute;
    inset: 0;
    z-index: 1;
    border: none;
    border-radius: 18px;
    background: transparent;
    cursor: pointer;
  }
`

const Pane = styled.section`
  max-width: ${PANE_WIDTH}px;
  background: ${SURFACE};
  border-radius: 18px;
  box-shadow: ${PANE_SHADOW};
  transition: filter .3s ease, opacity .3s ease;
  ${slideAnimation}

  &.inactive {
    filter: grayscale(1);
    opacity: .45;
  }

  ${PaneSlot}:hover &.inactive {
    opacity: .65;
  }
`

const PaneHeader = styled.h3`
  margin: 0;
  border-radius: 18px 18px 0 0;
  padding: 12px 16px;
  background: ${props => props.$done ? PANE_DONE_TINT : props.$tint};
  color: ${props => props.$done ? SUCCESS_TEXT : LABEL};
  transition: background-color .6s ease, color .6s ease;
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`

const PaneBody = styled.div`
  padding: 4px 14px 10px;
`

const EmptyState = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${SECONDARY_LABEL};
  font-size: 15px;
`


// Everything for one verb: tense tabs, one pane per tense, and its progress.
// Rendered twice during a verb change (outgoing + incoming), so all per-verb state lives here.
const VerbPanel = ({
  verb,
  language,
  tenses,
  setAnswersByTense,
  onAllDoneChange,
  goToNextVerb,
  isExiting,
  anim,
}) => {
  // which tense is shown, and which tenses have every form answered correctly
  const [activeTense, setActiveTense] = useState(null);
  const [completedTenses, setCompletedTenses] = useState({});
  // the tense sliding out and which way: 1 = moving right, -1 = moving left
  const [transition, setTransition] = useState(null);
  const tabsRef = useRef(null);
  const areaRef = useRef(null);
  const isDesktop = useMediaQuery('(min-width: 901px)');
  // width of the pane area, to centre the active pane in the desktop row
  const [areaWidth, setAreaWidth] = useState(0);
  useLayoutEffect(() => {
    const area = areaRef.current;
    if (!area || !isDesktop) {
      return undefined;
    }
    const measure = () => {
      const style = getComputedStyle(area);
      setAreaWidth(area.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(area);
    return () => observer.disconnect();
  }, [isDesktop]);
  const onCompleteChange = useCallback((tense, done) => {
    setCompletedTenses(prev => (!!prev[tense] === done ? prev : { ...prev, [tense]: done }));
  }, []);

  // a fresh random tense order for every verb
  const tenseOrder = useMemo(() => new Map(), [verb.id]);
  const orderOf = tense => {
    if (!tenseOrder.has(tense)) {
      tenseOrder.set(tense, Math.random());
    }
    return tenseOrder.get(tense);
  };

  const panes = Object.keys(tenses || {})
    .filter(t => tenses[t])
    .map(tense => ({
      tense,
      conjugations: verb.verbConjugations.find(v =>
        v.tense.toLowerCase() === tense.toLowerCase()
      ) || {},
    }))
    // drop tenses with no real word in any person (e.g. defective verbs)
    .filter(({ tense, conjugations }) => applicablePersons(language, tense, conjugations).length > 0)
    .sort((a, b) => orderOf(a.tense) - orderOf(b.tense));

  const shownTense = panes.some(p => p.tense === activeTense) ?
    activeTense :
    (panes[0] && panes[0].tense);

  // keep the selected tab centred in the scrolling tab row
  useEffect(() => {
    const row = tabsRef.current;
    const tab = row && row.querySelector('[aria-selected="true"]');
    if (!tab) {
      return;
    }
    const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    row.scrollTo({
      left: tab.offsetLeft - (row.clientWidth - tab.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }, [shownTense]);

  const allTensesDone = panes.length > 0 && panes.every(p => completedTenses[p.tense]);
  useEffect(() => {
    if (!isExiting) {
      onAllDoneChange(allTensesDone);
    }
  }, [allTensesDone]);

  useEffect(() => {
    if (!transition) {
      return undefined;
    }
    const timer = setTimeout(() => setTransition(null), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [transition]);

  const showTense = tense => {
    if (tense === shownTense) {
      return;
    }
    const indexOf = t => panes.findIndex(p => p.tense === t);
    // on desktop the whole row glides instead
    if (!isDesktop) setTransition({ from: shownTense, dir: indexOf(tense) > indexOf(shownTense) ? 1 : -1, id: Date.now() });
    setActiveTense(tense);
  };

  // the next unfinished tense after `tense`, wrapping around; null when all are done
  const nextOpenTense = tense => {
    const start = panes.findIndex(p => p.tense === tense);
    for (let step = 1; step <= panes.length; step++) {
      const candidate = panes[(start + step) % panes.length].tense;
      if (!completedTenses[candidate]) {
        return candidate;
      }
    }
    return null;
  };

  const paneWidth = Math.min(PANE_WIDTH, areaWidth || PANE_WIDTH);
  const shownIndex = Math.max(0, panes.findIndex(p => p.tense === shownTense));
  const rowOffset = areaWidth ? areaWidth / 2 - (shownIndex * (paneWidth + PANE_GAP) + paneWidth / 2) : 0;

  const paneAnim = tense => {
    if (isDesktop || !transition) {
      return null;
    }
    if (tense === shownTense) {
      return 'in';
    }
    return tense === transition.from ? 'out' : null;
  };

  return (
    <PanelRoot $anim={anim} $dir={1} inert={isExiting} aria-hidden={isExiting || undefined}>
      {
        panes.length > 1 &&
        <TenseTabs ref={tabsRef} role='tablist' aria-label='Tenses'>
          {
            panes.map(({ tense }, tIdx) => (
              <TenseTab
                key={tense}
                type='button'
                role='tab'
                aria-selected={tense === shownTense}
                $active={tense === shownTense}
                $done={completedTenses[tense]}
                $tint={PANE_TINTS[tIdx % PANE_TINTS.length]}
                onClick={() => showTense(tense)}
              >{ completedTenses[tense] ? '✓ ' : '' }{ capitalize(tense) }</TenseTab>
            ))
          }
        </TenseTabs>
      }
      <PaneArea ref={areaRef}>
        <PaneStack
          className={isDesktop ? 'row' : ''}
          style={isDesktop ? { transform: `translateX(${rowOffset}px)` } : undefined}
        >
          {
            // every pane stays mounted so typed answers survive switching tabs
            panes.map(({ tense, conjugations }, tIdx) => {
              const isShown = tense === shownTense;
              return (
              <PaneSlot key={tense} style={isDesktop ? { width: paneWidth } : undefined}>
                <Pane
                  aria-label={capitalize(tense)}
                  role='tabpanel'
                  className={isDesktop && !isShown ? 'inactive' : ''}
                  inert={isDesktop && !isShown}
                  hidden={!isDesktop && !isShown && !(transition && tense === transition.from)}
                  $anim={paneAnim(tense)}
                  $dir={transition ? transition.dir : 1}
                >
                  <PaneHeader
                    $tint={PANE_TINTS[tIdx % PANE_TINTS.length]}
                    $done={completedTenses[tense]}
                  >
                    { capitalize(tense) }
                  </PaneHeader>
                  <PaneBody>
                    <ConjugationForm
                      isActive={ isShown && !isExiting }
                      tense={ tense }
                      language={language}
                      setAnswersByTense={setAnswersByTense}
                      onCompleteChange={onCompleteChange}
                      nextLabel={ nextOpenTense(tense) ? 'Next Tense' : 'Next verb' }
                      onNext={() => {
                        const next = nextOpenTense(tense);
                        if (next) {
                          showTense(next);
                        } else {
                          goToNextVerb();
                        }
                      }}
                      verbConjugations={ conjugations }
                      infinitive={ verb.infinitive }
                    />
                  </PaneBody>
                </Pane>
                {
                  isDesktop && !isShown &&
                  <button
                    type='button'
                    className='activate'
                    tabIndex={-1}
                    aria-label={`Show ${capitalize(tense)}`}
                    onClick={() => showTense(tense)}
                  />
                }
              </PaneSlot>
              );
            })
          }
        </PaneStack>
        {
          panes.length === 0 &&
          <EmptyState>No selected tenses apply to this verb. Pick more from the sidebar or tap Next.</EmptyState>
        }
      </PaneArea>
    </PanelRoot>
  );
};

export default VerbPanel;
