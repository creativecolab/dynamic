import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Mobile from '../../Layouts/Mobile/Mobile';
import ActivityEnums from '../../../enums/activities';

import InputButtons from '../Components/InputButtons/InputButtons';
import Quizzes from '../../../api/quizzes';
import Responses from '../../../api/responses';
import Teams from '../../../api/teams';
import TeamFormation from '../Components/TeamFormation/TeamFormation';
import Waiting from '../../Components/Waiting/Waiting';
import TextBoxes from '../Components/TextBoxes/TextBoxes';
import ChooseTeammate from '../Components/ChooseTeammate/ChooseTeammate';

export default class Quiz extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired, // to handle responses
    status: PropTypes.number.isRequired, // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired, // length of this session in num of activities
    progress: PropTypes.number.isRequired, // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired // calculated in parent
  };

  // set state for initial render
  constructor(props) {
    super(props);

    // set state based on status
    const { pid, status, activity_id } = props;

    // TODO: set state selected & message here from db
    let selected = null;
    let submitted = false;
    // const feedbackMsge = "You already submitted a response!";

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      // get response, if available
      const response = Responses.findOne({
        pid,
        activity_id,
        type: 'indv'
      });

      console.log(response);

      if (response) {
        // eslint-disable-next-line prefer-destructuring
        selected = response.selected;
        submitted = true;
      }

      this.state = {
        buttonAction: this.submitIndvInput,
        buttonTxt: 'Submit',
        selected,
        submitted
      };
    }

    // team formation or summary phases
    else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
      this.state = {
        buttonAction: null,
        buttonTxt: null,
        hasFooter: false,
        hasTimer: false,
        selected
      };
    // team input phase
    else if (status === ActivityEnums.status.INPUT_TEAM) {
      // get response, if available
      const response = Responses.findOne({
        pid,
        activity_id,
        type: 'team'
      });

      console.log(response);

      if (response) {
        // eslint-disable-next-line prefer-destructuring
        selected = response.selected;
        submitted = true;
      }

      this.state = {
        buttonAction: this.submitTeamInput,
        buttonTxt: 'Submit',
        selected,
        submitted
      };
    }
  }

  // watch for status changes and update state
  componentDidUpdate(prevProps) {
    const { status } = this.props;

    // check for status change
    if (prevProps.status !== status) {
      // individual input phase
      if (status === ActivityEnums.status.INPUT_INDV)
        this.setState({
          feedbackClass: '',
          feedbackMsge: '',
          buttonAction: this.submitIndvInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true,
          selected: null,
          submitted: false,
          choseTeammate: false
        });
      // team formation or summary phases
      else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
        this.setState({
          feedbackClass: '',
          feedbackMsge: '',
          buttonAction: null,
          buttonTxt: null,
          hasFooter: false,
          hasTimer: false,
          selected: null,
          submitted: false
        });
      // team input phase
      else if (status === ActivityEnums.status.INPUT_TEAM)
        this.setState({
          feedbackClass: '',
          feedbackMsge: '',
          buttonAction: this.submitTeamInput,
          buttonTxt: 'Submit',
          hasFooter: true,
          hasTimer: true,
          selected: null,
          submitted: false
        });
    }
  }

  // (id, options) -> text
  getTextFromOpt(id, options) {
    return options.filter(opt => opt.id === id)[0].text;
  }

  submitTeamInput = () => {
    // extract submission vars
    const { selected, submitted } = this.state;

    // TODO: Set proper message/class
    if (submitted) {
      this.setState({
        feedbackMsge: 'You already voted!',
        feedbackClass: ''
      });
    }

    // ready to save response
    else if (selected) {
      const { pid, activity_id } = this.props;

      // find quiz for this activity
      const quiz = Quizzes.findOne({ activity_id });

      // get option index
      let index = -1;

      quiz.options.map((opt, i) => {
        if (selected === opt.id) index = i;
      });

      // increment votes for this option
      Quizzes.update(
        quiz._id,
        {
          $inc: {
            [`options.${index}.countTeam`]: 1
          }
        },
        error => {
          if (error) console.log(error);
          else console.log('Quiz updated!');
        }
      );

      // insert response to db
      Responses.insert(
        {
          pid,
          activity_id,
          quiz_id: quiz._id,
          timestamp: new Date().getTime(),
          selected,
          type: 'team'
        },
        error => {
          if (error) console.log(error);
          else console.log('Response recorded!');
        }
      );

      this.setState({
        submitted: true,
        feedbackMsge: 'Response submitted!',
        feedbackClass: 'good'
      });
    } else {
      this.setState({
        feedbackMsge: 'Please select a choice.',
        feedbackClass: 'error'
      });
    }
  };

  submitIndvInput = () => {
    // extract submission vars
    const { selected, submitted } = this.state;

    // TODO: Set proper message/class
    if (submitted) {
      this.setState({
        feedbackMsge: 'You already voted!',
        feedbackClass: ''
      });
    }

    // ready to save response
    else if (selected) {
      const { pid, activity_id } = this.props;

      // find quiz for this activity
      const quiz = Quizzes.findOne({ activity_id });

      // get option index
      let index = -1;

      quiz.options.map((opt, i) => {
        if (selected === opt.id) index = i;
      });

      // increment votes for this option
      Quizzes.update(
        quiz._id,
        {
          $inc: {
            [`options.${index}.countIndv`]: 1
          }
        },
        error => {
          if (error) console.log(error);
          else console.log('Quiz updated!');
        }
      );

      // insert response to db
      Responses.insert(
        {
          pid,
          activity_id,
          quiz_id: quiz._id,
          timestamp: new Date().getTime(),
          selected,
          type: 'indv'
        },
        error => {
          if (error) console.log(error);
          else console.log('Response recorded!');
        }
      );

      this.setState({
        submitted: true,
        feedbackMsge: 'Response submitted!',
        feedbackClass: 'good'
      });
    } else {
      this.setState({
        feedbackMsge: 'Please select a choice.',
        feedbackClass: 'error'
      });
    }
  };

  handleChooseTeammate = () => {
    this.setState({
      choseTeammate: true
    });
  };

  handleInputSelection = id => {
    if (this.state.submitted) {
      this.setState({
        feedbackMsge: 'You already voted!',
        feedbackClass: ''
      });
    } else {
      this.setState({
        selected: id,
        feedbackMsge: ''
      });
    }
  };

  // renders based on activity status
  renderContent({ status, pid, activity_id }) {
    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      // get current state
      const { submitted, selected } = this.state;

      // find quiz for this activity
      const quiz = Quizzes.findOne({ activity_id });

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      return (
        <InputButtons
          prompt={quiz.prompt}
          selected={selected}
          options={quiz.options}
          list
          handleSelection={this.handleInputSelection}
          freeze={submitted}
        />
      );
    }

    // team formation or summary phases
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      // look for this user's team
      const team = Teams.findOne({ activity_id, 'members.pid': pid });

      // joined after team formation
      if (!team) return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;

      return <TeamFormation team_id={team._id} pid={pid} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      // get current state
      const { submitted, selected } = this.state;

      // find quiz for this activity
      const quiz = Quizzes.findOne({ activity_id });

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      return (
        <InputButtons
          prompt={quiz.prompt}
          selected={selected}
          options={quiz.options}
          list
          handleSelection={this.handleInputSelection}
          freeze={submitted}
        />
      );
    }

    // summary phase
    if (status === ActivityEnums.status.SUMMARY) {
      if (!this.state.choseTeammate) {
        // look for this user's team
        const team = Teams.findOne({ activity_id, 'members.pid': pid });

        // joined after team formation
        if (!team) return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;

        return <ChooseTeammate team_id={team._id} pid={pid} handleChosen={this.handleChooseTeammate} />;
      }

      // find quiz for this activity
      // console.log("The activity_id for this activity is " + activity_id);
      const quiz = Quizzes.findOne({ activity_id });

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      const correctAnswer = quiz.options.filter(opt => opt.correct)[0].text;

      // get response, if available
      const responseIndv = Responses.findOne({
        pid,
        activity_id,
        type: 'indv'
      });
      const indvAnswer = responseIndv ? this.getTextFromOpt(responseIndv.selected, quiz.options) : 'No response';

      // get response, if available
      const responseTeam = Responses.findOne({
        pid,
        activity_id,
        type: 'team'
      });
      const teamAnswer = responseTeam ? this.getTextFromOpt(responseTeam.selected, quiz.options) : 'No response';

      // TODO: VIVIAN LOOK HERE
      // make boxes content
      const boxes = [
        {
          label: 'You selected',
          text: indvAnswer
        },
        {
          label: 'Your team selected',
          text: teamAnswer
        },
        {
          label: 'Correct answer',
          text: correctAnswer
        }
      ];

      return <TextBoxes prompt={quiz.prompt} boxes={boxes} />;
    }

    return 'TODO: Status no recognized';
  }

  render() {
    const { statusStartTime, progress, duration, sessionLength } = this.props;

    return (
      <Mobile
        activityName="Quiz"
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        {...this.state}
      >
        {this.renderContent(this.props)}
      </Mobile>
    );
  }
}
