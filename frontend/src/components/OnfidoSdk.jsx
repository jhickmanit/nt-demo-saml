import React, { Component } from 'react';
import { init } from 'onfido-sdk-ui';

export default class OnfidoSdk extends Component {
  componentDidMount() {
    this.initSDK(this.props.options);
  };

  shouldComponentUpdate() {
    return false;
  };

  initSDK = (options) => {
    const onfidoSdk = init(options);
    this.setState({ onfidoSdk });
  };

  render = () => <div id="onfido-mount" style={{ display: 'flex '}}></div>;
}
