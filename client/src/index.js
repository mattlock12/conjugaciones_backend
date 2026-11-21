import React from 'react';
import { createRoot } from 'react-dom/client';
import { createGlobalStyle } from 'styled-components';

import App from './components/App';
import { BACKGROUND, FONT_STACK, LABEL } from './constants/StyleConstants';

const GlobalStyle = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }

  body {
    margin: 0;
    font-family: ${FONT_STACK};
    color: ${LABEL};
    background: ${BACKGROUND};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  button { font-family: inherit; }
`;

createRoot(document.getElementById('root')).render(
  <>
    <GlobalStyle />
    <App />
  </>
);
