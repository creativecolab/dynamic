import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../../api/teams';
import Color from '../../../Color';
import Users from '../../../../api/users';

import './TeamBox.scss';

export default class TeamBox extends Component {
  static propTypes = {
    team_id: PropTypes.string.isRequired,
    confirm: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      teammates: Teams.findOne(props.team_id).members
      .filter(member => member.pid !== props.pid)
    };
  }

  // check if confirmed
  componentDidUpdate() {

    let confirmedAll = true;
    this.state.teammates.forEach((member) => {
      if (!member.confirmed) confirmedAll = false;
    }); 

    if (confirmedAll) {
      this.props.confirm();
    }

  }

  getNameFromPid(pid) {
    const user = Users.findOne({pid});
    if (!user) return "OH MY!";
    return Users.findOne({pid}).name;
  }

  // sets team member's state confirmed to true
  handleConfirmed(evt) {
    const username = evt.target.innerText;
    console.log(username);
    this.setState((state) => {
      // look for teammate and update state
      state.teammates.forEach((member) => {
        if (this.getNameFromPid(member.pid) === username) {
          member.confirmed = true;
        }
      }); 
      return state;
    });
  }

  render() {
    if (!this.props.team_id) return "Something went wrong...";

    const team = Teams.findOne(this.props.team_id);

    return (
        <div> 
        <div><Color color={team.color} username={this.getNameFromPid(this.props.pid)} /></div>
        <div id="team-container">
        <span>Tap the teammates you’ve found</span>
        <div id="button-container">
        {this.state.teammates.map(teammate => {
          if (!teammate.confirmed) return <button className="button" key={teammate.pid} onClick={(evt) => this.handleConfirmed(evt)}><b>{this.getNameFromPid(teammate.pid)}</b></button>;
          else return <div key={teammate.pid}><b className="button-click">{this.getNameFromPid(teammate.pid)}</b></div>;
        })}
        </div>
        </div>
        </div>
  )
  }
}