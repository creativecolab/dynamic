import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TeamBox from '../TeamBox/TeamBox';
import Wrapper from '../../../Wrapper/Wrapper';
import Teams from '../../../../api/teams';

export default class Icebreaker extends Component {
  static propTypes = {
    _id: PropTypes.string.isRequired,
    username: PropTypes.string.isRequired,
    participants: PropTypes.array.isRequired
    // endActivity: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      currentTeam: this.formTeams(),
      confirmed: false
    }
  }

  // called when a team is formed
  confirmTeam = () => {
    console.log('Here!!');
    this.setState({
      confirmed: true
    });
  }

  // creates teams
  formTeams() {

    //TODO: shuffle the participants
    // get snapshot of participants
    const  { participants, _id }  = this.props;
    console.log("Participants: " + participants);

    const activity = Activities.findOne(_id);
    
    if (!activity) {
      console.log("Something went wrong!")
      return {};
    }

    // team already created
    if (activity.status === 1) {
      return activity.teams.filter(team => team.members.includes(this.props.username))[0];
    }

    let teams = [];

    // form teams, teams of 3
    let newTeam = {confirmed: false, members: [participants[0]]};
    for (let i = 1; i < participants.length; i++) {

      // completed a new team
      if (i % 3 == 0) {
        teams.push(newTeam);

        // team_id = Teams.insert({
        //   activity_id: _id,
        //   members: newTeam.members.map(member => ({username: member, confirmed: false}))
        // });

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

    // start and update activity on database
    Activities.update(_id, {
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
    return teams.filter(team => team.members.includes(this.props.username))[0];

  } 

  render() {
    if (!this.state.currentTeam) return <Wrapper>There is an activity in progress.<br/>Please wait for the next one!</Wrapper>;
    if (this.state.confirmed) return <Wrapper>You found all your teammates!</Wrapper>
    else return <TeamBox confirm={this.confirmTeam} username={this.props.username} team={this.state.currentTeam}/>
  }
}
