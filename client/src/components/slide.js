import { css, keyframes } from 'styled-components';

import { EASE_IOS } from '../constants/StyleConstants';

export const SLIDE_MS = 380;

// --dir is 1 when moving forward (things travel right-to-left), -1 when moving back
const slideIn = keyframes`
  from { transform: translateX(calc(var(--dir) * 100%)); opacity: 0; }
  to { transform: none; opacity: 1; }
`

const slideOut = keyframes`
  from { transform: none; opacity: 1; }
  to { transform: translateX(calc(var(--dir) * -100%)); opacity: 0; }
`

// Styled-components mixin driven by `$anim` ('in' | 'out' | null) and `$dir` (1 | -1).
export const slideAnimation = ({ $anim, $dir }) => $anim && css`
  --dir: ${$dir || 1};
  animation: ${$anim === 'in' ? slideIn : slideOut} ${SLIDE_MS}ms ${EASE_IOS} both;
  ${$anim === 'out' ? 'pointer-events: none;' : ''}

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    ${$anim === 'out' ? 'visibility: hidden;' : ''}
  }
`;
