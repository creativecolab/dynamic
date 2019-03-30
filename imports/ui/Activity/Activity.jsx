import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
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
      session: Sessions.findOne(session_id),
      username: Users.findOne({pid}).name,
      currentActivity: null, // id of the running activity
    }
  }

  // get data from db
  componentDidMount() {
    console.log('componentDidMount');
    // get current activity from backend
    const currentActivity = Activities.findOne({session_id: this.props.session_id});
    this.setState({
      currentActivity
    });
  }

 

  renderActivity() {

    const { pid, currentActivity } = this.props;

    if (!currentActivity) return <div>Waiting for activities...<img id="moving-logo" src="./dynamic.gif" className="center"/></div>

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (currentActivity.name === "brainstorm") {
      console.log("Starting brainstorming");
      return <Icebreaker _id={currentActivity._id} pid={pid} />
    }

    else {
      return "Invalid activity"
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

  // needs a current activity
  render() {
    console.log('render! [Activity]');
    // return <div>{this.prettyPrint()}</div>
    // if (this.props.session.status === 0) {
    //   return <Wrapper>Waiting for activities...
    //     <img id="moving-logo" src="./dynamic.gif" class="center"/>
    //   </Wrapper>
    // }
    // if (this.props.session.status === 2) {
    //   return <Wrapper>No activites left...</Wrapper>
    // }
    return (
      <Wrapper>
        {this.renderActivity()}
      </Wrapper>
    )
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
  const currentActivity = Activities.findOne({session_id, status: 1});
  return {currentActivity}
})(Activity);