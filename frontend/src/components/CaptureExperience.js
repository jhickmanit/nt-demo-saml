import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import callApi from '../util/api';
import Onfido from './Onfido';

const getSDKToken = async (applicantId) => {
  return await callApi('POST', process.env.REACT_APP_BACKEND_URL, '/api/sdk', { applicantId }).then(result => {
    return result;
  });
};

export default class CaptureExperience extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sdkToken: '',
    };
  }
  componentDidMount() {
    const query = queryString.parse(this.props.location.search);
    this.setState({
      applicantId: query.applicant,
      relayState: query.RelayState,
    });
    this.getToken();
  }

  async getToken() {
    try {
      const token = await getSDKToken(this.state.applicantId);
      this.setState({
        sdkToken: token,
      });
    } catch (error) {
      console.log(error);
    }
  }

  setOptions = (sdkToken) => {
    return {
      token: sdkToken,
      containerId: 'onfido-mount',
      useModal: false,
      smsNumberCountryCode: 'US',
      steps: [
        {
          type: 'welcome',
          options: {
            title: 'Verify your Identity',
            descriptions: [
              'To create an account, we will need to verify your identity using a photo ID and a photo of your face.'
            ],
          },
        },
        {
          type: 'document',
        },
        {
          type: 'face',
          options: {
            requestedVariant: 'standard',
          },
        },
      ],
      onComplete: (data) => {
        this.setState({ documentData: data, complete: true });
      },
      onError: (error) => {
        this.setState({ error, complete: false });
      }
    };
  };

  renderOnfido = () => {
    const { sdkToken } = this.state;
    return <Onfido options={this.setOptions(sdkToken)}></Onfido>;
  };

  render() {
    const { documentData, error, complete } = this.state;
    if (complete) {
      return <Redirect to={{ pathname: '/protected', state: { applicant: this.props.applicantId, data: documentData }}} />
    } else {
      if (error) {
        return <h3>Error: {error}</h3>;
      }
      return this.renderOnfido();
    }
  };
};
