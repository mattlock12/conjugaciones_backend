import React, { Component } from 'react';
import { Form, Field } from 'react-final-form'
import { __metadata } from 'tslib';
import { redBright } from 'ansi-colors';

/**
 * "form1s"
"form2s"
"form3s"
"form1p"
"form2p"
"form3p"
 */
const personToLabel = {
  form1s: 'yo',
  form2s: 'tu',
  form3s: 'Ud',
  form1p: 'nos.',
  form2p: 'vos.',
  form3p: 'Uds.'
};

export default class ConjugationForm extends React.Component {
  checkAnswer(conjugations, values, form, cb) {
    const results = {};
    Object.keys(values).forEach(person => (
      results[person] = values[person] && conjugations[person].toLowerCase() !== values[person].toLowerCase()
    ))
    return cb(results);
  }

  render() {
    const { conjugations, verb, tense } = this.props;
    return (
      <Form
        key={`${verb.infinitive}${tense}`}
        onSubmit={(values, form, cb) => this.checkAnswer(conjugations, values, form, cb)}
        render={({ handleSubmit, values }) =>(
          <form id="search___" onSubmit={handleSubmit} autoComplete={'off'}>
            {
              Object.keys(conjugations).map(person => (
                personToLabel[person] &&
                <div
                  key={person}
                  style={{
                    alignItems: 'center',
                    display: 'flex',
                    width: '100%',
                    visibility: tense.includes('Imperativo') && ['form1s', 'form1p'].includes(person) || !conjugations[person]
                      ? 'hidden'
                      : 'visible'
                  }}
                >
                  <label
                    style={{
                      marginRight: '5px',
                      width: '30px'
                    }}
                  >
                    {personToLabel[person]}
                  </label>
                  <Field name={person}>
                    {({ input, meta }) => {
                      const hasSubmitted = meta.submitFailed || meta.submitSucceeded;
                      const wasAttempted = hasSubmitted && input.value && meta.visited && meta.touched;
                      const shouldShow = meta.dirtySinceLastSubmit ? false : wasAttempted;
                      const showError = meta.submitError && wasAttempted;
                      return (
                        <div
                          style={{
                            alignItems: 'center',
                            display: 'flex',
                            padding: '4px'
                          }}
                        >
                          <input
                            {...input}
                            style={{ height: '20px' }}
                            type='text'
                          />
                          <p style={{
                            color: showError ? 'red' : 'green',
                            height: '20px',
                            margin: '0px',
                            marginLeft: '7px',
                            visibility: shouldShow ? 'visible' : 'hidden'
                          }}>
                            {conjugations[person]}
                          </p>
                        </div>
                      );
                    }}
                  </Field>
                </div>
              ))
            }
            <button
              type='submit'
              style={{
                border: '1px solid gray',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px',
                padding: '10px',
                width: '100%'
              }}
            >
              Check
            </button>
          </form>
        )}>
      </Form>
    )
  }
}
