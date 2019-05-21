import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Mobile from '../../Layouts/Mobile/Mobile';
import ActivityEnums from '../../../enums/activities';

import InputButtons from '../Components/InputButtons/InputButtons';
import Quizzes from '../../../api/quizzes';
import Responses from '../../../api/responses';
import Teams from '../../../api/teams';
import Activities from '../../../api/activities';
import TeamFormation from '../Components/TeamFormation/TeamFormation';
import Waiting from '../../Components/Waiting/Waiting';
import TextBoxes from '../Components/TextBoxes/TextBoxes';
import ChooseTeammate from '../Components/ChooseTeammate/ChooseTeammate';
import IndividualQuestions from './Components/IndividualQuestions/IndividualQuestions';
import TeamQuestions from './Components/TeamQuestions/TeamQuestions';
import TeammateSliders from '../Components/TeammateSliders/TeammateSliders';

class Quiz extends Component {
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
    let hasFooter = false;
    // const feedbackMsge = "You already submitted a response!";

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      // get response, if available
      const response = Responses.findOne({
        pid,
        activity_id,
        type: 'indv'
      });

      if (response) {
        selected = response.selected;
        submitted = true;
        hasFooter = false;
      }

      this.state = {
        index: 0,
        hasFooter,
        buttonAction: this.next,
        buttonTxt: 'Next',
        selected,
        submitted
      };
    }

    // team formation or summary phases
    else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY) {
      this.state = {
        buttonAction: null,
        buttonTxt: null,
        hasFooter: false,
        hasTimer: false,
        selected
      };
    }

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
        hasFooter = true;
      }

      this.state = {
        index: 0,
        hasFooter,
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
          index: 0,
          feedbackClass: '',
          feedbackMsge: '',
          buttonAction: this.submitIndvInput,
          buttonTxt: 'Submit',
          hasFooter: false,
          hasTimer: true,
          selected: null,
          submitted: false,
          choseTeammate: false
        });
      // team formation or summary phases
      else if (status === ActivityEnums.status.TEAM_FORMATION || status === ActivityEnums.status.SUMMARY)
        this.setState({
          index: 0,
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
          index: 0,
          feedbackClass: '',
          feedbackMsge: '',
          buttonAction: this.submitTeamInput,
          buttonTxt: 'Submit',
          hasFooter: false,
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
        feedbackMsge: 'You already submitted (team)!',
        feedbackClass: ''
      });
    }

    // ready to save response
    else if (selected) {
      const { pid, activity_id, quiz } = this.props;

      // iterate through selected responses
      for (let i = 0; i < selected.length; i++) {
        console.log(selected[i]);

        if (quiz.questions[i].type === ActivityEnums.quiz.MULTI_CHOICE) {
          // get option index
          let index = -1;

          quiz.questions[i].options.map((opt, j) => {
            if (selected[i] === opt.id) index = j;
          });

          Quizzes.update(
            quiz._id,
            {
              $inc: {
                [`questions.${i}.options.${index}.countTeam`]: 1
              }
            },
            error => {
              if (error) console.log(error);
              else console.log('Quiz updated!');
            }
          );
        }
      }

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
        feedbackMsge: 'You already submitted!',
        feedbackClass: ''
      });
    }

    // ready to save response
    else if (selected) {
      const { pid, activity_id, quiz } = this.props;

      // iterate through selected responses
      for (let i = 0; i < selected.length; i++) {
        console.log(selected[i]);

        if (quiz.questions[i].type === ActivityEnums.quiz.MULTI_CHOICE) {
          // get option index
          let index = -1;

          quiz.questions[i].options.map((opt, j) => {
            if (selected[i] === opt.id) index = j;
          });

          Quizzes.update(
            quiz._id,
            {
              $inc: {
                [`questions.${i}.options.${index}.countIndv`]: 1
              }
            },
            error => {
              if (error) console.log(error);
              else console.log('Quiz updated!');
            }
          );
        }
      }

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

  handleInputSelection = responses => {
    const { submitted } = this.state;

    if (submitted) {
      this.setState({
        feedbackMsge: 'You already submitted!',
        feedbackClass: '',
        hasFooter: true
      });
    } else {
      this.setState({
        selected: responses,
        feedbackMsge: '',
        hasFooter: true
      });
    }
  };

  nextQ = () => {
    this.setState(prevState => ({
      index: prevState.index + 1,
      hasFooter: false,
      buttonAction: this.submitIndvInput,
      buttonTxt: 'Submit'
    }));
  };

  next = () => {
    this.setState(prevState => ({
      index: prevState.index + 1,
      hasFooter: false
    }));
  };

  readyToNext = () => {
    this.setState(() => ({
      hasFooter: true,
      buttonAction: this.next,
      buttonTxt: 'Next'
    }));
  };

  readyToSubmitIndv = responses => {
    const { submitted } = this.state;

    if (submitted) {
      this.setState({
        feedbackMsge: 'You already submitted!',
        feedbackClass: '',
        buttonAction: this.submitIndvInput,
        buttonTxt: 'Submit',
        hasFooter: true
      });
    } else {
      this.setState({
        selected: responses,
        feedbackMsge: '',
        feedbackClass: '',
        buttonAction: this.submitIndvInput,
        buttonTxt: 'Submit',
        hasFooter: true
      });
    }
  };

  readyToSubmitTeam = responses => {
    const { submitted } = this.state;

    if (submitted) {
      this.setState({
        feedbackMsge: 'You already submitted!',
        feedbackClass: '',
        buttonAction: this.submitTeamInput,
        buttonTxt: 'Submit',
        hasFooter: true
      });
    } else {
      this.setState({
        selected: responses,
        feedbackMsge: '',
        feedbackClass: '',
        buttonAction: this.submitTeamInput,
        buttonTxt: 'Submit',
        hasFooter: true
      });
    }
  };

  // renders based on activity status
  renderContent = ({ status, pid, activity_id }) => {
    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      // get current state
      const { submitted, selected } = this.state;

      // find quiz for this activity
      const { quiz } = this.props;

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      return (
        <IndividualQuestions
          next={this.readyToNext}
          index={this.state.index}
          questions={quiz.questions}
          responses={selected}
          done={this.readyToSubmitIndv}
        />
      );
    }

    // team formation phase
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
      const { quiz } = this.props;

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      // look for this user's team
      const team = Teams.findOne({ activity_id, 'members.pid': pid });

      // joined after team formation
      if (!team) return 'No team, sorry.';

      return (
        <TeamQuestions
          team={team}
          quiz={quiz}
          pid={pid}
          next={this.readyToNext}
          index={this.state.index}
          questions={quiz.questions}
          responses={selected}
          done={this.readyToSubmitTeam}
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

        return <TeammateSliders team_id={team._id} pid={pid} handleChosen={this.handleChooseTeammate} />;
      }

      // find quiz for this activity
      // console.log("The activity_id for this activity is " + activity_id);
      const { quiz } = this.props;

      // no quiz found
      if (!quiz) return 'No quiz found. Please refresh the page.';

      const { questions } = quiz;

      // get responses, if available
      const responseIndv = Responses.findOne({
        pid,
        activity_id,
        type: 'indv'
      });
      const indvAnswer = responseIndv ? responseIndv.selected : questions.map(() => 'No response');
      // const indvAnswer = responseIndv ? this.getTextFromOpt(responseIndv.selected, quiz.options) : 'No response';

      // get response, if available
      const responseTeam = Responses.findOne({
        pid,
        activity_id,
        type: 'team'
      });
      const teamAnswer = responseTeam ? responseTeam.selected : questions.map(() => 'No response');

      // make boxes content

      const boxes = [
        {
          label: questions[0].prompt,
          text: this.getTextFromOpt(responseIndv.selected[0], questions[0].options)
        },
        {
          text: this.getTextFromOpt(responseTeam.selected[0], questions[0].options)
        },
        {
          label: questions[1].prompt,
          text: this.getTextFromOpt(responseIndv.selected[1], questions[1].options)
        },
        {
          text: this.getTextFromOpt(responseTeam.selected[1], questions[1].options)
        },
        {
          label: questions[2].prompt,
          text: responseIndv.selected[2].text
        },
        {
          text: responseTeam.selected[2].text
        },
        {
          label: questions[3].prompt,
          text: responseIndv.selected[3].text
        },
        {
          text: responseIndv.selected[3].text
        }
      ];

      return <TextBoxes prompt={quiz.prompt} boxes={boxes} />;
    }

    return 'TODO: Status no recognized';
  };

  render() {
    const { activity } = this.props;

    if (!activity) return 'Waiting... QUIZ';

    const { quiz } = this.props;

    if (!quiz) return 'Waiting... QUIZ';

    const { progress, duration, sessionLength, status } = this.props;
    const { statusStartTime } = activity;
    const { index } = this.state;

    let toggle = 1;
    if (status === ActivityEnums.status.SUMMARY || status === ActivityEnums.status.TEAM_FORMATION) {
      toggle = 0;
    }

    const totalQuestions = quiz.questions.length;

    return (
      <Mobile
        activityName="Quiz"
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        questionToggle={toggle}
        questionNumber={index + 1}
        questionsLength={totalQuestions}
        {...this.state}
      >
        {this.renderContent(this.props)}
      </Mobile>
    );
  }
}

// updates component when activity changes
export default withTracker(props => {
  const activity = Activities.findOne(props.activity_id);
  const quiz = Quizzes.findOne({ activity_id: props.activity_id });

  return { activity, quiz };
})(Quiz);
