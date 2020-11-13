import { useOktaAuth } from '@okta/okta-react';
import React, { useState, useEffect } from 'react';
import { Button, Header } from 'semantic-ui-react';

const Home = () => {
  const { authState, authService } = useOktaAuth();
  const [userInfo, setUserInfo ] = useState(null);
  
  useEffect(() => {
    if (!authState.isAuthenticated) {
      setUserInfo(null);
    } else {
      authService.getUser().then((info) => {
        setUserInfo(info);
      });
    }
  }, [authState, authService]);

  const login = async () => {
    authService.login('/');
  };

  if (authState.isPending) {
    return (
      <div>Loading...</div>
    );
  }

  return (
    <div>
      <div>
        <Header as="h1">NT Demo Application</Header>
        { authState.isAuthenticated && !userInfo
        && <div>Loading user information...</div>}

        { authState.isAuthenticated && userInfo
        && (
          <div>
            <p>
              Welcome back,
              {userInfo.name}
              !
            </p>
            <p>
              You have successfully authenticated against your Okta org, and have been redirected back to this application.  You now have an ID token and access token in local storage.
              Visit the
              {' '}
              <a href="/profile">My Profile</a>
              {' '}
              page to take a look inside the ID token.
            </p>
          </div>
        )}

        {!authState.isAuthenticated
        && (
          <div>
            <p>If you&lsquo;re viewing this page then you have successfully started this React application.</p>
            <p>
              <span>This example will be used for showing a dynamic Identity Verification with Okta and Onfido</span>
            </p>
            <p>
              Click on the login button below, you will be redirected to the login page to either login or create/register a new account.
            </p>
            <Button id="login-button" primary onClick={login}>Login</Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;