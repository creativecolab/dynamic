import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';

import Clock from '../Clock/Clock';
import Icebreaker from './Components/Icebreaker/Icebreaker';
import OnboardingInstructions from './Components/OnboardingInstructions/OnboardingInstructions';

import './Activity.scss';

class Activity extends Component {

  static propTypes = {
    pid: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    console.log('CONSTRUCTOR [ACTIVITY]');
    const { pid, session_id } = props;
    this.state = {
      username: Users.findOne({pid}).name,
      currentActivity: null, // id of the running activity
    }
  }

  prettyPrint() {
    if (!this.props.currentActivity) return "No active activity yet.";
    return <div>
      <b>{this.state.username}</b>
      <div>_id: {this.props.currentActivity._id}</div>
      <div>name: {this.props.currentActivity.name}</div>
      <div>status: {this.props.currentActivity.status}</div>
      <div>session_id: {this.props.currentActivity.session_id}</div>
      <div>created: {(new Date().getTime() - this.props.currentActivity.timestamp) / 1000} secs ago</div>
      <div>teams: {this.props.currentActivity.teams.map(team => <div>{team}</div>)}</div>
    </div>
  }

  renderClock() {
    const { currentActivity, currentSession } = this.props;
    let totalTime = 0;
    if (currentActivity.status === 1) {
      // collect input, 120 seconds on the first round, 60 seconds on following rounds
      totalTime = 120;
      currentSession.activities.map((act, index) => {
        if (act === currentActivity._id) {
          // if we're doing Icebreaker, and the we're not on the first one, give less time
          if (currentActivity.name === 'Icebreaker' && index != 0) totalTime = 60;
        }
      });
    } else if (currentActivity.status === 3) {
      totalTime = 120;
    } else {
      return "";
    }
    // console.log("Start time: " + currentActivity.startTime);
    return <Clock startTime={this.props.currentActivity.startTime} totalTime={totalTime}/>
  }

  // needs a current activity
  render() {

    const { pid, currentActivity } = this.props;

    if (!currentActivity) return <OnboardingInstructions />

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (currentActivity.name === "Icebreaker") {
      return (
        <div>
          {this.renderClock()}
          <Icebreaker _id={currentActivity._id} pid={pid} />
        </div>
      )
    } else {
      return "Something went wrong. Invalid activity."
    }
  }

}

export default withTracker(props => {
  const session_id = props.session_id;
  const currentSession = Sessions.findOne(session_id);
  const currentActivity = Activities.findOne({session_id, status: { $in: [1, 2, 3, 4] }}, { sort: { status: 1 }});
  return {currentActivity, currentSession}
})(Activity);