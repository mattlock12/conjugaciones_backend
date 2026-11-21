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
  overflow: hidden;
`

const startsOpen = () => !window.matchMedia || window.matchMedia('(min-width: 901px)').matches;

const Entry = ({
  setUserToken,
  setUser,
  user
}) => {
  const [shouldDisplay, setShouldDisplay] = useState(VERB_CONTAINER);
  // open by default on desktop; on phones the sidebar is a slide-over sheet
  const [isSidebarOpen, setIsSidebarOpen] = useState(startsOpen);

  const requestedLanguage = (new URLSearchParams(window.location.search).get('l') || '').toUpperCase();
  const language = requestedLanguage in LANGUAGE_TO_TENSES ? requestedLanguage : 'ES';
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
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
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
        isSidebarOpen={isSidebarOpen}
        openSidebar={() => setIsSidebarOpen(true)}
      />
    </StyledEntry>
  )
}

export default Entry;
