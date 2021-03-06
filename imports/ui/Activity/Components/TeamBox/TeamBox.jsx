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
    console.log("Found " + username);
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
          <Color shape={team.shape} color={team.shapeColor} username={this.getNameFromPid(this.props.pid)} />
          {/* <img className="shape" src={"shapes/" + team.shape + "-solid-" + team.shapeColor + ".png.png"} alt={team.shapeColor + " " + team.shape}/> */}
          <span><h2>Tap the teammates you’ve found</h2></span>
          <div id="underline-text"></div>
            {this.state.teammates.map(teammate => {
              if (!teammate.confirmed) return <button className="big-button" key={teammate.pid} onClick={(evt) => this.handleConfirmed(evt)}>{this.getNameFromPid(teammate.pid)}</button>;
              else return <div key={teammate.pid}><button className="big-button-fill">{this.getNameFromPid(teammate.pid)}</button></div>;
            })}
        </div>
  )
  }
}