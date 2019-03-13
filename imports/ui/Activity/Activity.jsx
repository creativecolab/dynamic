import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';

class Activity extends Component {
  static propTypes = {
    participants: PropTypes.array.isRequired,
    username:  PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTeam: []
    }
  }

  // if necessary for the activity...
  // TODO: before this, pop an activity from the session!
  formTeams() {

    // get snapshot of participants
    const { participants, nextActivity } = this.props;

    let teams = [];

    // form teams, teams of 3
    let newTeam = {confirmed: false, members: [participants[0]]};
    for (let i = 1; i < participants.length; i++) {

      // completed a new team
      if (i % 3 == 0) {
        teams.push(newTeam);
        newTeam = {confirmed: false, members: [participants[i]]};
      }
      
      // add new member to team
      else {
        newTeam.members.push(participants[i]);
      }
    }

    // last team is of 3 or 2
    if (newTeam.members.length === 3 || newTeam.members.length === 2) {
      teams.push(newTeam);
    }


    // only 1 participant left, create team of 4
    if (newTeam.members.length === 1) {
      teams[teams.length - 1].members.push(newTeam.members[0]);
    }

    console.log(teams);

    // start and update activity on database
    Activities.update(nextActivity._id, {
      $set: {
        teams,
        status: 1
      }
    }, (error) => {
      if (!error) {
        console.log('Teams created!');
      } else {
        console.log(error);
      }
    });


    // return this user's team to render
    const currentTeam = teams.filter(team => team.members.includes(this.props.username))[0];
    console.log(currentTeam);

    // keep current team on state
    this.setState({
      currentTeam
    });


    
  }

  renderActivity() {

    const { currentActivity, username } = this.props;

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (currentActivity.name === "brainstorm") {
      const team = this.state.currentTeam;
      //allow a confirm box to pop up once all teammates are confirmed...this confirmation with signal that this team is ready
      return <TeamBox username={username} team={team} />
    }

    else {
      return "Invalid activity"
    }

  }

  componentWillMount() {
    if (this.props.nextActivity) this.formTeams();
    if (this.state.currentTeam) console.log('Ready');
  }

  // needs a current activity
  render() {
    console.log('render!');
    if (!this.props.currentActivity) {
      return <Wrapper>No activities left...</Wrapper>
    }
    return (
      <Wrapper>
        {this.renderActivity()}
      </Wrapper>
    )
  }
}

export default withTracker((props) => {
  const { session_id } = props;
  const nextActivity = Activities.findOne({session_id, status: 0});
  const currentActivity = Activities.findOne({session_id, status: 1});
  
  // const { teams } = currentActivity;
  // const myTeam = teams.filter(team => team.members.includes(props.username))[0];
  return {currentActivity, nextActivity};
})(Activity);