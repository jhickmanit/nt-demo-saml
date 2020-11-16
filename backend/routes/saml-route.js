var express = require('express');
var router = express.Router();
const saml = require('samlify');
const fs = require('fs');
const xml2js = require('xml2js');
const path = require('path');
var validator = require('@authenio/samlify-xsd-schema-validator');
const { createOnfidoApplicant, getOktaUser, updateOktaUser, getOktaUserByApplicant } = require('../services/api');

saml.setSchemaValidator(validator);
const idp = new saml.IdentityProvider({
  metadata: fs.readFileSync(path.join(__dirname, '../saml/idp-metadata.xml')),
  privateKey: fs.readFileSync(path.join(__dirname, '../certs/localhost.key')),
  isAssertionEncrypted: false,
  loginResponseTemplate: {
    context: '<samlp:Response xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion" ID="{ID}" Version="2.0" IssueInstant="{IssueInstant}" Destination="{Destination}"><saml:Issuer>{Issuer}</saml:Issuer><samlp:Status><samlp:StatusCode Value="{StatusCode}"/></samlp:Status><saml:Assertion ID="{AssertionID}" Version="2.0" IssueInstant="{IssueInstant}" xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion"><saml:Issuer>{Issuer}</saml:Issuer><saml:Subject><saml:NameID Format="{NameIDFormat}">{NameID}</saml:NameID><saml:SubjectConfirmation Method="urn:oasis:names:tc:SAML:2.0:cm:bearer"><saml:SubjectConfirmationData NotOnOrAfter="{SubjectConfirmationDataNotOnOrAfter}" Recipient="{SubjectRecipient}"/></saml:SubjectConfirmation></saml:Subject><saml:Conditions NotBefore="{ConditionsNotBefore}" NotOnOrAfter="{ConditionsNotOnOrAfter}"><saml:AudienceRestriction><saml:Audience>{Audience}</saml:Audience></saml:AudienceRestriction></saml:Conditions><AuthnStatement AuthnInstant="{IssueInstant}"> <AuthnContext><AuthnContextClassRef>AuthnContextClassRef</AuthnContextClassRef></AuthnContext></AuthnStatement></samlp:Response>',
    attributes: [
      { name: 'userName', valueTag: 'user.userName', nameFormat: 'urn:oasis:names:tc:SAML:2.0:attrname-format:basic', valueXsiType: 'xs:string'}
    ],
  },
});

const sp = new saml.ServiceProvider({
  metadata: fs.readFileSync(path.join(__dirname, '../saml/sp-metadata.xml')),
});

router.get('/', async (req, res) => {
  let nameId = '';
  const relayState = req.query.RelayState;
  try {
    const samlRequest = await idp.parseLoginRequest(sp, 'redirect', req);
    const rawSaml = samlRequest.samlContent;
    req.session.authnRequest = samlRequest;
    console.log(rawSaml)
    const processors = xml2js.processors
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [processors.stripPrefix] });

    parser.parseString(rawSaml, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log(result);
        nameId = result.AuthnRequest.Subject.NameId;
        acs = result.AuthnRequest.$.AssertionConsumerServiceURL;
        req.session.acs = acs;
      }
    });
  } catch (error) {
    res.status(500).json({ error });
  }

  getOktaUser(nameId).then((user) => {
    createOnfidoApplicant(user.profile.firstName, user.profile.lastName, user.profile.email).then((applicant) => {
      updateOktaUser(nameId, applicant.id, '').then((updated) => {
        res.redirect(`${process.env.FRONTEND_URL}/idv?applicant=${applicant.id}&RelayState=${relayState}`);
      }).catch((error) => {
        res.status(500).json({ error });
      });
    }).catch((error) => {
      res.status(500).json({ error });
    });
  }).catch((error) => {
    res.status(500).json({ error });
  });
});

router.post('/', async (req, res) => {
  let nameId = '';
  let acs = '';
  const relayState = req.body.RelayState;
  console.log(relayState);
  try {
    const samlRequest = await idp.parseLoginRequest(sp, 'post', req);
    const rawSaml = samlRequest.samlContent;
    req.session.authnRequest = samlRequest;
    console.log(rawSaml)
    const processors = xml2js.processors
    const parser = new xml2js.Parser({ explicitArray: false, tagNameProcessors: [processors.stripPrefix] });

    parser.parseString(rawSaml, function (err, result) {
      if (err) {
        throw err;
      } else {
        console.log(result);
        nameId = result.AuthnRequest.Subject.NameID;
        acs = result.AuthnRequest.$.AssertionConsumerServiceURL;
        req.session.acs = acs;
      }
    });
  } catch (error) {
    res.status(500).json({ error });
  }

  getOktaUser(nameId).then((user) => {
    createOnfidoApplicant(user.profile.firstName, user.profile.lastName, user.profile.email).then((applicant) => {
      updateOktaUser(nameId, applicant.id, '').then((updated) => {
        res.redirect(`${process.env.FRONTEND_URL}/idv?applicant=${applicant.id}&RelayState=${relayState}`);
      }).catch((error) => {
        res.status(500).json({ error });
      });
    }).catch((error) => {
      res.status(500).json({ error });
    });
  }).catch((error) => {
    res.status(500).json({ error });
  });
});

router.get('/response', async (req, res) => {
  const applicant = req.query.applicant;
  console.log(applicant);
  const oktaRelayState = req.query.relayState;
  console.log(oktaRelayState);
  idp.relayState = oktaRelayState;
  const authnExtract = req.session.authnRequest;
  console.log(authnExtract);
  const acs = req.session.acs;
  console.log(acs);
  
  console.log(JSON.stringify(sp.entityMeta.meta));
  getOktaUserByApplicant(applicant).then( async (user) => {
    try {
      const samlUser = { email: user.profile.email, userName: user.profile.email };
      const { id, context } = await idp.createLoginResponse(sp, authnExtract, 'post', samlUser);
      console.log(context);
      res.status(200).json({ samlMessage: context, acs: acs });
    } catch (error) {
      res.status(500).json({ error });
    }
  }).catch((error) => {
    res.status(500).json({ error })
  });
});

module.exports = router;