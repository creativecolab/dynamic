import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import users from '../../api/users';

class Activity extends Component {
  static propTypes = {
    username:  PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTeam: [],
      currentActivity: this.props.session.activities[0], // id of the running activity
    }
  }

  
  // if necessary for the activity...
  // TODO: before this, pop an activity from the session!
  formTeams() {

    //TODO: shuffle the participants
    // get snapshot of participants
    const  { participants }  = this.props.session;
    console.log("Participants: " + participants);

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
    Activities.update(this.state.currentActivity, {
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
    const usersTeam = teams.filter(team => team.members.includes(this.props.username))[0];

    // keep current team on state
    this.setState({
      currentTeam: usersTeam,
    });

    console.log("The user's team is: " + this.state.currentTeam);

  } 

  renderActivity() {

    const { username } = this.props;

    const activityToStart = Activities.findOne(this.state.currentActivity); // get the activity we are going to run

    //this.formTeams(); // set up the teams for this activity (in case it needs them)

    //TODO: consider adding a boolean to activity
    // e.g., requires_team
    if (activityToStart.name === "brainstorm") {
      console.log("Starting brainstorming");
      const team = this.state.currentTeam;
      console.log(this.state.currentTeam);
      //allow a confirm box to pop up once all teammates are confirmed...this confirmation with signal that this team is ready
      return <TeamBox username={username} team={team} />
    }

    else {
      return "Invalid activity"
    }

  }

  componentWillMount() {
    if (this.props.session.status == 1) this.formTeams();
    if (this.state.currentTeam) console.log('Ready');
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
  // const { session_id } = props;
  // const nextActivity = Activities.findOne({session_id, status: 0});
  // const currentActivity = Activities.findOne({session_id, status: 1});
  
  const session = Sessions.findOne(props.session_id);

  // const { teams } = currentActivity;
  // const myTeam = teams.filter(team => team.members.includes(props.username))[0];
  return {session};
})(Activity);