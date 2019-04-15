import React, { Component } from 'react';
import Standard from '../../../Layouts/Standard/Standard';

import PropTypes from 'prop-types'

export default class Quiz extends Component {

  buttonAction = () => {
    console.log('Clicked [Quiz]');
  }

  render() {
    return (
      <Standard
        activityName="Quiz"
        sessionStatus="Round 2"
        buttonTxt="Done"
        clockDuration={15}
        buttonAction={this.buttonAction}
        >
        Content
      </Standard>
    )
  }
}
