import React, { useState } from 'react';
import { Form, Field } from 'react-final-form'
import styled from 'styled-components';
import MediaQuery from 'react-responsive';

import { LANGUAGE_TO_LABELS } from '../constants/Constants';

const FormLine = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  visibility: ${props => props.shouldShow ? 'visible' : 'hidden'}
`

const PersonLabel = styled.label`
  margin-right: 5px;
  width: 40px;
  font-size: .8rem;

  @media (max-width: 900px) {
  margin-right: 0px;
  width: 40px;
  font-weight: 400;
  }
`

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 4px;
  width: 100%
`

const FormInput = styled.input`
  height: 20px;
  width: 40%;
  font-size: .8rem;
  padding-left: 5px;

  @media (max-width: 900px) {
  height: 30px;
  width: 50%;
  border: 1px solid #c0c5d4;
  border-radius: 8px;
  }
`

const Answer = styled.p`
  height: auto;
  visibility: ${props => props.shouldShow ? 'visible' : 'hidden'};
  color: ${props => props.showError ? 'red' : 'green'};
  margin: 0px;
  margin-left: 7px;
  font-size: .8rem;
`

const CheckButton = styled.button`
  display: ${props => props.isMobile ? 'default' : 'none' };
  width: 100%;
  border: 1px solid gray;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 600;
  padding: 15px;
  margin-top: 5px;

  &:hover {
    background: #2dd251;
    border: 1px solid #2dd251;
    color: white;
    cursor: pointer;
  }
`


const checkAnswer = (verbConjugations, values, form, cb) => {
  const results = {};
  Object.keys(values).forEach(person => (
    results[person] = values[person] && verbConjugations[person].toLowerCase().trim() !== values[person].toLowerCase().trim()
  ))
  cb(results);
};


const ConjugationForm = ({ verbConjugations, verb, tense, language, answersByTense, setAnswersByTense }) => {
  return (
    <Form
      key={ `${verb.infinitive}${tense}` }
      onSubmit={(values, form, cb) => {
        const oldAnswers = answersByTense[tense] || {};
        const newAnswers = {...values, ...oldAnswers};
        setAnswersByTense({ ...answersByTense, [tense]: newAnswers });

        return checkAnswer(verbConjugations, values, form, cb);
      }}
      render={
        ({ handleSubmit }) =>(
          <form id="search___" onSubmit={handleSubmit} autoComplete={ 'off' }>
          {
            Object.keys(verbConjugations).map(person => (
              LANGUAGE_TO_LABELS[language][person] &&
              <FormLine
                key={person}
                shouldShow={
                  !(
                    tense.includes('Imperativo') &&
                    ['form1s', 'form1p'].includes(person) || !verbConjugations[person]
                  )
                }
              >
                <PersonLabel>{LANGUAGE_TO_LABELS[language][person]}</PersonLabel>
                <Field name={person}>
                    {({ input, meta }) => {
                      const hasSubmitted = meta.submitFailed || meta.submitSucceeded;
                      const wasAttempted = hasSubmitted && input.value && meta.visited && meta.touched;
                      const shouldShow = meta.dirtySinceLastSubmit ? false : wasAttempted;
                      const showError = meta.submitError && wasAttempted;
                      return (
                        <InputContainer>
                          <FormInput {...input} type="text" />
                          <Answer
                            shouldShow={shouldShow}
                            showError={showError}
                          >{verbConjugations[person].toLowerCase()}</Answer>
                        </InputContainer>
                      );
                    }}
                </Field>
              </FormLine>
            ))}
            <MediaQuery query="(min-device-width: 901px)">
              <CheckButton isMobile={false }>Check</CheckButton>
            </MediaQuery>
            <MediaQuery query="(max-device-width: 900px)">
              <CheckButton isMobile={true }>Check</CheckButton>
            </MediaQuery>
          </form>
        )
      }
    >
    </Form>
  );
}

export default ConjugationForm;
