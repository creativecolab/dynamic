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

import BigScreen from '../Layouts/BigScreen/BigScreen';

import Loading from '../Components/Loading/Loading';
import SessionEnd from './Components/SessionEnd';
import TeamShapes from './Components/TeamShapes';
import StatsPage from './Components/StatsPage';

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
    Logs.insert({
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

  // supplies the text that the BigScreen layout will use
  getContentText(currentActivity) {
    // indv phase
    if (currentActivity.status === ActivityEnums.status.INPUT_INDV) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ["Team Formation", "Quiz", "Read through the question and select the correct answer or respond accordingly."];
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ["Team Formation", "Team Discussion", "No individual phase!"];
      }
    }

    // team-finding phase. Same across all Activities
    if (currentActivity.status === ActivityEnums.status.TEAM_FORMATION) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ["Begin Activity", "Form Groups", "Find others with the same colored shape and introduce yourself."];
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ["Begin Activity", "Form Groups", "Find others with the same colored shape and introduce yourself."];
      }
    }

    // team phase 
    if (currentActivity.status === ActivityEnums.status.INPUT_TEAM) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ["Finish Activity", "Quiz", "Read through the question and select the correct answer or respond accordingly."];
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        console.log(currentActivity);
        return ["Finish Activity", "Team Discussion", "Answer icebreaker questions within your group."];
      }
    }

    // individual input phase 
    if (currentActivity.status === ActivityEnums.status.ASSESSMENT) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ["Next Activity", "Quiz", "Statistics"];
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ["Next Activity", "Member Preferences", "Reflect on the activity and rate your group member preferences."];
      }
    }
  }

  // finds the current status that we are on and returns it's start time
  getCurrentStatusStart(currentActivity) {

    const { status } = currentActivity

    switch (status) {
      case ActivityEnums.status.INPUT_INDV:
        return currentActivity.statusStartTimes.indvPhase;
      case ActivityEnums.status.TEAM_FORMATION:
        return currentActivity.statusStartTimes.teamForm;
      case ActivityEnums.status.INPUT_TEAM:
        return currentActivity.statusStartTimes.teamPhase;
      case ActivityEnums.status.ASSESSMENT:
        return currentActivity.statusStartTimes.peerAssessment;
      default:
        return -1
    }
  }

  // builds the HTML component that will go inside the BigScreen layout
  renderContentHTML(currentActivity) {
    if (currentActivity.status === ActivityEnums.status.INPUT_INDV) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return (
          <div className="text-box-bigscreen">
            {this.props.quiz.questions.map((q, index) => (
              <h2 key={Random.id()}>
                <div id="font-size">{`Q${index + 1}: ${q.prompt}`}</div>
              </h2>
            ))}
          </div>
        );
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return '';
      }

    }
    // team-finding phase. Same across all Activities
    if (currentActivity.status === ActivityEnums.status.TEAM_FORMATION) {
      //big screen layout with TeamShapes as child prop
      return <div className="teamShapes"><TeamShapes skip={this.advanceActivity} activity_id={this.props.currentActivity._id} /></div>;
    }

    // team phase 
    if (currentActivity.status === ActivityEnums.status.INPUT_TEAM) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return (
          <div className="text-box-bigscreen">
            {this.props.quiz.questions.map((q, index) => (
              <h2 key={Random.id()}>
                <div id="font-size">{`Q${index + 1}: ${q.prompt}`}</div>
              </h2>
            ))}
          </div>
        );
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return <img className="ratingPic" src="/discussion.png" alt="" />
      }
    }

    // individual input phase 
    if (currentActivity.status === ActivityEnums.status.ASSESSMENT) {
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
      }
      else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return <img className="ratingPic" src="/rating.png" alt="" />
      }
    }
  }

  // sets up the layout for the BigScreen
  renderLayout(currentActivity) {

    const duration = this.calculateDuration(currentActivity);

    const contentText = this.getContentText(currentActivity);

    const statusStartTime = this.getCurrentStatusStart(currentActivity);

    return (
      <BigScreen
        sessionCode={this.props.session.code}
        hasTimer={duration === -1 ? false : true}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        buttonAction={this.advanceActivity}
        buttonText={contentText[0]}
        activityPhase={contentText[1]}
        instructions={contentText[2]}
      >
        {this.renderContentHTML(currentActivity)}
      </BigScreen>
    );

  }

  // render content based on the session progress
  renderInfo() {
    const { session } = this.props;

    if (!session) return 'Oh.';

    const numJoined = session.participants.length;


    // session not yet begun, provide details about what will happen. TODO: Make this fit in BigScreen layout
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

    // session ended. TODO: Make this fit in BigScreen layout!
    if (session.status === 2) return <SessionEnd />;

    // no activities
    if (!this.props.currentActivity) return <Loading />;

    // session started, render instructions for activities
    if (session.status === 1) return this.renderLayout(this.props.currentActivity);
  }


  render() {
    if (!this.props.session) return <Loading />;

    return <div className="session-progress-wrapper">{this.renderInfo()}</div>;
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
