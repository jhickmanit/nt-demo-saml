var express = require('express');
var router = express.Router();
const { Provider } = require('oidc-provider');
const { interactionPolicy: { Prompt, base: policy }} = require('oidc-provider');

const interactions = policy();

const selectAccount = new Prompt({
  name: 'select_account',
  requestable: true,
});

interactions.add(selectAccount, 0);

const oidcConfig = {
  clients: [
    {
      client_id: 'oktaOIDCClient',
      client_secret: 'QdjZM3PSqbfY8GAjhAPE8LaDK5MGd2EgGTUfA8uKWCa2ZB6nMNVjbqMD8CJRcw3q',
      grant_types: ['refresh_token', 'authorization_code'],
      redirect_uris: ['http://sso-client.dev/providers/7/open_id', 'http://sso-client.dev/providers/8/open_id'],
    },
  ],
  interactions: {
    policy: interactions,
    url(ctx, interaction) {
      return `/interaction/${ctx.oidc.uid}`;
    },
  },
  cookies: {
    long: { signed: true, maxAge: (1 * 24 * 60 * 60) * 1000 },
    short: { signed: true },
    keys: [process.env.APP_SECRET_KEY],
  },
  claims: {
    email: ['email'],
    profile: ['family_name', 'given_name'],
    ['openid']: ['externalId'],
  }
}
