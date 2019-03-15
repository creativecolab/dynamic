import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor';
import TeamBox from '../TeamBox/TeamBox';
import Wrapper from '../../../Wrapper/Wrapper';
import Teams from '../../../../api/teams';
import Responses from './Components/Responses'
import { withTracker } from 'meteor/react-meteor-data';



class Icebreaker extends Component {
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
  confirmTeam = (team_id) => {
    console.log('Here!!');
    const team = Teams.findOne(team_id, {sort: {timestamp: -1}});

    team.members.forEach(member => {
      if (member.username === this.props.username) {
        member.confirmed = true;
      }
    });

    Teams.update(team_id, {
      $set: {
        members: team.members
      }
    });
    
    this.setState({
      confirmed: true
    });

  }

  renderResponses() {
    return "tbd";
  }

  // creates teams
  formTeams() {

    //TODO: shuffle the participants
    // get snapshot of participants
    const  { participants, _id, username }  = this.props;
    console.log("Participants: " + participants);

    const colors = ['red', 'blue', 'orange', 'black', 'green', 'purple', 'teal', 'olive', 'maroon'];

    // find current activity
    const activity = Activities.findOne(_id);
    
    if (!activity) {
      console.log("Something went wrong!")
      return "";
    }

    // team already created
    if (activity.status === 1) {
      const team = Teams.findOne({
        activity_id: _id,
        "members.username": username
      });

      if (!team) return "";
      return team._id;
    }

    let teams = [];
    let team_id = "";
    let username_index = 0;

    // form teams, teams of 3
    let newTeam =[participants[0]];
    for (let i = 1; i < participants.length; i++) {

      // get this person's index
      // if (participants[i] === username) {
      //   username_index = i;
      // }

      // completed a new team
      if (i % 3 == 0) {

        console.log(newTeam);
        
        team_id = Teams.insert({
          activity_id: _id,
          timestamp: new Date().getTime(),
          members: newTeam.map(name => ({username: name, confirmed: false})),
          color: colors[teams.length], //TODO: change thiss!!
          responses: []
        });

        teams.push(team_id);

        newTeam = [participants[i]];
      }
      
      // add new member to team
      else {
        newTeam.push(participants[i]);
      }
    }

    // last team is of 3 or 2
    if (newTeam.length === 3 || newTeam.length === 2) {
      team_id = Teams.insert({
        activity_id: _id,
        timestamp: new Date().getTime(),
        members: newTeam.map(name => ({username: name, confirmed: false})),
        color: colors[teams.length], // TODO: change this!!
        responses: []
      });

      teams.push(team_id);
    }

    // only 1 participant left, create team of 4
    if (newTeam.length === 1) {
      Teams.update(team_id, {
        $push: {
          members: {username: newTeam[0], confirmed: false}
        }
      });
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

    const team = Teams.findOne({
      activity_id: _id,
      "members.username": username
    });

    // return this user's team to render
    return team._id;

  } 

  render() {
    if (!this.state.currentTeam) return <Wrapper>There is an activity in progress.<br/>Please wait for the next one!</Wrapper>;
    if (this.props.allConfirmed) return <Responses />;
    if (this.state.confirmed) return <Wrapper>Share with your team something about yourself that they would not be able to find online</Wrapper>
    else return <TeamBox confirm={this.confirmTeam} username={this.props.username} team_id={this.state.currentTeam}/>
  }
}


// TODO: clean this up
export default withTracker((props) => {
  const team = Teams.findOne({
    activity_id: props._id,
    "members.username": props.username
  }, {sort: {timestamp: -1}});

  let allConfirmed = true;


  if (!team) return {allConfirmed: false};

  team.members.forEach(member => {
    console.log(member);
    if (member.confirmed == false) allConfirmed = false;
  });

  const { members } = team;
  return {allConfirmed, members};
})(Icebreaker);