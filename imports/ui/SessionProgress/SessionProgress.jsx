import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Random } from 'meteor/random';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Logs from '../../api/logs';
import Quizzes from '../../api/quizzes';

import ActivityEnums from '/imports/enums/activities';

import SessionEnd from './Components/SessionEnd';
import TeamShapes from './Components/TeamShapes';
import StatsPage from './Components/StatsPage';
import Loading from '../Components/Loading/Loading';
import Wrapper from '../Wrapper/Wrapper';
import Clock from '../Clock/Clock';

import './SessionProgress.scss';

class SessionProgress extends Component {
  static propTypes = {
    //code: PropTypes.string.isRequired,
  };

  state = {
    index: 0
  };

  startSession() {
    if (this.props.session.participants.length < 2) return;

    Sessions.update(this.props.session._id, {
      $set: {
        status: 1,
        startTime: new Date().getTime()
      }
    });

    //track the session bv a session had started
    const new_log = Logs.insert({
      log_type: 'Session Started',
      code: this.props.match.params.code,
      timestamp: new Date().getTime()
    });
  }

  // advance the status of the activity
  advanceActivity = () => {
    // get the current status, increment if possible
    const currStatus = this.props.currentActivity.status;

    console.log('Status of activity ' + this.props.currentActivity.name + 'is ' + currStatus);

    if (currStatus + 1 != 6) {
      console.log('Activity status of ' + this.props.currentActivity.name + ' advanced to ' + (currStatus + 1));

      Meteor.call('activities.updateStatus', this.props.currentActivity._id, (err, res) => {
        if (err) {
          alert(err);
        } else {
          // success!
          console.log('Starting Activity Status ' + res);
        }
      });
    } else {
      console.log('Can no longer advance the status of ' + this.props.currentActivity.name);
    }
  };

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

  renderClock(status) {
    const { currentActivity } = this.props;

    const duration = this.calculateDuration(currentActivity);

    // console.log("Start time: " + currentActivity.startTime);
    if (status === ActivityEnums.status.INPUT_INDV) {
      return <Clock startTime={this.props.currentActivity.statusStartTimes.indvPhase} big totalTime={duration} />;
    } else if (status === ActivityEnums.status.INPUT_TEAM) {
      return <Clock startTime={this.props.currentActivity.statusStartTimes.teamPhase} big totalTime={duration} />;
    }
  }

  // instructions/content for activities
  getInstructions(status) {
    const { currentActivity } = this.props;

    if (!currentActivity) return 'No activity';

    // individual phase
    if (status === ActivityEnums.status.INPUT_INDV) {
      if (currentActivity.name === ActivityEnums.name.quiz) {
        const quiz = Quizzes.findOne({ activity_id: currentActivity._id });

        if (!quiz) return 'No Quiz';

        return (
          <div>
            {this.renderClock(status)}
            <h1>Quiz</h1>
            <div id="font-size">Individual Response</div>
            <div className="text-box-bigscreen">
              {this.props.quiz.questions.map((q, index) => (
                <h2 key={Random.id()}>
                  <div id="font-size">{`Q${index + 1}: ${q.prompt}`}</div>
                </h2>
              ))}
            </div>
            <br />
            <div id="font-size">Instructions</div>
            <div className="text-box-bigscreen">
              <h2 id="font-size">Read through the question and select the correct answer or respond accordingly.</h2>
            </div>
            <br />
            <button
              className="bigscreen-button"
              id="here"
              onClick={() => this.advanceActivity(this.props.currentActivity)}
            >
              Team Formation
            </button>
          </div>
        );
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return (
          <div>
            {this.renderClock(status)}
            <h1>Team Discussion</h1>
            <div id="font-size">Individual Input</div>
            <br />
            <div id="font-size">Instructions</div>
            <div className="text-box-bigscreen">
              <h2 id="font-size">There is no individual round here.</h2>
            </div>
            <br />
            {/* TODO: change this to button component */}
            <button
              className="bigscreen-button"
              id="here"
              onClick={() => this.advanceActivity(this.props.currentActivity)}
            >
              Move on to Team Formation
            </button>
          </div>
        );
      }
    }

    // team-finding phase. Same across all Activities
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      return <TeamShapes skip={this.advanceActivity} activity_id={this.props.currentActivity._id} />;
    }

    // team phase for the activity
    if (status === ActivityEnums.status.INPUT_TEAM) {
      if (currentActivity.name === ActivityEnums.name.quiz) {
        const quiz = Quizzes.findOne({ activity_id: currentActivity._id });

        if (!quiz) return 'No Quiz';

        return (
          <div>
            {this.renderClock(status)}
            {/* <h1>Round {this.props.session.round}: Quiz</h1> */}
            <h1>Quiz</h1>
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
            <div className="text-box-bigscreen">
              {this.props.quiz.questions.map((q, index) => (
                <h2 key={Random.id()}>
                  <div id="font-size">{`Q${index + 1}: ${q.prompt}`}</div>
                </h2>
              ))}
              {/* <h2>
                  Q1: <div id="font-size">{quiz.prompt}</div>
                </h2>
                <h2>
                  Q2: <div id="font-size">{quiz.prompt}</div>
                </h2>
                <h2>
                  Q3: <div id="font-size">{quiz.prompt}</div>
                </h2>
                <h2>
                  Q4: <div id="font-size">{quiz.prompt}</div>
                </h2> */}
            </div>
            <br />
            <div id="font-size">Instructions</div>
            <div className="text-box-bigscreen">
              <h2 id="font-size">Read through the question and select the correct answer or respond accordingly.</h2>
            </div>
            <br />
            <button
              className="bigscreen-button"
              id="here"
              onClick={() => this.advanceActivity(this.props.currentActivity)}
            >
              Summary
            </button>
          </div>
        );
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return (
          <div>
            {this.renderClock(status)}
            <h1>Team Discussion</h1>

            <img className="ratingPic" src="/discussion.png" alt="" />
            <br />
            <div id="font-size">Instructions:</div>
            <div className="text-box-bigscreen2">
              <h2 id="font-size">Answer icebreaker questions within your group.</h2>
            </div>
            <br />
            {/* TODO: change this to button component */}
            <button
              className="bigscreen-button"
              id="here"
              onClick={() => this.advanceActivity(this.props.currentActivity)}
            >
              Finish Activity
            </button>
          </div>
        );
      }
    }

    // activity completed
    if (status === ActivityEnums.status.ASSESSMENT) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return (
          <StatsPage
            index={this.state.index}
            quiz={this.props.quiz}
            session_id={this.props.session._id}
            activity_id={currentActivity._id}
            end={() => this.advanceActivity(this.props.currentActivity)}
          />
        );
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return (
          <div>
            <h1>Member Preferences</h1>
            <img className="ratingPic" src="/rating.png" alt="" />
            <br />
            <h2 id="font-size"> Reflect on the activity and rate your group member preferences.</h2>

            <div>
              <button
                className="bigscreen-button"
                id="here"
                onClick={() => this.advanceActivity(this.props.currentActivity)}
              >
                Next Round
              </button>
            </div>
          </div>
        );
      }
    }
  }

  // render content based on the session progress
  renderInfo() {
    const { session } = this.props;

    if (!session) return 'Oh.';

    const numJoined = session.participants.length;

    // session not yet begun, provide details about what will happen
    if (session.status === 0)
      return (
        <div className="outer">
          <img id="small-logo" src="https://i.postimg.cc/t462TbY7/dynamic.png" alt="" />
          <div className="inner">
            <h1 id="header">ProtoTeams</h1>

            <h2>In your browser, type the URL:</h2>
            <div className="text-box-bigscreen">
              <c>prototeams.com</c>
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
    if (!this.props.currentActivity) return 'You should add activities chief';

    // // TODO: handle case where there is no quiz
    // if (session.status === 1 && this.props.currentActivity.status === 4)
    //   return (
    //     <StatsPage
    //       index={this.state.index}
    //       quiz={this.props.quiz}
    //       session_id={this.props.session._id}
    //       activity_id={this.props.currentActivity._id}
    //       end={() => this.advanceActivity(this.props.currentActivity)}
    //     />
    //   );

    // session started, render instructions for activities
    if (session.status === 1)
      return (
        <>
          <div className="session-code-container">
            <div>
              <b>URL</b>: prototeams.com
            </div>
            <div>
              <b>CODE</b>: FHY78
            </div>
          </div>
          <div className="outer">
            <div className="inner">{this.getInstructions(this.props.currentActivity.status)}</div>
          </div>
        </>
      );
  }

  render() {
    if (!this.props.session) return <Loading />;

    return <div className="session-progress-wrapper">

      {this.renderInfo()}
    </div>;
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

  if (!currentActivity) return { session, activities, currentActivity };

  const quiz = Quizzes.findOne({ activity_id: currentActivity._id });

  return { session, activities, currentActivity, quiz };
})(SessionProgress);
