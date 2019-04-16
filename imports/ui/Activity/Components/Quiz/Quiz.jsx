import React, { Component } from 'react';
import Standard from '../../../Layouts/Standard/Standard';

import PropTypes from 'prop-types'

export default class Quiz extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,          // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    progress: PropTypes.number.isRequired,        // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired,   // calculated in parent
  }

  buttonAction = () => {
    console.log('Clicked [Quiz]');
  }

  render() {
    // TODO: use status to determine buttonAction and buttonTxt
    const { status, statusStartTime, progress, duration } = this.props;
    return (
      <Standard
        activityName="Quiz"
        sessionStatus={progress}
        clockDuration={duration}
        buttonAction={this.buttonAction}
        buttonTxt="Submit"
        clockStartTime={statusStartTime}
        >
        Content
      </Standard>
    )
  }
}
