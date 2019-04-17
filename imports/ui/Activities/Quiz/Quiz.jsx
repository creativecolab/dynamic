import React, { Component } from 'react';
import Standard from '/imports/ui/Layouts/Standard/Standard';
import ActivityEnums from '/imports/enums/activities';

import PropTypes from 'prop-types'
import InputButtons from '../Components/InputButtons/InputButtons';

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

    // TODO: set state selected & message here from db
    const selected = null;
    const submitted = null;
    // const feedbackMsge = "You already submitted a response!";

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
      this.state = {
        buttonAction: this.submitIndvInput,
        buttonTxt: 'Submit',
        selected
      }

    // team formation or summary phases
    else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
      this.state = {
        buttonAction: null,
        buttonTxt: null,
        hasFooter: false,
        hasTimer: false,
        selected
      }

    // team input phase
    else if (status === ActivityEnums.status.INPUT_TEAM)
      this.state = {
        buttonAction: this.submitTeamInput,
        buttonTxt: 'Submit',
        selected
      }

  }

  handleInputSelection= id => {
    if (this.state.submitted) {
      this.setState({
        feedbackMsge: "You already voted!",
        feedbackClass: ""
      });
    } else {
      this.setState({
        selected: id,
        feedbackMsge: ""
      });
    }
  }

  submitIndvInput = () => {
    // TODO: Set proper message/class
    if (this.state.submitted) {
      this.setState({
        feedbackMsge: "You already voted!",
        feedbackClass: ""
      });
    } else if (this.state.selected) {
      this.setState({
        submitted: true,
        feedbackMsge: "Response submitted!",
        feedbackClass: "good"
      });
    } else {
      this.setState({
        feedbackMsge: "Please select a choice.",
        feedbackClass: "error"
      });
    }
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
    if (status === ActivityEnums.status.INPUT_INDV) {
      // TODO: fake options and prompt
      const { submitted } = this.state;
      const prompt = "What is the most likely answer you can think of in this situation, my friend?"
      const options = [
        {id: 'a', text: 'A. This one'},
        {id: 'b', text: 'B. No, this one'},
        {id: 'c', text: 'C. OMG, no! This one'},
        {id: 'd', text: 'D. OK, fine. This one'},
      ];
      return <InputButtons prompt={prompt} options={options} handleSelection={this.handleInputSelection} freeze={submitted} />
    }
      

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
