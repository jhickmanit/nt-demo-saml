import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import OktaSignInWidget from './OktaSignInWidget';
import { withOktaAuth } from '@okta/okta-react';
import config from '../app.config';

export default withOktaAuth(class Login extends Component {
  constructor(props) {
    super(props);
    this.onSuccess = this.onSuccess.bind(this);
    this.onError = this.onError.bind(this);
  }

  onSuccess(res) {
    console.log(res);
    if (res.status === 'SUCCESS') {
      return this.props.authService.redirect({
        sessionToken: res.session.token
      });
    } else {
      return;
    }
  }

  onError(err) {
    console.log('error logging in', err);
  }

  render() {
    return this.props.authState.isAuthenticated ?
      <Redirect to={{ pathname: '/' }}/> :
      <OktaSignInWidget
        baseUrl={this.props.baseUrl}
        onSuccess={this.onSuccess}
        onError={this.onError}
        scopes={config.scopes}
        issuer={config.issuer}/>;
  };
});
