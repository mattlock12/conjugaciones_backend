import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { ACCENT, GOLD, SUCCESS, SECONDARY_LABEL } from '../constants/StyleConstants';

const FALL_MS = 750;
const SPARKS = 18;

const fallAway = keyframes`
  0% { transform: translateY(0) rotate(0deg); opacity: 1; }
  25% { transform: translateY(0) rotate(0deg); opacity: 1; }
  100% { transform: translateY(34px) rotate(4deg); opacity: 0; }
`

const flashRed = keyframes`
  0%, 60% { box-shadow: inset 0 0 0 2px ${ACCENT}; }
  100% { box-shadow: inset 0 0 0 2px transparent; }
`

const shimmer = keyframes`
  from { background-position: 200% 0; }
  to { background-position: -200% 0; }
`

const spark = keyframes`
  0% { transform: translate(-50%, -50%) scale(0.3) rotate(0deg); opacity: 1; }
  70% { opacity: 1; }
  100% {
    transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy))) scale(1) rotate(var(--spin));
    opacity: 0;
  }
`

const riseIn = keyframes`
  from { transform: translateY(6px); opacity: 0; }
  to { transform: none; opacity: 1; }
`

const Wrapper = styled.div`
  margin-top: 12px;

  .labels {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 6px;
    font-size: 13px;
    font-weight: 600;
    color: ${SECONDARY_LABEL};
  }

  .perfect {
    color: #8a5a00;
    font-weight: 700;
    animation: ${riseIn} .35s ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    * { animation-duration: 1ms !important; animation-iteration-count: 1 !important; }
  }
`

const Track = styled.div`
  position: relative;
  height: 14px;
  border-radius: 999px;
  background: rgba(109, 80, 56, 0.12);

  &.failed {
    animation: ${flashRed} ${FALL_MS}ms ease-out;
  }
`

const Fill = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 999px;
  background: ${SUCCESS};
  transition: width .45s cubic-bezier(0.34, 1.3, 0.64, 1);

  &.gold {
    background: linear-gradient(90deg, ${GOLD}, #ffd77a, ${GOLD});
    background-size: 200% 100%;
    box-shadow: 0 0 14px rgba(249, 168, 34, 0.7);
    animation: ${shimmer} 1.6s linear infinite;
  }
`

const Ghost = styled.div`
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 999px;
  background: ${ACCENT};
  pointer-events: none;
  animation: ${fallAway} ${FALL_MS}ms ease-in forwards;
`

const Spark = styled.svg`
  position: absolute;
  top: 50%;
  pointer-events: none;
  animation: ${spark} var(--duration) cubic-bezier(0.2, 0.7, 0.3, 1) var(--delay) both;
`

const rand = (min, max) => min + Math.random() * (max - min);

const Sparks = () => {
  const sparks = useMemo(() => Array.from({ length: SPARKS }, () => {
    // mostly upwards, fanning out to the sides
    const angle = rand(-Math.PI * 0.95, -Math.PI * 0.05);
    const distance = rand(40, 120);
    const size = rand(12, 22);
    return {
      size,
      style: {
        left: `${rand(4, 96)}%`,
        '--dx': `${Math.cos(angle) * distance}px`,
        '--dy': `${Math.sin(angle) * distance}px`,
        '--spin': `${rand(-200, 200)}deg`,
        '--duration': `${rand(800, 1400)}ms`,
        '--delay': `${rand(0, 450)}ms`,
      },
    };
  }), []);

  return sparks.map(({ size, style }, i) => (
    <Spark key={i} width={size} height={size} viewBox='0 0 24 24' style={style} aria-hidden='true'>
      <path
        d='M12 1.8l3.09 6.26 6.91 1-5 4.87 1.18 6.88L12 17.56l-6.18 3.25L7 13.93 2 9.06l6.91-1z'
        fill={i % 3 === 0 ? '#fff3b0' : GOLD}
        stroke='#c98500'
        strokeWidth='0.8'
      />
    </Spark>
  ));
};

// `value` first-try correct answers in a row out of a tense's `total` forms. `failCount`
// bumps on every wrong answer, which empties the bar: the old fill turns red and falls away.
// Since locked answers can't be redone, a full bar means the whole tense was right first try.
const ProgressBar = ({ value, total, failCount }) => {
  const realPct = total > 0 ? Math.min(100, (value / total) * 100) : 0;
  const perfect = total > 0 && value >= total;

  const lastPct = useRef(realPct);
  const [ghost, setGhost] = useState(null);
  const pct = realPct;

  useEffect(() => {
    if (failCount === 0) {
      return undefined;
    }
    // drop the fill as it was before this check as a red piece
    setGhost({ key: failCount, pct: lastPct.current });
    const timer = setTimeout(() => setGhost(null), FALL_MS);
    return () => clearTimeout(timer);
  }, [failCount]);

  useEffect(() => {
    lastPct.current = realPct;
  }, [realPct]);

  return (
    <Wrapper>
      <div className='labels'>
        {
          perfect ?
            <span className='perfect' role='status'>★ Perfect — no mistakes!</span> :
            <span>Streak</span>
        }
        <span>{ Math.min(value, total) } / { total }</span>
      </div>
      <Track
        key={ghost ? ghost.key : 'track'}
        className={ghost ? 'failed' : ''}
        role='progressbar'
        aria-valuemin={0}
        aria-valuemax={total}
        aria-valuenow={Math.min(value, total)}
      >
        <Fill className={perfect ? 'gold' : ''} style={{ width: `${pct}%` }} />
        { ghost && ghost.pct > 0 && <Ghost style={{ width: `${ghost.pct}%` }} /> }
        { perfect && <Sparks /> }
      </Track>
    </Wrapper>
  );
};

export default ProgressBar;
