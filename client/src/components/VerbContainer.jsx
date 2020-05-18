import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { capitalize } from 'lodash';

import ConjugationForm from './ConjugationForm';


const StyledContainer = styled.div`
  display: grid;
  grid-template-rows: 100px 1fr;
  overflow: hidden;
  background: #f7f7f7;
  width: 100%;
  height: 100%;

  @media (max-width: 900px) {
    padding: 0 20px;
  }
`

const StyledInfinitiveHeader = styled.div`
  overflow: hidden;
  background: white;
  display: flex;
  align-items: center;
  padding-left: 25px;
  padding-top: 10px;
  margin-bottom: 15px;
  box-shadow: 1px 1px 3px #424242;

  #infinitive-organizer {
    display: flex;
    flex-direction: column;
    width: 100%;
    padding: 5px 0;
  }

  #infinitive-top {
    width: 100%;
    display: grid;
    grid-template-columns: 50% 50%;
    margin-bottom: 5px;
  }

  #infinitive {
    flex-grow: 1;
    font-weight: 600;
    font-size: 28px;
  }

  #next-button {
    margin-left: 5px;
    font-size: 17px;
    border: 1px solid gray;
    border-radius: 10px;
    padding: 5px;
    width: 150px;
    text-align: center;

    &:hover {
      cursor: pointer;
      background: blue;
      color: white;
      border: white;
    }
  }

  @media (max-width: 900px) {
    padding-top: 7px;

    #infinitive-english {
      margin-left: 0;
      font-size: .8rem;
    }

    #next-button {
      width: 75px;
      font-size: 16px;
    }
  }
`

const ConjugationFormList = styled.div`
  padding-left: 25px;
  background: #f7f7f7;
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  overflow: scroll;

  @media (max-width: 900px) {
    padding-left: 0;
  }
`

const ConjugationFormHolder = styled.div`
  min-height: 276px;
  background: white;
  margin: 20px;
  margin-left: 0px;
  margin-top: 0px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
  font-size: 1rem;

  @media (max-width: 900px) {
    height: 340px;
    margin: 5px 0;
    margin-left: 5px;
    font-size: 1rem;
    width: 100%;
  }
`

const ConjugationTense = styled.div`
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 7px;
`

function fetchVerbs ({ language, setVerbs, setLoading, setIdx, user }) {
  const verbsUrl = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  return fetch(
    `${protocol}://${verbsUrl}/api/verbs?l=${language}`,
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
        setVerbs(rResp);;
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
  const payLoad = { user, verbId: verb.id, answers };
  fetch(
    url,
    {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': user.token,
      },
      redirect: 'follow',
      body: JSON.stringify(payLoad)
    }
  ).then(
    res => null,
    error => console.error("Failed submitting reponses")
  );
};


const scrollToRef = ref => ref.current.scrollIntoView();


const VerbContainer = ({ language, tenses, user }) => {
  const verbListRef = useRef(null);
  const executeScroll = () => scrollToRef(verbListRef);

  const [answersByTense, setAnswersByTense] = useState({});
  const [isLoading, setLoading] = useState(true);
  const [verbs, setVerbs] = useState([])
  const [idx, setIdx] = useState(0)
  useEffect(() => {
    if (idx === 0) {
      fetchVerbs({ language, setVerbs, setLoading, setIdx, user });
    }
  }, [idx]);

  const verb = verbs[idx];
  const verbsLength = verbs.length;

  return (
    <StyledContainer>
      {
        isLoading || !verb ?
        <h1>Loading Some Verbs</h1> :
        <>
          <StyledInfinitiveHeader>
            <div id='infinitive-organizer'>
              <div id='infinitive-top'>
                <div id='infinitive'>{ verb.infinitive.toLowerCase() }</div>
                <div
                  id='next-button'
                  onClick={() => {
                    if (user) {
                      submitConjugations({ user, verb, answersByTense });
                    }
                    setAnswersByTense({});

                    if (idx >= verbsLength - 1) {
                    setIdx(0);
                    setVerbs([]);
                    } else {
                      setIdx(idx + 1);
                    }
                    executeScroll();
                  }}>next >></div>
              </div>
              <div id='infinitive-bottom'>
                <div id='infinitive-english'>({ verb.infinitiveEnglish.toLowerCase() })</div>
              </div>
            </div>
          </StyledInfinitiveHeader>
          <ConjugationFormList>
           <div ref={verbListRef}></div>
          {
            tenses && Object.keys(tenses).filter(t => tenses[t]).map((tense, tIdx) => (
              (
                Object.values(
                  verbs[idx].verbConjugations.find(v => v.tense.toLowerCase() === tense.toLowerCase()) || {}
                ).some(v => v)
              ) &&
              <ConjugationFormHolder key={`${tense}${verbs[idx]}`} >
                <ConjugationTense key={`${tense}tense`}>{capitalize(tense)}</ConjugationTense>
                <ConjugationForm
                  idx={ tIdx }
                  key={ `${tense}CF` }
                  shouldAutoFocus={ tIdx == 0 }
                  verb={ verbs[idx] }
                  tense={ tense }
                  language={language}
                  answersByTense={answersByTense}
                  setAnswersByTense={setAnswersByTense}
                  verbConjugations={
                    verbs[idx].verbConjugations.find(v =>
                      v.tense.toLowerCase() === tense.toLowerCase()
                    ) || {}
                  }
                />
              </ConjugationFormHolder>
            ))
          }
          </ConjugationFormList>
        </>
      }
    </StyledContainer>
  );
}

export default VerbContainer;