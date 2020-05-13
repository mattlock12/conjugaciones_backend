import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { capitalize } from 'lodash';

import ConjugationForm from './ConjugationForm';


const StyledContainer = styled.div`
  background: #f7f7f7;
  padding-left: 25px;
  width: 100%;
  height: 100%;
  overflow: scroll;

  @media (max-width: 900px) {
    padding: 0 20px;
  }
`

const StyledInfinitiveHeader = styled.div`
  background: white;
  display: flex;
  align-items: center;
  margin-left: -25px;
  padding-left: 25px;
  padding-top: 30px;
  margin-bottom: 15px;
  box-shadow: 1px 1px 3px #424242;

  #infinitive-organizer {
    display: flex;
    align-items: center;
    padding: 5px 0;
  }

  #infinitive {
    font-weight: 600;
    font-size: 28px;
  }

  #infinitive-english {
    margin-left: 20px;
  }

  #next-button {
    margin-left: 50px;
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
    #infinitive-organizer {
      flex-direction: column;
      align-items: flex-start;
    }

    #infinitive-english {
      margin-left: 0;
      font-size: .8rem;
    }

    #next-button {
      width: 100px;
      font-size: 28px;
    }
  }
`

const ConjugationFormList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  background: #f7f7f7;
`

const ConjugationFormHolder = styled.div`
  background: white;
  margin: 20px;
  margin-left: 0px;
  margin-top: 0px;
  border: 1px solid #aaa;
  border-radius: 8px;
  padding: 15px;
  font-size: 1rem;

  @media (max-width: 900px) {
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

const VerbContainer = ({ language, tenses, user }) => {
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
        <div>
          <StyledInfinitiveHeader>
            <div id='infinitive-organizer'>
              <div id='infinitive'>{ verb.infinitive.toLowerCase() }</div>
              <div id='infinitive-english'>({ verb.infinitiveEnglish.toLowerCase() })</div>
            </div>
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
            }}>next >></div>
          </StyledInfinitiveHeader>
          <ConjugationFormList>
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
        </div>
      }
    </StyledContainer>
  );
}

export default VerbContainer;