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
      currentActivity: this.props.session.activities[0] // id of the running activity
    }
  }

  renderActivity() {

    const { username, session } = this.props;

    const activity = Activities.findOne(this.state.currentActivity); // get the activity we are going to run

    //this.formTeams(); // set up the teams for this activity (in case it needs them)

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (activity.name === "brainstorm") {
      console.log("Starting brainstorming");

      //allow a confirm box to pop up once all teammates are confirmed...this confirmation with signal that this team is ready
      return <Icebreaker _id={activity._id} username={username} participants={session.participants} />
    }

    else {
      return "Invalid activity"
    }

  }

  // needs a current activity
  render() {
    console.log('render!');
    console.log(this.props.session);
    if (!this.props.session.status) {
      return <Wrapper>Waiting for activities...</Wrapper>
    }
    if (this.props.session.status == 2) {
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