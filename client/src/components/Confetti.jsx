import React, { useMemo } from 'react';
import styled, { keyframes } from 'styled-components';

import { CELADON, GIANTS_ORANGE, KEPPEL, ORANGE_WEB, VANILLA } from '../constants/StyleConstants';

const COLORS = [GIANTS_ORANGE, ORANGE_WEB, KEPPEL, CELADON, VANILLA];
const PIECES = 90;
export const CONFETTI_MS = 2600;

const fall = keyframes`
  0% {
    transform: translate3d(0, 0, 0) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translate3d(var(--drift), 105vh, 0) rotate(var(--spin));
    opacity: 0.9;
  }
`

const Layer = styled.div`
  position: fixed;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
  z-index: 50;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`

const Piece = styled.span`
  position: absolute;
  top: -20px;
  border-radius: 2px;
  animation: ${fall} var(--duration) cubic-bezier(0.25, 0.6, 0.4, 1) var(--delay) forwards;
`

const rand = (min, max) => min + Math.random() * (max - min);

// A one-shot burst; the parent unmounts it once CONFETTI_MS has passed.
const Confetti = () => {
  const pieces = useMemo(() => Array.from({ length: PIECES }, (_, i) => ({
    left: `${rand(0, 100)}%`,
    width: `${rand(6, 10)}px`,
    height: `${rand(10, 16)}px`,
    background: COLORS[i % COLORS.length],
    '--drift': `${rand(-120, 120)}px`,
    '--spin': `${rand(-720, 720)}deg`,
    '--duration': `${rand(1600, 2400)}ms`,
    '--delay': `${rand(0, 200)}ms`,
  })), []);

  return (
    <Layer aria-hidden='true'>
      { pieces.map((style, i) => <Piece key={i} style={style} />) }
    </Layer>
  );
};

export default Confetti;
