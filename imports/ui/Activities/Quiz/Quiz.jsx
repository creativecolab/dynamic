import React, { Component } from 'react';
import Standard from '/imports/ui/Layouts/Standard/Standard';
import ActivityEnums from '/imports/enums/activities';

import PropTypes from 'prop-types'
import InputButtons from '../Components/InputButtons/InputButtons';
import quizzes from '../../../api/quizzes';

export default class Quiz extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired,     // to handle responses
    status: PropTypes.number.isRequired,          // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired,   // length of this session in num of activities
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
    }
    
    // ready to save response
    else if (this.state.selected) {


      const { pid, activity_id } = this.props;

      // insert response to db
      // Responses.insert({
      //   pid,
      //   activity_id,
      //   timestamp: new Date().getTime()
      // });

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
          feedbackClass: "",
          feedbackMsge: "",
          buttonAction: this.submitIndvInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true
        });

      // team formation or summary phases
      else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
        this.setState({
          feedbackClass: "",
          feedbackMsge: "",
          buttonAction: null,
          buttonTxt: null,
          hasFooter: false,
          hasTimer: false
        });

      // team input phase
      else if (status === ActivityEnums.status.INPUT_TEAM)
        this.setState({
          feedbackClass: "",
          feedbackMsge: "",
          buttonAction: this.submitTeamInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true
        });
    }
    
  }

  // renders based on activity status
  renderContent({ status, activity_id }) {

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      // TODO: fake options and prompt
      const { submitted } = this.state;

      // find quiz for this activity
      const quiz = Quizzes.findOne({ activity_id });

      // no quiz found
      if (!quiz) return "TODO: No quiz found.";

      return <InputButtons prompt={quiz.prompt} options={quiz.options} list={true} handleSelection={this.handleInputSelection} freeze={submitted} />
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
    const { statusStartTime, progress, duration, sessionLength } = this.props;
    return (
      <Standard
        activityName="Quiz"
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        {...this.state}
      >
        {this.renderContent(this.props)}
      </Standard>
    )
  }
}
