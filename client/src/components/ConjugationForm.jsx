import React, { useEffect, useRef, useState } from 'react';
import { Form, Field } from 'react-final-form'
import styled from 'styled-components';
import shuffle from 'lodash/shuffle';

import { LANGUAGE_TO_LABELS, applicablePersons } from '../constants/Constants';
import { checkAnswer, ROOT_TYPO } from '../constants/Answers';
import ProgressBar from './ProgressBar';
import {
  ACCENT,
  ACCENT_TEXT,
  ACCENT_SOFT,
  FILL,
  FILL_DISABLED,
  SUCCESS,
  SUCCESS_PRESSED,
  SUCCESS_TEXT,
  SUCCESS_SOFT,
  LABEL,
  SECONDARY_LABEL,
  SEPARATOR,
  SLIP_SOFT,
  SLIP_TEXT,
  TERTIARY_LABEL,
} from '../constants/StyleConstants';

const FormLine = styled.div`
  display: grid;
  grid-template-columns: 60px 1fr;
  align-items: center;
  column-gap: 10px;
  padding: 6px 0;

  &:not(:last-of-type) {
    border-bottom: 0.5px solid ${SEPARATOR};
  }
`

const PersonLabel = styled.label`
  font-size: 14px;
  color: ${props => props.$applicable ? SECONDARY_LABEL : TERTIARY_LABEL};
`

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
`

const STATE_BG = { correct: SUCCESS_SOFT, wrong: ACCENT_SOFT };
const STATE_BORDER = { correct: SUCCESS, wrong: ACCENT };

const FormInput = styled.input`
  width: 100%;
  height: 32px;
  margin: 0;
  padding: 0 10px;
  border: 1px solid ${props => props.$na ? 'transparent' : STATE_BORDER[props.$state] || 'transparent'};
  border-radius: 8px;
  background: ${props => props.$na ? FILL_DISABLED : STATE_BG[props.$state] || FILL};
  color: ${props => props.$na ? TERTIARY_LABEL : LABEL};
  font: inherit;
  font-size: 15px;

  &::placeholder {
    color: ${TERTIARY_LABEL};
  }

  &:disabled {
    opacity: 1;
    /* Safari otherwise greys out disabled text */
    -webkit-text-fill-color: currentColor;
    cursor: ${props => props.$na ? 'not-allowed' : 'default'};
  }

  @media (max-width: 900px) {
    height: 38px;
    /* 16px stops iOS Safari zooming in on focus */
    font-size: 16px;
  }
`

const Answer = styled.p`
  display: ${props => props.$shouldShow ? 'block' : 'none'};
  margin: 0 0 0 2px;
  font-size: 13px;
  font-weight: 500;
  color: ${props => props.$showError ? ACCENT_TEXT : SUCCESS_TEXT};
`

// a letter of the verb's root the typed answer got wrong (answer still accepted)
const Slip = styled.mark`
  padding: 0 1px;
  border-radius: 3px;
  background: ${SLIP_SOFT};
  color: ${SLIP_TEXT};
  font-weight: 700;
`

// the accepted spelling, with the root letters that were mistyped flagged
const SlipAnswer = ({ display, marks }) => [...display].map((ch, i) => (
  marks.includes(i) ? <Slip key={i}>{ch}</Slip> : ch
));

const CheckButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: ${ACCENT_SOFT};
  color: ${ACCENT_TEXT};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: rgba(249, 102, 53, 0.24);
  }
`

// one row: the input, plus (phones) a small Check button beside it while it has focus
const InputRow = styled.div`
  display: flex;
  gap: 6px;
  min-width: 0;
`

// Phones: a small Check button beside the focused box, so answers can be checked
// without first closing the keyboard to reach the Check button at the bottom.
// Beside rather than below the box: iOS only guarantees the focused input itself
// stays visible above the keyboard.
const RowCheck = styled.button`
  display: none;
  flex: 0 0 auto;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  padding: 0;
  border: none;
  border-radius: 8px;
  background: ${ACCENT_SOFT};
  color: ${ACCENT_TEXT};
  font-size: 18px;
  font-weight: 700;
  cursor: pointer;

  @media (max-width: 900px) {
    ${InputRow}:focus-within > & {
      display: inline-flex;
    }
  }
`

// tapping a check button mustn't take focus from the input, or iOS closes the keyboard
const keepInputFocus = { onMouseDown: event => event.preventDefault() };

const NextTenseButton = styled.button`
  display: block;
  width: 100%;
  margin-top: 10px;
  padding: 11px;
  border: none;
  border-radius: 10px;
  background: ${SUCCESS};
  color: ${LABEL};
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;

  &:hover {
    background: ${SUCCESS_PRESSED};
  }
`



// the first unanswered box, or the Next Tense button once everything is right
const focusFirstOpenInput = form => {
  const input = form && form.querySelector('input:not([disabled]), button[data-next]');
  if (input) {
    // don't let focus scroll a pane that is still sliding into view
    input.focus({ preventScroll: true });
  }
};


const ConjugationForm = ({ verbConjugations, infinitive, tense, isActive, language, setAnswersByTense, onCompleteChange, onNext, nextLabel }) => {
  const applicable = applicablePersons(language, tense, verbConjugations);
  // the person rows in a fresh random order each time a tense is shown, so
  // answers can't lean on the fixed yo / tú / él sequence; tabbing follows it
  const [personOrder] = useState(() => shuffle(Object.keys(LANGUAGE_TO_LABELS[language])));
  // persons answered correctly; these inputs are locked
  const [locked, setLocked] = useState({});
  // persons accepted despite a typo in the root: { display, marks } to flag it
  const [slips, setSlips] = useState({});

  const allCorrect = applicable.length > 0 && applicable.every(person => locked[person]);
  const formRef = useRef(null);
  // the progress bar: first-try correct answers since the last mistake
  const [streak, setStreak] = useState(0);
  const [failCount, setFailCount] = useState(0);
  // persons answered wrong at least once; fixing them later doesn't add to the streak
  const [missed, setMissed] = useState({});

  useEffect(() => {
    onCompleteChange(tense, allCorrect);
  }, [allCorrect]);

  // focus the first open box whenever this tense is shown
  useEffect(() => {
    if (isActive) {
      focusFirstOpenInput(formRef.current);
    }
  }, [isActive]);

  // a box that just locked loses focus; move on to the next open one
  useEffect(() => {
    const form = formRef.current;
    const active = document.activeElement;
    // browsers may still report the just-disabled input as active for a frame
    if (isActive && form && (!form.contains(active) || active.disabled)) {
      focusFirstOpenInput(form);
    }
  }, [locked]);

  return (
    <Form
      onSubmit={values => {
        setAnswersByTense(prev => ({ ...prev, [tense]: { ...(prev[tense] || {}), ...values } }));

        const errors = {};
        const newlyCorrect = {};
        const newSlips = {};
        applicable.forEach(person => {
          const given = values[person];
          // locked boxes keep their value but were already counted
          if (locked[person] || !given || !given.trim()) {
            return;
          }
          const check = checkAnswer(verbConjugations[person], given, infinitive);
          if (check.result) {
            newlyCorrect[person] = true;
            if (check.result === ROOT_TYPO) {
              newSlips[person] = check;
            }
          } else {
            errors[person] = true;
          }
        });
        setLocked(prev => ({ ...prev, ...newlyCorrect }));
        setSlips(prev => ({ ...prev, ...newSlips }));
        if (Object.keys(errors).length > 0) {
          setStreak(0);
          setFailCount(count => count + 1);
          setMissed(prev => ({ ...prev, ...errors }));
        } else {
          const firstTry = Object.keys(newlyCorrect).filter(person => !missed[person]).length;
          setStreak(count => count + firstTry);
        }

        return errors;
      }}
      // fields subscribe to their own state; without this the whole pane
      // re-renders whenever focus moves between inputs
      subscription={{}}
      render={
        ({ handleSubmit }) => (
          <form ref={formRef} onSubmit={handleSubmit} autoComplete={ 'off' }>
          {
            personOrder.map(person => {
              const isApplicable = applicable.includes(person);
              const isLocked = !!locked[person];
              const slip = slips[person];
              return (
              <FormLine key={person}>
                <PersonLabel $applicable={isApplicable}>{LANGUAGE_TO_LABELS[language][person]}</PersonLabel>
                {
                  isApplicable ?
                  <Field name={person}>
                    {({ input, meta }) => {
                      const hasSubmitted = meta.submitFailed || meta.submitSucceeded;
                      const wasAttempted = hasSubmitted && input.value && input.value.trim().length > 0;
                      const shouldShow = isLocked || (meta.dirtySinceLastSubmit ? false : wasAttempted);
                      const showError = !isLocked && meta.submitError && wasAttempted;
                      return (
                        <InputContainer>
                          <InputRow>
                            <FormInput
                              {...input}
                              disabled={isLocked}
                              spellCheck={false}
                              $state={shouldShow ? (showError ? 'wrong' : 'correct') : null}
                              type="text" />
                            <RowCheck type="submit" aria-label="Check" tabIndex={-1} {...keepInputFocus}>✓</RowCheck>
                          </InputRow>
                          <Answer
                            $shouldShow={shouldShow}
                            $showError={showError}
                          >
                            {showError ? '✗ ' : '✓ '}
                            {slip && !showError ?
                              <SlipAnswer display={slip.display} marks={slip.marks} /> :
                              verbConjugations[person].toLowerCase()}
                          </Answer>
                        </InputContainer>
                      );
                    }}
                  </Field> :
                  <InputContainer>
                    <FormInput
                      type="text"
                      disabled
                      $na
                      placeholder="—"
                      title="Not applicable for this verb" />
                  </InputContainer>
                }
              </FormLine>
              );
            })}
            <ProgressBar
              value={streak}
              total={applicable.length}
              failCount={failCount}
            />
            {
              allCorrect ?
                <NextTenseButton type="button" data-next onClick={onNext}>{nextLabel}</NextTenseButton> :
                <CheckButton type="submit">Check</CheckButton>
            }
          </form>
        )
      }
    />
  );
}

export default ConjugationForm;
