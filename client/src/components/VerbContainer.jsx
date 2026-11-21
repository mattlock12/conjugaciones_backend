import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import Confetti, { CONFETTI_MS } from './Confetti';
import VerbPanel from './VerbPanel';
import { slideAnimation, SLIDE_MS } from './slide';
import { IconButton } from './AppHeader';
import { SidebarIcon, ChevronRight } from './Icons';
import {
  BACKGROUND,
  ACCENT,
  HIGHLIGHT,
  LABEL,
  ACCENT_PRESSED,
  NAVBAR_BG,
  HIGHLIGHT_RING,
  SECONDARY_LABEL,
  SEPARATOR,
  SUCCESS_BG,
  SUCCESS_NAVBAR_BG,
  TERTIARY_LABEL,
} from '../constants/StyleConstants';


const StyledContainer = styled.main`
  flex: 1;
  min-width: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${props => props.$done ? SUCCESS_BG : BACKGROUND};
  transition: background-color .8s ease;
`

const NavBar = styled.header`
  position: relative;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px 12px;
  background-color: ${props => props.$done ? SUCCESS_NAVBAR_BG : NAVBAR_BG};
  transition: background-color .8s ease;
  backdrop-filter: saturate(180%) blur(20px);
  -webkit-backdrop-filter: saturate(180%) blur(20px);
  border-bottom: 0.5px solid ${SEPARATOR};

  .titles {
    flex: 1;
    min-width: 0;
  }

  .infinitive {
    margin: 0;
    font-size: 30px;
    font-weight: 700;
    letter-spacing: -0.02em;
    line-height: 1.15;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .subtitle {
    margin-top: 2px;
    font-size: 14px;
    color: ${SECONDARY_LABEL};
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;

    .progress {
      color: ${TERTIARY_LABEL};
      margin-left: 6px;
    }
  }

  @media (max-width: 900px) {
    padding: 10px 14px;

    .infinitive {
      font-size: 24px;
    }

    .subtitle {
      font-size: 13px;
    }
  }
`

const NextButton = styled.button`
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 8px 16px;
  border: none;
  border-radius: 999px;
  background: linear-gradient(135deg, ${ACCENT} 0%, ${HIGHLIGHT} 100%);
  box-shadow: 0 4px 12px rgba(249, 102, 53, 0.3);
  color: ${LABEL};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, transform .1s;

  &:hover {
    background: ${ACCENT_PRESSED};
  }

  &:active {
    transform: scale(.97);
  }

  &:focus-visible {
    outline: none;
    box-shadow: 0 0 0 3px ${HIGHLIGHT_RING};
  }

  &:disabled {
    opacity: .4;
    cursor: default;
  }
`

function fetchVerbs ({ language, setVerbs, setLoading, setIdx, user }) {
  const verbsUrl = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  setLoading(true);
  return fetch(
    `${protocol}://${verbsUrl}/api/verbs/?l=${language}`,
    {
      redirect: 'follow',
      headers: user && user.token ?
        {
          'Authorization': `Token ${user.token}`
        } :
        {}
    })
    .then(
      resp => resp.json().then(rResp => {
        if (!resp.ok || !Array.isArray(rResp)) {
          console.error('Failed fetching verbs', rResp);
          rResp = [];
        }
        setVerbs(rResp);
        setLoading(false);
        setIdx(0);
      }),
      error => {
        console.error(error);
        setLoading(false);
      }
    )
}

function submitConjugations ({ user, verb, answersByTense }) {
  const verbsUrl = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${verbsUrl}/api/responses/` ;

  const answers = Object.keys(answersByTense || {}).map(tense => ({ ...answersByTense[tense], tense }));
  const payLoad = { verbId: verb.id, answers };
  fetch(
    url,
    {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${user.token}`,
      },
      redirect: 'follow',
      body: JSON.stringify(payLoad)
    }
  ).then(
    res => null,
    error => console.error("Failed submitting reponses")
  );
};




// the outgoing and incoming verb share one grid cell while sliding
const Stage = styled.div`
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template: minmax(0, 1fr) / minmax(0, 1fr);
  overflow: hidden;
`

const Titles = styled.div`
  ${slideAnimation}
`


const VerbContainer = ({ language, tenses, user, isSidebarOpen, openSidebar }) => {
  const [answersByTense, setAnswersByTense] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [verbs, setVerbs] = useState([])
  const [idx, setIdx] = useState(0)
  // bumped to fetch a fresh batch once the current one is exhausted
  const [batch, setBatch] = useState(0);
  const [allTensesDone, setAllTensesDone] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  // counts verbs shown, so outgoing and incoming panels never share a key
  const [serial, setSerial] = useState(0);
  // the verb sliding out after Next
  const [exiting, setExiting] = useState(null);

  const userToken = user && user.token;
  useEffect(() => {
    fetchVerbs({ language, setVerbs, setLoading, setIdx, user });
  }, [batch, language, userToken]);

  const verb = verbs[idx];
  const verbsLength = verbs.length;
  const showVerb = !isLoading && verb;

  const goToNext = () => {
    if (!verb) {
      return;
    }
    if (user) {
      submitConjugations({ user, verb, answersByTense });
    }
    setAnswersByTense({});
    setAllTensesDone(false);
    setShowConfetti(false);
    setExiting({ verb, serial });
    setSerial(serial + 1);

    if (idx >= verbsLength - 1) {
      setBatch(batch + 1);
    } else {
      setIdx(idx + 1);
    }
  };

  useEffect(() => {
    if (!exiting) {
      return undefined;
    }
    const timer = setTimeout(() => setExiting(null), SLIDE_MS);
    return () => clearTimeout(timer);
  }, [exiting]);

  useEffect(() => {
    if (!allTensesDone) {
      return undefined;
    }
    setShowConfetti(true);
    const timer = setTimeout(() => setShowConfetti(false), CONFETTI_MS);
    return () => clearTimeout(timer);
  }, [allTensesDone]);

  const panelProps = {
    language,
    tenses,
    setAnswersByTense,
    onAllDoneChange: setAllTensesDone,
    goToNextVerb: goToNext,
  };

  return (
    <StyledContainer $done={allTensesDone}>
      <NavBar $done={allTensesDone}>
        {
          !isSidebarOpen &&
          <IconButton type='button' aria-label='Show sidebar' onClick={openSidebar}>
            <SidebarIcon />
          </IconButton>
        }
        <Titles className='titles' key={serial} $anim={exiting ? 'in' : null} $dir={1}>
          <h2 className='infinitive'>{ showVerb ? verb.infinitive.toLowerCase() : 'Loading…' }</h2>
          <div className='subtitle'>
            { showVerb ? verb.infinitiveEnglish.toLowerCase() : '\u00a0' }
            { showVerb && <span className='progress'>· { idx + 1 } of { verbsLength }</span> }
          </div>
        </Titles>
        <NextButton type='button' onClick={goToNext} disabled={!showVerb}>
          Next <ChevronRight />
        </NextButton>
      </NavBar>
      <Stage>
        {
          exiting &&
          <VerbPanel
            key={exiting.serial}
            verb={exiting.verb}
            isExiting
            anim='out'
            {...panelProps}
          />
        }
        {
          showVerb &&
          <VerbPanel
            key={serial}
            verb={verb}
            anim={exiting ? 'in' : null}
            {...panelProps}
          />
        }
      </Stage>
      { showConfetti && <Confetti /> }
    </StyledContainer>
  );
}

export default VerbContainer;