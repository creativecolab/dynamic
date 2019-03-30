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
    pid: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
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

    // const team =

    // return this user's team to render
    // return team._id;

  } 

  render() {
    if (!this.props.team) return "Forming teams...";
    else return <TeamBox confirm={false} username={this.props.pid} team_id={this.props.team._id}/>
    
    if (!this.state.currentTeam) return <Wrapper>There is an activity in progress.<br/>Please wait for the next one!</Wrapper>;
    if (this.props.allConfirmed) return <Responses />;
    if (this.state.confirmed) return <Wrapper>Share with your team something about yourself that they would not be able to find online</Wrapper>
    else return <TeamBox confirm={this.confirmTeam} username={this.props.username} team_id={this.state.currentTeam}/>
  }
}


// TODO: clean this up
export default withTracker(props => {
  const team = Teams.findOne({
    activity_id: props._id,
    "members.pid": props.pid
  });
  return {team};
})(Icebreaker);