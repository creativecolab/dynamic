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
import Card from '../Components/Card/Card';

class SessionProgress extends Component {
  static propTypes = {
    users: PropTypes.array,
    usersAssessed: PropTypes.number,
    usersTotal: PropTypes.number
  };

  static defaultProps = {
    users: [],
    usersAssessed: 0,
    usersTotal: 0
  };

  state = {
    index: 0
  };

  startSession() {
    if (this.props.session.participants.length < 2) return;

    Meteor.call('sessions.buildTeamHistory', this.props.session.participants, this.props.session._id, (err, res) => {
      if (err) {
        alert(err);
      } else {
        // success!
        console.log('\nBuilt the Team History matrix ');
      }
    });

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
    if (status === ActivityEnums.status.BUILDING_TEAMS)
      return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

    return -1;
  }

  // supplies the text that the BigScreen layout will use
  getContentText(currentActivity) {
    // indv phase
    if (currentActivity.status === ActivityEnums.status.BUILDING_TEAMS) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return [
          'Team Formation',
          'Quiz',
          'Read through the question and select the correct answer or respond accordingly.'
        ];
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ['Team Formation', 'Team Discussion', 'No individual phase!'];
      }
    }

    // team-finding phase. Same across all Activities
    if (currentActivity.status === ActivityEnums.status.TEAM_FORMATION) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ['Begin Activity', 'Find Groups', 'Find others with the same colored shape and introduce yourself.'];
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ['Begin Activity', 'Find Groups', 'Find others with the same colored shape and introduce yourself.'];
      }
    }

    // team phase
    if (currentActivity.status === ActivityEnums.status.INPUT_TEAM) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return [
          'Finish Activity',
          'Quiz',
          'Read through the question and select the correct answer or respond accordingly.'
        ];
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ['Finish Activity', 'Group Discussion', 'Discuss questions with your group members.'];
      }
    }

    // individual input phase
    if (currentActivity.status === ActivityEnums.status.ASSESSMENT) {
      if (currentActivity.name === ActivityEnums.name.QUIZ) {
        return ['Next Activity', 'Quiz', 'Statistics'];
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return ['Next Activity', 'Group Assessment', 'Assess how well you got to know your group members.'];
      }
    }
  }

  // finds the current status that we are on and returns it's start time
  getCurrentStatusStart(currentActivity) {
    const { status } = currentActivity;

    switch (status) {
      case ActivityEnums.status.BUILDING_TEAMS:
        return currentActivity.statusStartTimes.indvPhase;
      case ActivityEnums.status.TEAM_FORMATION:
        return currentActivity.statusStartTimes.teamForm;
      case ActivityEnums.status.INPUT_TEAM:
        return currentActivity.statusStartTimes.teamPhase;
      case ActivityEnums.status.ASSESSMENT:
        return currentActivity.statusStartTimes.peerAssessment;
      default:
        return -1;
    }
  }

  // builds the HTML component that will go inside the BigScreen layout
  renderContentHTML(currentActivity) {
    if (currentActivity.status === ActivityEnums.status.BUILDING_TEAMS) {
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
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return '';
      }
    }

    // team-finding phase. Same across all Activities
    if (currentActivity.status === ActivityEnums.status.TEAM_FORMATION) {
      //big screen layout with TeamShapes as child prop
      return (
        <div className="teamShapes">
          <TeamShapes activity_id={this.props.currentActivity._id} />
        </div>
      );
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
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return <img className="contentPic" src="/discuss-jpg-500.jpg" alt="" />;
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
      } else if (currentActivity.name === ActivityEnums.name.TEAM_DISCUSSION) {
        return (
          <>
            <img className="contentPic" src="/slider-jpg-500.jpg" alt="" />
            <h2>{`${this.props.usersAssessed} out of ${this.props.usersTotal +
              ' participants'} have submitted their responses`}</h2>
          </>
        );
      }
    }
  }

  // render content based on the session progress
  renderLayout() {
    const { session, currentActivity, users } = this.props;

    if (!session) return 'Oh.';

    const numJoined = session.participants.length;

    // session not yet begun, provide details about what will happen.
    if (session.status === 0)
      return (
        <BigScreen
          sessionCode={this.props.session.code}
          hasTimer={false}
          buttonAction={() => this.startSession()}
          buttonText="Begin"
          activityPhase="Prototeams"
          instructions={numJoined + (numJoined === 1 ? ' person has ' : ' people have ') + 'joined'}
        >
          {/* <SessionBegin session_id={this.props.session._id}></SessionBegin> */}
          <section className="how-to-main">
            <div className="how-to-title">
              <div>HOW IT WORKS</div>
            </div>
            <div className="how-to-card-container">
              <Card tag="1" title="Use mobile devices">
                <img src="/phone-jpg-500.jpg" alt="" />
              </Card>
              <Card tag="2" title="Make small groups">
                <img src="/teams-jpg-500.jpg" alt="" />
              </Card>
              <Card tag="3" title="Perform group activities">
                <img src="/discuss-jpg-500.jpg" alt="" />
              </Card>
              <Card tag="4" title="Assess your experience">
                <img src="/slider-jpg-500.jpg" alt="" />
              </Card>
            </div>
          </section>
          <div className="joinees">
            {numJoined !== 0 && (
              <h2>
                {users.filter(u => u.pid === session.participants[numJoined - 1]).length > 0
                  ? users.filter(u => u.pid === session.participants[numJoined - 1])[0].name
                  : 'Someone'}{' '}
                just joined!
              </h2>
            )}
          </div>
        </BigScreen>
      );

    // session started, render instructions for activities
    if (session.status === 1) {
      // no activities
      if (!currentActivity) return <Loading />;

      // get some values to pass as props to the layout
      const duration = this.calculateDuration(currentActivity);
      const contentText = this.getContentText(currentActivity);
      const statusStartTime = this.getCurrentStatusStart(currentActivity);

      return (
        <BigScreen
          sessionCode={session.code}
          hasRound={true}
          sessionRound={session.activities.indexOf(currentActivity._id) + 1}
          sessionNumRounds={session.activities.length}
          hasTimer={duration === -1 ? false : true}
          clockDuration={duration}
          clockStartTime={statusStartTime}
          buttonAction={() => this.advanceActivity()}
          buttonText={contentText[0]}
          activityPhase={contentText[1]}
          instructions={contentText[2]}
        >
          {this.renderContentHTML(currentActivity)}
        </BigScreen>
      );
    }

    // session ended.
    if (session.status === 2) {
      return (
        <BigScreen sessionCode={this.props.session.code} hasTimer={false} hasButton={false}>
          <SessionEnd />
        </BigScreen>
      );
    }
  }

  render() {
    if (!this.props.session) return <Loading />;

    return <div className="session-progress-wrapper">{this.renderLayout()}</div>;
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

  // get the users that may have joined
  const users = Users.find({}).fetch();

  if (!currentActivity) return { session, users, activities, currentActivity };

  const quiz = Quizzes.findOne({ activity_id: currentActivity._id });

  // get the total users that can assess
  const sessionUsers = Users.find({ 'teamHistory.activity_id': currentActivity._id }).fetch();
  let usersTotal = 0;
  for (let i = 0; i < sessionUsers.length; i++) {
    if (session.participants.includes(sessionUsers[i].pid)) usersTotal++;
  }
  // get total users that have assessed
  const usersAssessed = Users.find({ 'preferences.activity_id': currentActivity._id }).count();

  return { session, users, usersAssessed, usersTotal, activities, currentActivity, quiz };
})(SessionProgress);