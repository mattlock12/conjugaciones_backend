import React from 'react';
import styled from 'styled-components';

import { LOGIN_FORM } from './Entry';
import { TURQUOISE } from '../constants/StyleConstants'

const StyledUserDisplay = styled.div`
display: grid;
grid-template-columns: 1.5fr 1fr;
width: 100%;

.user-display-action {
  cursor: pointer;
  :hover {
    color: ${TURQUOISE};
  }
}

`


const UserDisplay = ({ user, setUser, setUserToken, setShouldDisplay }) => {
  return (
    <StyledUserDisplay>
     {
      user ?
        <>
          <div id='username'>{user.email}</div>
          <div
            className='user-display-action'
            onClick={() => {
              setUser(null);
              setUserToken(null)
            }
          }>Logout</div>
        </>
        :
        <div
          className='user-display-action'
          onClick={() => setShouldDisplay(LOGIN_FORM)}
        >Login / Signup</div>
     }
     </StyledUserDisplay>
  )
};

export default UserDisplay;
