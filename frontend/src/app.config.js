const oktaSettings = {
  url: 'https://onfidosedemo.oktapreview.com',
  issuer: 'https://onfidosedemo.oktapreview.com/oauth2/default',
  redirect_uri: window.location.origin + '/implicit/callback',
  client_id: '0oatxzgv3OiSXyQKv0x6',
  scopes: ['openid', 'profile', 'email'],
  disableHttpsCheck: process.env.REACT_APP_DISABLE_HTTPS_CHECK
};

export default oktaSettings;