import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { Meteor } from 'meteor/meteor';
import { withTracker } from 'meteor/react-meteor-data';
import TeamBox from '../TeamBox/TeamBox';
import Wrapper from '../../../Wrapper/Wrapper';
import ResponsesHandler from './Components/ResponsesHandler';
import ResponsesVote from '../ResponsesVote/ResponsesVote';
import Teams from '../../../../api/teams';
import Activities from '../../../../api/activities';

import './Icebreaker.scss';

class Icebreaker extends Component {
  static propTypes = {
    _id: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    console.log('CONSTRUCTOR [ICEBREAKER]');
    this.state = {
      confirmed: false
    }
  }

  // when new activity starts...
  componentDidUpdate(prevProps) {
    if (prevProps.currentActivity.status !==  this.props.currentActivity.status) {
      console.log('Updating!! [ICEBREAKER]');
      this.setState({
        confirmed: false
      });
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
    const { team, allConfirmed, currentActivity, pid } = this.props;
    if (!currentActivity) return "Oops! This activity doesn't exist.";
    if (currentActivity.status === 1) return <ResponsesHandler pid={pid} session_id={currentActivity.session_id} activity_id={currentActivity._id} />;
    if (currentActivity.status === 2) {
      if (!team) return <Wrapper>You have not been assigned a team.<br></br>Please wait for the next activity.<img id="movin-logo" src="./dynamic.gif" className="center"/></Wrapper>
      if (allConfirmed) return <Wrapper>Everyone confirmed!<img id="moving-logo" src="./dynamic.gif" className="center"/></Wrapper>
      if (this.state.confirmed) return <Wrapper>You've found everyone!<br></br>Wait for your teammates to find you.<img id="movin-logo" src="./dynamic.gif" className="center"/></Wrapper>
      return <TeamBox confirm={this.confirmTeam} pid={pid} team_id={team._id}/>
    }
    if (currentActivity.status === 3) {
      if (!team) return "You have not been assigned a team for this activity. Please wait for the next one.";
      return <ResponsesVote pid={pid} session_id={currentActivity.session_id} activity_id={currentActivity._id} team_id={team._id} />
    }
    if (currentActivity.status === 4) {
      if (!team) return "You have not been assigned a team for this activity. Please wait for the next one.";
      return <Wrapper>Waiting for next activity<img id="moving-logo" src="./dynamic.gif" className="center"/></Wrapper>
    }
    return "Not supposed to be here!";
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