import React, { useState, useEffect } from 'react';

import Entry from './Entry';

const USERTOKEN_STORAGE_KEY = '__USERTOKEN';

const App = () => {
  const domain = process.env.NODE_ENV === 'production' ? 'entend.io' : 'localhost';
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const url = `${protocol}://${domain}/api/users/`

  const [user, setUser] = useState(null);

  const userTokenFromLocalStorage = JSON.parse(localStorage.getItem(USERTOKEN_STORAGE_KEY));

  const [isFetchingUser, setIsFetchingUser] = useState(!!userTokenFromLocalStorage)

  const [userToken, setUserToken] = useState(userTokenFromLocalStorage);
  useEffect(() => {
    if (userToken) {
      fetch(url, { headers: { "Authorization": `Token ${userToken}` }})
        .then(resp => {
          if (!resp.ok) {
            // stale or invalid token: fall back to logged out
            setUserToken(null);
            return;
          }
          return resp.json().then(jsonResp => {
            localStorage.setItem(USERTOKEN_STORAGE_KEY, JSON.stringify(userToken));
            setUser({ ...jsonResp });
          });
        })
        .catch(error => console.error('Failed fetching user', error))
        .finally(() => setIsFetchingUser(false));
    } else {
      localStorage.removeItem(USERTOKEN_STORAGE_KEY);
      setIsFetchingUser(false);
    }
  }, [userToken]);




  return (
    !isFetchingUser &&
    <Entry
      setUserToken={setUserToken}
      setUser={setUser}
      user={user}
    />
  );
}

export default App;
