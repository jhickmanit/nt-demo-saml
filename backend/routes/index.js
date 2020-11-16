var express = require('express');
var router = express.Router();
var { getOktaUser,
  updateOktaUser,
  getOktaUserByApplicant,
  createOnfidoApplicant,
  createOnfidoSDKToken,
  createOnfidoCheck,
  verifyHook,
  getOnfidoCheckResult,
  addUserToGroupOkta,
  updateOktaUserByApplicant } = require('../services/api');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/applicant', function(req, res, next) {
  var user = req.body.user;
  createOnfidoApplicant(user.given_name, user.family_name, user.email).then((response) =>{
    updateOktaUser(user.email, response.id, '').then((update) => {
      return res.status(200).json({ applicantId: response.id });
    }).catch((error) => {
      return res.status(500).json({ isError: true, message: error})
    });
  }).catch((error) => {
    return res.status(500).json({ isError: true, message: error})
  });
});

router.post('/sdk', function(req, res, next) {
  var applicant = req.body.applicantId;
  console.log(applicant);
  createOnfidoSDKToken(applicant).then((response) => {
    return res.status(200).json({ sdkToken: response });
  }).catch((error) => {
    return res.status(500).json({ isError: true, message: error });
  });
});

router.post('/check', function(req, res, next) {
  var applicant = req.body.applicantId;
  console.log(`check for applicant: ${applicant}`);
  createOnfidoCheck(applicant).then((response) => {
    console.log(`Response for applicant: ${applicant} - ${JSON.stringify(response)}`);
    return res.status(200).json({ checkStatus: response.status, id: response.id });
  }).catch((error) => {
    console.log(error)
    return res.status(500).json({ isError: true, message: error });
  });
});

router.post('/status', function(req, res, next) {
  var checkId = req.body.checkId;
  console.log(`status of checkid: ${checkId}`);
  getOnfidoCheckResult(checkId).then((response) => {
    return res.status(200).json({ checkStatus: response.status, checkResult: response.result });
  }).catch((error) => {
    console.log(error)
    return res.status(500).json({ isError: true, message: error });
  });
});

router.post('/update', function(req, res, next) {
  var { applicantId, checkResult } = req.body;
  console.log(`applicant: ${applicantId} | checkResult: ${checkResult}`);
  try {
    updateOktaUserByApplicant(applicantId, checkResult);
    return res.status(200).json({ updated: true });
  } catch (error) {
    return res.status(500).json({ isError: true, message: error });
  }
});

router.post('/groups', async (req, res, next) => {
  var { userId } = req.body;
  res.status(200).json({ added: true });
  await sleep(2000);
  addUserToGroupOkta(userId).then((added) => {
    console.log(userId + ' added to group');
  }).catch((error) => {
    console.log('error adding ' + userId + ' to group: ' + error);
  });
});

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}   

router.post('/hook', function(req, res, next) {
  verifyHook(req).then((response) => {
    if (response.hasOwnProperty('error')) {
      return res.status(403).json({ error: 'unable to validate webhook token: ' + response});
    }
    getOnfidoCheckResult(response.object.id).then((check) => {
      const applicant = check.applicant_id;
      const result = check.result;
      getOktaUserByApplicant(applicant).then((user) => {
        updateOktaUser(user.id, '', result).then((output) => {
          return res.status(200);
        });
      });
    });
  });
});

module.exports = router;
