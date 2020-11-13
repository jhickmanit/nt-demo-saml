const CLIENT_ID = process.env.REACT_APP_OKTA_CLIENT_ID || '{clientId}';
const ISSUER = process.env.REACT_APP_OKTA_ISSUER || 'https://{yourOktaDomain}.com/oauth2/default';
const REDIRECT_URI = process.env.REACT_APP_OKTA_REDIRECT_URI || 'http://localhost:3000/login/callback';
const OKTA_TESTING_DISABLEHTTPSCHECK = process.env.REACT_APP_OKTA_DISABLEHTTPSCHECK || false;

const config = {
  oidc: {
    clientId: CLIENT_ID,
    issuer: ISSUER,
    redirectUri: REDIRECT_URI,
    scopes: ['openid', 'profile', 'email'],
    pkce: true,
    disableHttpsCheck: OKTA_TESTING_DISABLEHTTPSCHECK,
  },
}
export default config;