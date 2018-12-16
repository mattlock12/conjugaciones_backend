import React, { Component } from 'react';
import { Form, Field } from 'react-final-form'
import styled from 'styled-components';

const FormLine = styled.div`
  align-items: center;
  display: flex;
  width: 100%;
  shouldShow: ${props => props.visibility ? 'visible' : 'hidden'}
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
`

const personToLabel = {
  form1s: 'yo',
  form2s: 'tu',
  form3s: 'Ud',
  form1p: 'nos.',
  form2p: 'vos.',
  form3p: 'Uds.' 
};


const checkAnswer = (conjugations, values, form, cb) => {
  const results = {};
  Object.keys(values).forEach(person => (
  results[person] = values[person] && conjugations[person].toLowerCase() !== values[person].toLowerCase()

  ))
  cb(results);
};


const ConjugationForm = ({ conjugations, verb, tense, idx }) => (
  <Form
    key={ `${verb.infinitive}${tense}` }
    onSubmit={(values, form, cb) => checkAnswer(conjugations, values, form, cb)}
    render={
      ({ handleSubmit, values }) =>(
        <form id="search___" onSubmit={handleSubmit} autoComplete={ 'off' }>
        {
          Object.keys(conjugations).map(person => (
            personToLabel[person] &&
            <FormLine 
              key={person} 
              shouldShow={
                !(
                  tense.includes('Imperativo') &&
                  ['form1s', 'form1p'].includes(person) || !conjugations[person]
                )
              }
            >
              <PersonLabel>{personToLabel[person]}</PersonLabel>
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
                        >{conjugations[person]}</Answer>
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