import React, { useState, useEffect } from 'react';
import { hot } from 'react-hot-loader';

import Entry from './Entry';

const USERTOKEN_STORAGE_KEY = '__USERTOKEN';

const App = () => {
  const domain = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${domain}/api/users/`

  const [user, setUser] = useState(null);

  const [userToken, setUserToken] = useState(JSON.parse(localStorage.getItem(USERTOKEN_STORAGE_KEY)));
  useEffect(() => {
    if (userToken) {
      fetch(url, { headers: { "Authorization": `Token ${userToken}` }})
        .then(resp => resp.json())
        .then(jsonResp => {
          setUser({ ...jsonResp })
        });
    } else {
      localStorage.removeItem(USERTOKEN_STORAGE_KEY);
    }
  }, [userToken]);

  return (
    <Entry
      setUserToken={setUserToken}
      setUser={setUser}
      user={user}
     />
  );
}

export default hot(module)(App);
