import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { LANGUAGE_TO_TENSES, TENSES_WITH_CATEGORIES_BY_LANGUAGE } from '../constants/Constants';
import AppHeader from './AppHeader';
import VerbContainer from './VerbContainer';

const StyledEntry = styled.div`
display: flex;
  @media (max-width: 900px) {
    width: 90%;
  }
`


export default () => {
  let language = window.location.search.split('=')[1];
  language = language ? language.toUpperCase() : 'ES';
  const savedTenses = JSON.parse(localStorage.getItem(`tenses__${language}`)) || {};

  const [selectedTenses, toggleSelectedTense] = useState({
    ...LANGUAGE_TO_TENSES[language],
    ...savedTenses
  });

  useEffect(() => {
    localStorage.setItem(
      `tenses__${language}`,
      JSON.stringify(selectedTenses)
    );
  });

  console.log(TENSES_WITH_CATEGORIES_BY_LANGUAGE[language])
  return (
    <StyledEntry>
      <AppHeader
        language={language}
        tenses={selectedTenses}
        tensesWithCategories={TENSES_WITH_CATEGORIES_BY_LANGUAGE[language]}
        toggleSelectedTense={toggleSelectedTense}
      />
      <VerbContainer language={language} tenses={selectedTenses} />
    </StyledEntry>
  )
}
