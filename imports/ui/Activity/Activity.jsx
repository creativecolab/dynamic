import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Clock from '../Clock/Clock';
import Icebreaker from './Components/Icebreaker/Icebreaker';
import './Activity.scss';

class Activity extends Component {

  static propTypes = {
    pid: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    const { pid, session_id } = props;
    this.state = {
      timeLeft: 0,
      session: Sessions.findOne(session_id),
      username: Users.findOne({pid}).name,
      currentActivity: null, // id of the running activity
    }
  }

  // will run when currentActivity is available
  componentDidUpdate(prevProps) {
    if (!prevProps.currentActivity && this.props.currentActivity) {
      const { currentActivity } = this.props;
      this.setState({
        timeLeft: 60 - parseInt(Math.abs(currentActivity.startTime - new Date().getTime()) / 1000)
      }, () => {
        this.timerID = setInterval(
          () => this.tick(),
          1000
        );
      });
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

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  tick() {
    if (this.state.timeLeft <= 0) {
      Activities.update(this.props.currentActivity._id, {
        $set: {
          status: 2
        }
      });
      this.setState({
        timeLeft: 60
      });
      return;
    };
    this.setState({
      timeLeft: this.state.timeLeft - 1
    });
  }

  // needs a current activity
  render() {

    const { pid, currentActivity } = this.props;

    if (!currentActivity) return <Wrapper>Waiting for activities...<img id="moving-logo" src="./dynamic.gif" className="center"/></Wrapper>

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (currentActivity.name === "brainstorm") {
      return (
        <Wrapper>
          {this.state.timeLeft > 0 && <Clock timeLeft={this.state.timeLeft}/>}
          <Icebreaker _id={currentActivity._id} pid={pid} />
        </Wrapper>
      )
    } else {
      return "Something went wrong. Invalid activity."
    }
  }

  endActivity() {
    // end and update activity on database
    Activities.update(this.state.currentActivity, {
      $set: {
        teams,
        status: 2
      }
    }, (error) => {
      if (!error) {
        console.log('Activity Ended!');
      } else {
        console.log(error);
      }
    });

    // keep count if we are doing more activities than there are planned
    const nextActivityIndex = this.state.activityCount + 1;
    if (nextActivityIndex != this.props.session.activities.length) { // pick next activity, set states and update database
      nextActivity = this.props.session.activities[nextActivityIndex]
      this.setState({
        currentActivity: nextActivity, // id of the next running activity
        activityNumber: nextActivityIndex, // update the activity count
      });
    } else { // no more activites left, set states and update database
        this.setState({
            currentActivity: "",
            activityNumber: -1,
        });
        // end and update the Session on database
        Sessions.update(this.props.session_id, {
          $set: {
            status: 2
          }
        }, (error) => {
          if (!error) {
            console.log('Session ended!');
          } else {
            console.log(error);
          }
        });
    }
  }

}

export default withTracker(props => {
  const session_id = props.session_id;
  const currentActivity = Activities.findOne({session_id, status: { $in: [1, 2] }}, { sort: { status: 1 }});
  return {currentActivity}
})(Activity);