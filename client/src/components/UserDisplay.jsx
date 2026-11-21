import React from 'react';
import styled from 'styled-components';

import { LOGIN_FORM } from './Entry';
import { ACCENT_TEXT, SECONDARY_LABEL, SEPARATOR, SURFACE_TRANSLUCENT } from '../constants/StyleConstants'

const StyledUserDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 16px 8px;
  padding: 8px 12px;
  border-radius: 10px;
  background: ${SURFACE_TRANSLUCENT};
  border: 0.5px solid ${SEPARATOR};
  font-size: 13px;

  .username {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    color: ${SECONDARY_LABEL};
  }

  button {
    flex: 0 0 auto;
    padding: 0;
    border: none;
    background: none;
    color: ${ACCENT_TEXT};
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`


const UserDisplay = ({ user, setUser, setUserToken, setShouldDisplay }) => (
  <StyledUserDisplay>
    {
      user ?
        <>
          <div className='username' title={user.email}>{user.email}</div>
          <button
            type='button'
            onClick={() => {
              setUser(null);
              setUserToken(null);
            }}
          >Log out</button>
        </>
        :
        <>
          <div className='username'>Not signed in</div>
          <button type='button' onClick={() => setShouldDisplay(LOGIN_FORM)}>
            Log in / Sign up
          </button>
        </>
    }
  </StyledUserDisplay>
);

export default UserDisplay;
