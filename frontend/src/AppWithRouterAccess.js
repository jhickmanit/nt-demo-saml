import React, { Component } from 'react';
import { Route, withRouter } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import Home from './components/Home';
import Login from './components/Login';
import CaptureExperience from './components/CaptureExperience';
import Protected from './components/Protected';
import config from './app.config';

export default withRouter(class AppWithRouterAccess extends Component {
  constructor(props) {
    super(props);
    this.onAuthRequired = this.onAuthRequired.bind(this);
  }

  onAuthRequired() {
    this.props.history.push('/login');
  }

  render() {
    console.log(config);
    return (
      <Security issuer={config.issuer}
        clientId={config.client_id}
        redirectUri={config.redirect_uri}
        pkce={false}
        onAuthRequired={this.onAuthRequired}>
          <Route path='/' exact={true} component={Home} />
          <SecureRoute path='/protected' component={Protected} />
          <Route path='/login' render={() => <Login baseUrl={config.url} />} />
          <Route path='/login/callback' component={LoginCallback} />
          <Route path='/idv' component={CaptureExperience} />
      </Security>
    );
  }
});
