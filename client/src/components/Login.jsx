import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { FORM_ERROR } from 'final-form';
import styled from 'styled-components';

import { VERB_CONTAINER } from './Entry';
import {
  BACKGROUND,
  ACCENT,
  ACCENT_TEXT,
  ACCENT_PRESSED,
  ACCENT_SOFT,
  FILL,
  LABEL,
  SUCCESS_TEXT,
  PANE_SHADOW,
  SECONDARY_LABEL,
  SURFACE,
} from '../constants/StyleConstants';


const LOGIN = 'LOGIN';
const SIGNUP = 'SIGNUP';

const StyledForm = styled.div`
  height: 100%;
  overflow-y: auto;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 10vh 16px 40px;
  background: ${BACKGROUND};

  form {
    width: 100%;
    max-width: 360px;
    display: flex;
    flex-direction: column;
    padding: 24px;
    border-radius: 14px;
    background: ${SURFACE};
    box-shadow: ${PANE_SHADOW};
  }

  .brand {
    margin: 0 0 18px;
    font-size: 15px;
    font-weight: 700;
    color: ${ACCENT_TEXT};

    span {
      color: ${SUCCESS_TEXT};
    }
  }

  .form-title {
    font-size: 26px;
    font-weight: 700;
    letter-spacing: -0.02em;
  }

  .form-subtitle {
    align-self: flex-start;
    margin: 4px 0 18px;
    padding: 0;
    border: none;
    background: none;
    color: ${ACCENT_TEXT};
    font-size: 14px;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }

  label {
    margin: 10px 0 5px;
    font-size: 13px;
    font-weight: 500;
    color: ${SECONDARY_LABEL};
  }

  input {
    height: 42px;
    padding: 0 12px;
    border: 1px solid transparent;
    border-radius: 10px;
    background: ${FILL};
    color: ${LABEL};
    font: inherit;
    font-size: 16px;
  }

  .button-holder {
    display: flex;
    flex-direction: column;
    gap: 8px;
    margin-top: 22px;

    button {
      height: 44px;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
    }

    .primary {
      background: ${ACCENT};
      color: ${LABEL};

      &:hover {
        background: ${ACCENT_PRESSED};
      }
    }

    .secondary {
      background: transparent;
      color: ${ACCENT_TEXT};

      &:hover {
        background: ${ACCENT_SOFT};
      }
    }
  }

  .error {
    margin-top: 4px;
    font-size: 13px;
    color: ${ACCENT_TEXT};
  }
`

const validateNotNull = val => (val ? undefined : 'Required');

const submitLoginData = ({ values, url, setUser, setUserToken, setShouldDisplay }) => {
  return fetch(
    url,
    {
      method: 'POST',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'application/json'
      },
      redirect: 'follow',
      body: JSON.stringify(values)
    }
  ).then(
    resp => resp.json()
  ).then(
    jsonResp => {
      if (jsonResp.errors) {
        return { [FORM_ERROR]: jsonResp.errors };
      }

      setShouldDisplay(VERB_CONTAINER);
      setUserToken(jsonResp.token);
      setUser({ ...jsonResp });

      return undefined;
    }
  ).catch(res => ({ [FORM_ERROR]: 'Failed submitting login info' }))
};

const validateSignup = values => {
  if (values.password != values.confirmpassword) {
    return {
      confirmpassword: 'Password and ConfirmPassword must match'
    }
  }
}

const Login = ({ setUser, setUserToken, setShouldDisplay }) => {
  const [formType, setFormType] = useState(LOGIN);

  return (
    <Form
      onSubmit={values => {
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        const domain = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
        const urlBase = formType === LOGIN ? '/api/login/' : '/api/users/';
        const url = `${protocol}://${domain}${urlBase}`;
        return submitLoginData({ values: { ...values, 'username': values.email }, url, setUser, setUserToken, setShouldDisplay });
      }}
      validate={formType === SIGNUP ? validateSignup : _ => ({}) }
      render={
        ({ handleSubmit, submitError, pristine, invalid }) => (
          <StyledForm>
            <form onSubmit={handleSubmit}>
              <div className='brand'>Entend<span>.ió</span></div>
              {
                formType === LOGIN ?
                <>
                  <div className='form-title'>Log in</div>
                  <button
                    type='button'
                    className='form-subtitle'
                    onClick={ () => setFormType(SIGNUP) }
                  >New here? Create an account</button>
                </>
                :
                <>
                  <div className='form-title'>Create an Account</div>
                  <button
                    type='button'
                    className='form-subtitle'
                    onClick={ () => setFormType(LOGIN) }
                  >Already have an account? Log in</button>
                </>
              }
              <div className='error'>{submitError}</div>
              <label>Email</label>
              <Field name={'email'} validate={validateNotNull}>
              {({ input, meta }) => (
                <>
                  { meta.error && meta.touched && <div className='error'>{meta.error}</div> }
                  <input type='email' autoComplete='email' { ...input } />
                </>
              )}
              </Field>
              <label>Password</label>
              <Field name={'password'} validate={validateNotNull}>
              {({ input, meta }) => (
                <>
                  { meta.error && meta.touched && <div className='error'>{meta.error}</div> }
                  <input type='password' { ...input } />
                </>
              )}
              </Field>
              <div style={{
                'display': formType === LOGIN ? 'none' : 'flex',
                'flexDirection': 'column'
              }}
              >
                <label>Confirm Password</label>
                <Field
                  name={'confirmpassword'}
                  validate={formType === SIGNUP ? validateNotNull : null}>
                {({ input, meta }) => (
                  <>
                    { meta.error && meta.touched && <div className='error'>{meta.error}</div> }
                    <input type='password' { ...input } />
                  </>
                )}
              </Field>
              </div>
              <div className='button-holder'>
                <button type='submit' className='primary'>
                  { formType === LOGIN ? 'Log in' : 'Create account' }
                </button>
                <button
                  type='button'
                  className='secondary'
                  onClick={ () => setShouldDisplay(VERB_CONTAINER) }
                >Cancel</button>
              </div>
            </form>
          </StyledForm>
        )
      }
    />
  )
};

export default Login;
