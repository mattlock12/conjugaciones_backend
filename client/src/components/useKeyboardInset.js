import { useEffect, useState } from 'react';

const NO_INSET = { inset: 0, fixedBottom: null, debug: null };

// How far above `bottom: 0` a position: fixed element has to sit to clear the
// on-screen keyboard (0 when it's closed), plus where the bottom edge of the
// fixed-position area lands in client coordinates.
//
// Browsers disagree about what fixed elements are positioned against while the
// keyboard is open: some keep the full-height layout viewport (so `bottom: 0`
// is hidden behind the keyboard), while some iOS versions use just the visible
// area above it. Rather than assume either, measure an invisible full-height
// fixed element and lift only by how much of it the keyboard covers.
const useKeyboardInset = (enabled = true) => {
  const [state, setState] = useState(NO_INSET);

  useEffect(() => {
    const viewport = window.visualViewport;
    if (!enabled || !viewport) {
      setState(NO_INSET);
      return undefined;
    }

    const probe = document.createElement('div');
    probe.setAttribute('aria-hidden', 'true');
    probe.style.cssText = 'position:fixed;top:0;bottom:0;left:0;width:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(probe);

    const measure = () => {
      const box = probe.getBoundingClientRect();
      // the visible area's bottom edge, in the same (layout viewport) coordinates
      const visibleBottom = viewport.offsetTop + viewport.height;
      const inset = Math.max(0, Math.round(box.bottom - visibleBottom));
      setState(prev => (prev.inset === inset && prev.fixedBottom === box.bottom ? prev : {
        inset,
        fixedBottom: box.bottom,
        debug: `fixed ${Math.round(box.top)}–${Math.round(box.bottom)} · visible ${Math.round(viewport.offsetTop)}–${Math.round(visibleBottom)} · client ${document.documentElement.clientHeight} · inset ${inset}`,
      }));
    };

    // the keyboard animates in; measure again once it has settled
    let settle;
    const onChange = () => {
      measure();
      clearTimeout(settle);
      settle = setTimeout(measure, 300);
    };
    measure();
    viewport.addEventListener('resize', onChange);
    viewport.addEventListener('scroll', onChange);
    window.addEventListener('resize', onChange);
    return () => {
      clearTimeout(settle);
      viewport.removeEventListener('resize', onChange);
      viewport.removeEventListener('scroll', onChange);
      window.removeEventListener('resize', onChange);
      probe.remove();
    };
  }, [enabled]);

  return state;
};

export default useKeyboardInset;
