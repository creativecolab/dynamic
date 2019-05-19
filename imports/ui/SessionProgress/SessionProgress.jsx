import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '../Wrapper/Wrapper';
import Clock from '../Clock/Clock';

import './SessionProgress.scss';
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Logs from '../../api/logs';

import ActivityEnums from '/imports/enums/activities';

import SessionEnd from './Components/SessionEnd';
import TeamShapes from './Components/TeamShapes';
import StatsPage from './Components/StatsPage';
import Loading from '../Components/Loading/Loading';
import Quizzes from '../../api/quizzes';

class SessionProgress extends Component {
  static propTypes = {
    //code: PropTypes.string.isRequired,
  };

  mapActivities() {
    const { activities } = this.props;

    if (!activities) return '';

    return activities
      .filter(act => act.status < 3)
      .map(act => {
        return <li key={act._id}>{act.name}</li>;
      });
  }

  edit() {
    window.location = '/' + this.props.match.params.code + '/edit';
  }

  startSession() {
    if (this.props.session.participants.length < 2) return;

    Sessions.update(this.props.session._id, {
      $set: {
        status: 1,
        round: 1,
        startTime: new Date().getTime()
      }
    });

    //track the session that a session had started
    const new_log = Logs.insert({
      log_type: 'Session Started',
      code: this.props.match.params.code,
      timestamp: new Date().getTime()
    });

    console.log(new_log);
  }

  // advance the status of the activity
  advanceActivity = () => {
    // get the current status, increment if possible
    const currStatus = this.props.currentActivity.status;

    console.log('Status of activity ' + this.props.currentActivity.name + 'is ' + currStatus);

    if (currStatus + 1 != 6) {
      console.log('Activity status of ' + this.props.currentActivity.name + ' advanced to ' + (currStatus + 1));

      // to fix clock, first set statusStartTime, then status!
      Activities.update(
        this.props.currentActivity._id,
        {
          $set: { statusStartTime: new Date().getTime() }
        },
        () => {
          Activities.update(this.props.currentActivity._id, {
            $set: { status: currStatus + 1 }
          });
        }
      );
    } else {
      console.log('Can no longer advance the status of ' + this.props.currentActivity.name);
    }
  };

  // startNextActivity = () => {
  //   Activities.update(this.props.currentActivity._id, {
  //     $set: {
  //       status: 5,
  //       endTime: new Date().getTime()
  //     }
  //   });
  // }

  // set duration based on activity status and session progress
  calculateDuration(activity) {
    // get activity status
    const { status, index } = activity;

    // get durations
    const { durationIndv, durationOffsetIndv } = activity;
    const { durationTeam, durationOffsetTeam } = activity;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
      return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

    return -1;
  }

  renderClock() {
    const { currentActivity } = this.props;

    const duration = this.calculateDuration(currentActivity);

    // console.log("Start time: " + currentActivity.startTime);
    return <Clock startTime={this.props.currentActivity.statusStartTime} big totalTime={duration} />;
  }

  // instructions for activities
  getInstructions(status) {
    const { currentActivity } = this.props;

    if (!currentActivity) return 'No activity';

    const quiz = Quizzes.findOne({ activity_id: currentActivity._id });

    if (!quiz) return 'No Quiz';

    // input phase
    if (status === 1) {
      return (
        <div className="outer">
          <div className="inner">
            {this.renderClock()}
            <h1>Round {this.props.session.round}: Quiz</h1>
            {/* <div id="font-size">Round {this.props.session.round}: 2 Truths and 1 Lie</div>
          <br></br>
          <h2>Instructions:</h2>
          <div className="text-box-bigscreen">
            <h2>Write TWO interesting truths and ONE lie about yourself!</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>The goal is to make it hard for people to guess which is the lie.</h2>
          </div><br></br><br></br> */}
            <div id="font-size">Individual Response</div>
            <br />
            <div className="text-box-bigscreen">
              <h2>
                Question 1: <h2 id="font-size">{quiz.prompt}</h2>
              </h2>
              <br />
              <h2>Question 2: {quiz.prompt}</h2>
            </div>
            <br />
            <h2 id="bold-font">Instructions:</h2>
            <div className="text-box-bigscreen">
              <h2 id="font-size">Read through the question and select the correct answer or respond accordingly.</h2>
            </div>
          </div>
        </div>
      );
    }

    // team-finding phase
    if (status === 2) {
      return <TeamShapes skip={this.advanceActivity} activity_id={this.props.currentActivity._id} />;
    }

    // group discussion, 2T1L!
    if (status === 3) {
      return (
        <div className="outer">
          <div className="inner">
            {this.renderClock()}
            <h1>Round {this.props.session.round}: Quiz</h1>
            {/* <div id="font-size">1 Person is in the hotseat</div>
          <br></br>
          <h2>Instructions:</h2>
          <div className="text-box-bigscreen">
            <h2>Select which of the 3 statements is the lie.</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>When everyone has guessed, you'll be able to see who was right.</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>Then continue to the next person in the hotseat.</h2>
          </div><br></br><br></br> */}
            <div id="font-size">Team Response</div>
            <br />
            <div className="text-box-bigscreen">
              <h2>Question 1: {quiz.prompt}</h2>
              <br />
              <h2>Question 2: {quiz.prompt}</h2>
            </div>
            <br />
            <h2 id="bold-font">Instructions:</h2>
            <div className="text-box-bigscreen">
              <h2>Read through the question and select the correct answer or respond accordingly.</h2>
            </div>
          </div>
        </div>
      );
    }

    // activity completed
    if (status === 4) {
      return <StatsPage session_id={this.props.session._id} activity_id={currentActivity._id} />;
    }
  }

  renderInfo() {
    const { session } = this.props;

    if (!session) return 'Oh.';

    const numJoined = session.participants.length;

    // session not yet begun, provide details about what will happen
    if (session.status === 0)
      return (
        <div className="outer">
          <div className="inner">
            <h1 id="header">Dynamic</h1>
            <h2>Enter url:</h2>
            <div className="text-box-bigscreen">
              <c>http://sodynamic.herokuapp.com</c>
            </div>
            <h2>Session code:</h2>
            <div className="text-box-bigscreen">
              <c>{this.props.match.params.code.toUpperCase()}</c>
            </div>
            <div id="spacing">
              <c>{numJoined}</c>
              <br />
              {numJoined === 1 ? ' person has ' : ' people have '} joined
            </div>
            <button className="bigscreen-button" onClick={() => this.startSession()}>
              Begin
            </button>
          </div>
        </div>
      );

    // session ended
    if (session.status === 2) return <SessionEnd />;

    // no activities
    if (!this.props.currentActivity) return 'You should add activities';

    // session started, render instructions for activities
    if (session.status === 1)
      return (
        <div className="outer">
          <div className="inner">
            {/* <div>{this.props.currentActivity.name}</div> */}
            {this.getInstructions(this.props.currentActivity.status)}
            {/* <div>Session code: {this.props.match.params.code}</div> */}
            {/* TODO maybe add session code an url */}
            <button className="bigscreen-button" onClick={() => this.advanceActivity(this.props.currentActivity)}>
              Skip to activity
            </button>
          </div>
        </div>
      );
  }

  render() {
    if (!this.props.session) return <Loading />;

    return (
      <div>
        <div id="inner">{this.renderInfo()}</div>
      </div>
    );
  }
}

export default withTracker(props => {
  const { code } = props.match.params;
  const session = Sessions.findOne({ code });

  if (!session) return {};

  const activities = Activities.find({ session_id: session._id }).fetch();
  const currentActivity = Activities.findOne(
    { session_id: session._id, status: { $in: [1, 2, 3, 4] } },
    { sort: { status: 1 } }
  );

  return { session, activities, currentActivity };
})(SessionProgress);
