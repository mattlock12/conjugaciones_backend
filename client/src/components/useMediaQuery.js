import { useEffect, useState } from 'react';

const matches = query => !window.matchMedia || window.matchMedia(query).matches;

// Tracks a CSS media query, updating when the window crosses it.
const useMediaQuery = query => {
  const [isMatch, setIsMatch] = useState(() => matches(query));

  useEffect(() => {
    if (!window.matchMedia) {
      return undefined;
    }
    const list = window.matchMedia(query);
    const onChange = event => setIsMatch(event.matches);
    setIsMatch(list.matches);
    list.addEventListener('change', onChange);
    return () => list.removeEventListener('change', onChange);
  }, [query]);

  return isMatch;
};

export default useMediaQuery;
