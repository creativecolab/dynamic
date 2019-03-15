import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TeamBox from '../TeamBox/TeamBox';
import Wrapper from '../../../Wrapper/Wrapper';

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
    if (!this.state.currentTeam) return "";
    if (this.state.confirmed) return <Wrapper>You found all your teammates!</Wrapper>
    else return <TeamBox confirm={this.confirmTeam} username={this.props.username} team={this.state.currentTeam}/>
  }
}
