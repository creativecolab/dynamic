import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor';
import TeamBox from '../TeamBox/TeamBox';
import Wrapper from '../../../Wrapper/Wrapper';
import Teams from '../../../../api/teams';
import Responses from './Components/Responses'
import { withTracker } from 'meteor/react-meteor-data';
import Activities from '../../../../api/activities';



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

    // make a copy of current team
    let updatedTeam = this.props.team;
    updatedTeam.members.forEach(member => {
      if (member.pid === this.props.pid) {
        member.confirmed = true;
      }
    });

    // update on database
    Teams.update(this.props.team._id, {
      $set: {
        members: updatedTeam.members
      }
    });
    
    // confirmed team
    this.setState({
      confirmed: true
    });

  }

  render() {
    const { team, allConfirmed, currentActivity } = this.props;
    if (!currentActivity) return "Oops! This activity doesn't exist.";
    if (currentActivity.status === 1) return <Responses />;
    if (currentActivity.status === 2) {
      if (!team) return "You have not been assigned a team for this activity.";
      if (allConfirmed) return "Everyone confirmed! Great :)";
      if (this.state.confirmed) return "Great, you found everyone! Now wait for your teammates to find you.";
      return <TeamBox confirm={this.confirmTeam} pid={this.props.pid} team_id={this.props.team._id}/>
    }
  }
}


// TODO: clean this up
export default withTracker(props => {

  // get current activity
  const currentActivity = Activities.findOne(props._id);

  // get this user's team
  const team = Teams.findOne({
    activity_id: props._id,
    "members.pid": props.pid
  });

  // check if all confirmed
  let allConfirmed = false;
  if (team) allConfirmed = team.members.filter(member => member.confirmed === false).length === 0;
  return {team, currentActivity, allConfirmed};
})(Icebreaker);