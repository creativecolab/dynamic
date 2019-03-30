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
    console.log('CONSTRUCTOR');
    this.state = {
      confirmed: false
    }
  }

  // called when a team is formed
  confirmTeam = () => {
    console.log('Here!!');

    let updatedTeam = this.props.team;

    updatedTeam.members.forEach(member => {
      if (member.pid === this.props.pid) {
        member.confirmed = true;
      }
    });

    Teams.update(this.props.team._id, {
      $set: {
        members: updatedTeam.members
      }
    });
    
    this.setState({
      confirmed: true
    });

  }

  renderResponses() {
    return "tbd";
  }

  render() {
    if (!this.props.team) return "You have not been assigned a team for this activity.";
    if (this.props.allConfirmed) return "Everyone confirmed! Great :)";
    if (this.state.confirmed) return "Great, you found everyone! Now wait for your teammates to find you.";
    return <TeamBox confirm={this.confirmTeam} pid={this.props.pid} team_id={this.props.team._id}/>
    
    if (!this.state.currentTeam) return <Wrapper>There is an activity in progress.<br/>Please wait for the next one!</Wrapper>;
    if (this.props.allConfirmed) return <Responses />;
    else return <TeamBox confirm={this.confirmTeam} username={this.props.username} team_id={this.state.currentTeam}/>
  }
}


// TODO: clean this up
export default withTracker(props => {
  const team = Teams.findOne({
    activity_id: props._id,
    "members.pid": props.pid
  });

  let allConfirmed = false;
  if (team) allConfirmed = team.members.filter(member => member.confirmed === false).length === 0;
  return {team, allConfirmed};

})(Icebreaker);