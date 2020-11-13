import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import queryString from 'query-string';
import callApi from '../util/api';
import OnfidoSdk from './OnfidoSdk';

const getSDKToken = async (applicantId) => {
  return await callApi('POST', process.env.REACT_APP_BACKEND_URL, '/api/sdk', { applicantId }).then(result => {
    return result;
  });
};

export default class Idv extends Component {
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
    this.getToken(query.applicant);
  }

  async getToken(applicantId) {
    try {
      const token = await getSDKToken(applicantId);
      this.setState({
        sdkToken: token.sdkToken,
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
          options: {
            documentTypes: {
              driving_licence: {
                country: 'USA'
              },
              passport: {
                country: 'USA'
              },
              national_identity_card: {
                country: 'USA'
              },
              residence_permit: {
                country: 'USA'
              }
            }
          }
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
    return <OnfidoSdk options={this.setOptions(sdkToken)}></OnfidoSdk>;
  };

  render() {
    const { documentData, error, complete, sdkToken, applicantId, relayState } = this.state;
    if (complete) {
      return <Redirect to={{ pathname: '/verifying', state: { applicant: applicantId, data: documentData, relayState: relayState }}} />
    } else {
      if (error) {
        return <h3>Error: {error}</h3>;
      }
      if (sdkToken === '') {
        return (
          <div>
            <p>Loading...</p>
          </div>
        )
      }
      return this.renderOnfido();
    }
  };
};
