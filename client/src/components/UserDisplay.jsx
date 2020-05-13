import React from 'react';

import { LOGIN_FORM } from './Entry';


const UserDisplay = ({ user, setUser, setUserToken, setShouldDisplay }) => {
  return (
    <div id='user-display-container'>
     {
      user ?
        <>
          <div>{user.email}</div>
          <div
            onClick={() => {
              setUser(null);
              setUserToken(null)
            }
          }>Logout</div>
        </>
        :
        <div onClick={() => setShouldDisplay(LOGIN_FORM)}>Login / Signup</div>
     }
     </div>
  )
};

export default UserDisplay;
