import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import users from '../../api/users';
import Icebreaker from './Components/Icebreaker/Icebreaker';

class Activity extends Component {
  static propTypes = {
    username:  PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentActivity: this.props.session.activities[0], // id of the running activity
      activityCount: 0,
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

  renderActivity() {

    const { username, session } = this.props;

    const activity = Activities.findOne(this.state.currentActivity); // get the activity we are going to run

    // TODO: maybe...
    // if (activity.status === 1) {
    //   return "Ongoing activity, wait for the next one...";
    // }

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (activity.name === "brainstorm") {
      console.log("Starting brainstorming");

      //allow a confirm box to pop up once all teammates are confirmed...this confirmation with signal that this team is ready
      // this.setState(state => {
      //   activeStudentCount: state.activeStudentCount + 1
      // });

      return <Icebreaker _id={activity._id} username={username} participants={session.participants} />
    }

    else {
      return "Invalid activity"
    }

  }

  // needs a current activity
  render() {
    console.log('render!');
    if (this.props.session.status === 0) {
      return <Wrapper>Waiting for activities...</Wrapper>
    }
    if (this.props.session.status === 2) {
      return <Wrapper>No activites left...</Wrapper>
    }
    return (
      <Wrapper>
        {this.renderActivity()}
      </Wrapper>
    )
  }
}

export default withTracker((props) => {
  const session = Sessions.findOne(props.session_id);
  return {session};
})(Activity);