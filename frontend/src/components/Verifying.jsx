import React, { useState, useEffect } from 'react';
import { Redirect } from 'react-router-dom';
import { Dimmer, Loader, Segment } from 'semantic-ui-react';
import callApi from '../util/api';
import useInterval from '../util/interval';

const startCheck = async (applicantId) => {
  return await callApi('POST', process.env.REACT_APP_BACKEND_URL, '/api/check', { applicantId }).then(result => {
    return result.id;
  });
};

const checkStatus = async (checkId) => {
  return await callApi('POST', process.env.REACT_APP_BACKEND_URL, '/api/status', { checkId }).then(result => {
    return result;
  });
};

const updateUser = async (applicantId, checkResult) => {
  return await callApi('POST', process.env.REACT_APP_BACKEND_URL, '/api/update', { applicantId, checkResult }).then(result => {
    return result;
  });
};


const Verifying = (props) => {
  const [verifyState, setVerifyState] = useState({
    applicant: '',
    checkId: '',
    status: 'start',
    isComplete: undefined,
  });

  useEffect(() => {
    if (verifyState.status === 'start') {
      const app = props.location.state.applicant;
      const asyncCheck = async () => { 
        const check =  await startCheck(app);
        console.log(check);
        setVerifyState(prevState => ({
          ...prevState,
          applicant: app,
          checkId: check,
          status: 'in_progress',
          isComplete: false,
        }));
      }
      asyncCheck();
    }
  }, [verifyState, props.location.state.applicant]);

  useInterval(() => {
    if (!verifyState.isComplete && verifyState.isComplete !== undefined) {
      const asyncStatus = async () => {
        var currentStatus = await checkStatus(verifyState.checkId);
        console.log(currentStatus);
        if (currentStatus.checkStatus === 'complete') {
          updateUser(verifyState.applicant, currentStatus.checkResult);
          setVerifyState(prevState => ({
            ...prevState,
            status: 'complete',
            isComplete: true,
          }));
        }
      }
    asyncStatus();
    }
  }, !verifyState.isComplete ? 10000 : null);

  if (verifyState.status === 'in_progress' || verifyState.status === 'start') {
    return (
      <div style={{height: '300px'}}>
        <Segment placeholder>
          <Dimmer active inverted>
            <Loader inverted size="big" content="Verifying" />
          </Dimmer>
        </Segment>
      </div>
    );
  };

  return (
    <Redirect to={{ pathname: '/saml', state: { applicantId: verifyState.applicant, relayState: props.location.state.relayState } }} />
  );
};

export default Verifying;