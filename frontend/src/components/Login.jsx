import React, { useEffect } from 'react';
import { useOktaAuth } from '@okta/okta-react';
import * as OktaSignIn from '@okta/okta-signin-widget';
import '@okta/okta-signin-widget/dist/css/okta-sign-in.min.css';

import config from '../app.config';


const Login = () => {
  const { authService } = useOktaAuth();

  useEffect(() => {
    const { issuer, clientId, redirectUri, scopes } = config.oidc;
    const widget = new OktaSignIn({
      el: '#sign-in-widget',
      baseUrl: issuer.split('/oauth2')[0],
      clientId,
      redirectUri,
      registration: {
        preSubmit: function(postData, onSuccess, onFailure){
          console.log(postData);
          postData.registeringApp = 'nt-demo';
          console.log(postData);
          return onSuccess(postData);
        },
      },
      authParams: {
        issuer,
        scopes,
      },
      features: {
        registration: true,
      },
    });

    widget.showSignInAndRedirect().catch((error) => {
      console.log(error);
    })
  }, [authService]);

  return (
    <div>
      <div id="sign-in-widget" />
    </div>
  );
};

export default Login;