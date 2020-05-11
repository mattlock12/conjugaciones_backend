import React, { useState } from 'react'
import { Form, Field } from 'react-final-form'
import { FORM_ERROR } from 'final-form';
import styled from 'styled-components';

import { VERB_CONTAINER } from './Entry';


const LOGIN = 'LOGIN';
const SIGNUP = 'SIGNUP';

const StyledForm = styled.div`
  width: 100%;

  form {
    width: 500px;
    margin: 25px auto;
    display: flex;
    flex-direction: column;

    label {
      font-size: .8rem;
    }
  }
  .form-title {
    font-size: 1.4rem;
    font-weight: 600;
    margin-bottom: 10px;
  }

  .form-subtitle {
    margin-bottom: 10px;
    cursor: pointer;

    &:hover {
      color: blue;
    }
  }

  .button-holder {
    margin-top: 10px;
    display: flex;

    button {
      margin-right: 25px;
    }
  }

  .error {
    font-size: .8rem;
    color: red;
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
        return submitLoginData({ values, url, setUser, setUserToken, setShouldDisplay });
      }}
      validate={formType === SIGNUP ? validateSignup : _ => ({}) }
      render={
        ({ handleSubmit, submitError, pristine, invalid }) => (
          <StyledForm>
            <form onSubmit={handleSubmit}>
              {
                formType === LOGIN ?
                <>
                  <div className='form-title'>Login</div>
                  <div
                    className='form-subtitle'
                    onClick={ () => setFormType(SIGNUP) }
                   >Or Create an Account here</div>
                </>
                :
                <>
                  <div className='form-title'>Create an Account</div>
                  <div
                    className='form-subtitle'
                    onClick={ () => setFormType(LOGIN) }
                  >Or Login here</div>
                </>
              }
              <div className='error'>{submitError}</div>
              <label>Email</label>
              <Field name={'email'} validate={validateNotNull}>
              {({ input, meta }) => (
                <>
                  { meta.error && meta.touched && <div className='error'>{meta.error}</div> }
                  <input type='text' { ...input } />
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
                <button>Login</button>
                <div onClick={ () => setShouldDisplay(VERB_CONTAINER) } >Cancel</div>
              </div>
            </form>
          </StyledForm>
        )
      }
    />
  )

};

export default Login;
