import React from 'react';
import { Form, Field } from 'react-final-form'
import styled from 'styled-components';

import { LANGUAGE_TO_LABELS } from '../constants/Constants';

const FormLine = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  visibility: ${props => props.shouldShow ? 'visible' : 'hidden'}
`

const PersonLabel = styled.label`
  margin-right: 20px;
  width: 60px;

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
  font-size: 1rem;
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
`

const CheckButton = styled.button`
  width: 100%;
  border: 1px solid gray;
  border-radius: 8px;
  font-size: 24px;
  font-weight: 600;
  padding: 20px;
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


const ConjugationForm = ({ verbConjugations, verb, tense, language }) => (
  <Form
    key={ `${verb.infinitive}${tense}` }
    onSubmit={(values, form, cb) => checkAnswer(verbConjugations, values, form, cb)}
    render={
      ({ handleSubmit, values }) =>(
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
          <CheckButton>Check</CheckButton>
        </form>
      )
    }
  >
  </Form>
)

export default ConjugationForm;
