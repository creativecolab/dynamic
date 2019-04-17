import React, { Component } from 'react';
import Standard from '/imports/ui/Layouts/Standard/Standard';
import ActivityEnums from '/imports/enums/activities';

import PropTypes from 'prop-types'

export default class Quiz extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired,          // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    progress: PropTypes.number.isRequired,        // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired,        // calculated in parent
  }

  // set state for initial render
  constructor(props) {
    super(props);
    
    // set state based on status
    const { status } = props;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
      this.state = {
        buttonAction: this.submitIndvInput,
        buttonTxt: 'Submit',
        hasFooter: true,
        hasTimer: true
      }

    // team formation or summary phases
    else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
      this.state = {
        buttonAction: null,
        buttonTxt: null,
        hasFooter: false,
        hasTimer: false
      }

    // team input phase
    else if (status === ActivityEnums.status.INPUT_TEAM)
      this.state = {
        buttonAction: this.submitTeamInput,
        buttonTxt: 'Submit',
        hasFooter: true,
        hasTimer: true
      }

  }

  submitIndvInput = () => {
    console.log('Individual response submitted.');
  }

  submitTeamInput = () => {
    console.log('Team response submitted.');
  }

  // watch for status changes and update state
  componentDidUpdate(prevProps) {
    
    // check for status change
    if (prevProps.status !== this.props.status) {

      // set state based on new status
      const { status } = this.props;

      // individual input phase
      if (status === ActivityEnums.status.INPUT_INDV) 
        this.setState({
          buttonAction: this.submitIndvInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true
        });

      // team formation or summary phases
      else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
        this.setState({
          buttonAction: null,
          buttonTxt: null,
          hasFooter: false,
          hasTimer: false
        });

      // team input phase
      else if (status === ActivityEnums.status.INPUT_TEAM)
        this.setState({
          buttonAction: this.submitTeamInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true
        });
    }
    
  }

  // renders based on activity status
  renderContent(status) {

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) 
      return "Individual input";

    // team formation or summary phases
    if (status === ActivityEnums.status.TEAM_FORMATION)
      return "Team formation";

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return "Team input";

    // summary phase
    if (status === ActivityEnums.status.SUMMARY)
      return "Summary";

    return "TODO: Status no recognized";
     
  }

  render() {
    const { status, statusStartTime, progress, duration } = this.props;
    return (
      <Standard
        activityName="Quiz"
        sessionStatus={progress}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        {...this.state}
      >
        {this.renderContent(status)}
      </Standard>
    )
  }
}
