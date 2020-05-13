import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { LANGUAGE_TO_TENSES, TENSES_WITH_CATEGORIES_BY_LANGUAGE } from '../constants/Constants';
import AppHeader from './AppHeader';
import VerbContainer from './VerbContainer';
import Login from './Login';
import UserDisplay from './UserDisplay';

export const VERB_CONTAINER = 'VERB_CONTAINER';
export const LOGIN_FORM = 'LOGIN_FORM';

const StyledEntry = styled.div`
height: 100%;

display: flex;
`

const Entry = ({
  setUserToken,
  setUser,
  user
}) => {
  const [shouldDisplay, setShouldDisplay] = useState(VERB_CONTAINER);

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
  }, [selectedTenses]);

  if (shouldDisplay === LOGIN_FORM) {
    return (
      <Login
        setUser={setUser}
        setUserToken={setUserToken}
        setShouldDisplay={setShouldDisplay}
       />
    )
  }

  return (
    <StyledEntry>
      <AppHeader
        language={language}
        tenses={selectedTenses}
        tensesWithCategories={TENSES_WITH_CATEGORIES_BY_LANGUAGE[language]}
        toggleSelectedTense={toggleSelectedTense}
      >
        <UserDisplay
          user={user}
          setUser={setUser}
          setUserToken={setUserToken}
          setShouldDisplay={setShouldDisplay}
        />
      </AppHeader>
      <VerbContainer
        language={language}
        tenses={selectedTenses}
        user={user}
      />
    </StyledEntry>
  )
}

export default Entry;
