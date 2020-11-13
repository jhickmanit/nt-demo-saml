import React from 'react';
import { BrowserRouter as Router, Route, useHistory } from 'react-router-dom';
import { Security, SecureRoute, LoginCallback } from '@okta/okta-react';
import { Container } from 'semantic-ui-react';
import config from './app.config';
import Home from './components/Home';
import Login from './components/Login';
import Navbar from './components/Navbar';
import Profile from './components/Profile';
import Idv from './components/Idv';
import Verifying from './components/Verifying';

const HasAccessToRouter = () => {
  const history = useHistory();

  const customAuthHandler = () => {
    history.push('/login');
  };

  return (
    <Security
      {...config.oidc}
      onAuthRequired={customAuthHandler}
    >
      <Navbar />
      <Container text style={{ marginTop: '7em' }}>
        <Route path="/" exact component={Home} />
        <Route path="/login/callback" component={LoginCallback} />
        <Route path="/login" component={Login} />
        <Route path="/idv" component={Idv} />
        <Route path="/verifying" component={Verifying} />
        <Route path="/saml" component={props => {
          window.location.replace(`${process.env.REACT_APP_BACKEND_URL}/saml/response?applicant=${props.location.state.applicantId}&relayState=${props.location.state.relayState}`);
          return null;
        }} />
        <SecureRoute path="/profile" component={Profile} />
      </Container>
    </Security>
  );
};

const App = () => (
  <div>
    <Router>
      <HasAccessToRouter />
    </Router>
  </div>
);

export default App;


