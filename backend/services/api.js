const okta = require('@okta/okta-sdk-nodejs');
const onfido = require('@onfido/api');

const oktaClient = new okta.Client({
  orgUrl: process.env.OKTA_ORG_URL,
  token: process.env.OKTA_TOKEN,
});

const onfidoClient = new onfido.Onfido({
  apiToken: process.env.ONFIDO_TOKEN,
  region: onfido.Region.US,
});

const getOktaUser = (userId) => {
  return oktaClient.getUser(userId).then((response) => {
    return response;
  });
};

const updateOktaUser = (userId, applicantId, idvStatus) => {
  const user = { profile: {} };
  if (applicantId !== '') {
    user.profile.onfidoApplicantId = applicantId;
  };
  if (idvStatus !== '') {
    user.profile.onfidoIdvStatus = idvStatus;
  };
  return oktaClient.partialUpdateUser(userId, user, {}).then((response) => {
    return response;
  });
};

const updateOktaUserByApplicant = (applicantId, idvStatus) => {
  oktaClient.listUsers({ search: `profile.onfidoApplicantId eq "${applicantId}"` }).each((user) => {
    if (user.profile.onfidoApplicantId === applicantId) {
      updateOktaUser(user.id, '', idvStatus).then((done) => {
        return done;
      });
    };
  });
};

const getOktaUserByApplicant = async (applicantId) => {
  let user = '';
  await oktaClient.listUsers({ search: `profile.onfidoApplicantId eq "${applicantId}"`}).each((oktaUser) => {
    if (oktaUser.profile.onfidoApplicantId === applicantId) {
      console.log(oktaUser);
      user = oktaUser;
    }
  });
  return user;
};

const createOnfidoApplicant = (firstName, lastName, email) => {
  return onfidoClient.applicant.create({ firstName, lastName, email }).then((response) => {
    return response;
  });
};

const createOnfidoSDKToken = (applicantId) => {
  return onfidoClient.sdkToken.generate({ applicantId, referrer: '*://*/*'}).then((response) => {
    return response;
  });
};

const verifyHook = (request) => {
  const verifier = new onfido.WebhookEventVerifier(process.env.ONFIDO_WEBHOOK_TOKEN);
  try {
    return verifier.readPayload(request.body, request.headers['X-SHA2-Signature']);
  } catch (error) {
    return { error };
  }
};

const createOnfidoCheck = (applicantId) => {
  return onfidoClient.check.create({ applicantId: applicantId, reportNames: ['document', 'facial_similarity_photo']}).then((response) => {
    return response;
  });
};

const getOnfidoCheckResult = (checkId) => {
  return onfidoClient.check.find(checkId).then((response) => {
    return response;
  });
};

const services = {
  getOktaUser,
  updateOktaUser,
  getOktaUserByApplicant,
  createOnfidoApplicant,
  createOnfidoSDKToken,
  createOnfidoCheck,
  verifyHook,
  getOnfidoCheckResult,
  updateOktaUserByApplicant
};

module.exports = services;