import { useEffect, useState } from 'react';

// How far the bottom of what's actually on screen sits above the bottom of the
// layout viewport, in px: the on-screen keyboard's height while it's open, else 0.
//
// iOS Safari (and Chrome on Android by default) don't shrink the page when the
// keyboard opens; only the visual viewport shrinks, so `position: fixed;
// bottom: 0` ends up hidden behind the keyboard. Add this to `bottom` instead.
const useKeyboardInset = (enabled = true) => {
  const [inset, setInset] = useState(0);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) {
      setInset(0);
      return undefined;
    }
    const update = () => {
      const visibleBottom = viewport.offsetTop + viewport.height;
      setInset(Math.max(0, Math.round(document.documentElement.clientHeight - visibleBottom)));
    };
    update();
    viewport.addEventListener('resize', update);
    viewport.addEventListener('scroll', update);
    return () => {
      viewport.removeEventListener('resize', update);
      viewport.removeEventListener('scroll', update);
    };
  }, [enabled]);

  return inset;
};

export default useKeyboardInset;
