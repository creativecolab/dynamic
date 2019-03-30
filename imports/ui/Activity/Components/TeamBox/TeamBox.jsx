import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../../api/teams';
import Color from '../../../Color';
import Users from '../../../../api/users';

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
        <Color color={team.color} username={this.getNameFromPid(this.props.pid)} />
        Find your teammates:
        <div>
        {this.state.teammates.map(teammate => {
          if (!teammate.confirmed) return <button key={teammate.pid} onClick={(evt) => this.handleConfirmed(evt)}><b>{this.getNameFromPid(teammate.pid)}</b></button>;
          else return <div key={teammate.pid}><b>Found {this.getNameFromPid(teammate.pid)}</b></div>;
        })}
        </div>
        <div>
          <br/>Click on their names when you find them!
        </div>
        </div>
  )
  }
}