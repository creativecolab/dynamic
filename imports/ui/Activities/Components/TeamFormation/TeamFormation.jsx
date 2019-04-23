import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import Button from '../../../Components/Button/Button';
import './TeamFormation.scss';


export default class TeamFormation extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    team_id: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);

    // find team in context
    const team = Teams.findOne(props.team_id);
    const { pid } = props;

    // 
    this.state = {
      confirmed: team.members.filter(m => m.pid === pid)[0].confirmed,
      teammates: team.members
      .filter(member => member.pid !== props.pid)
      .map(member => ({pid: member.pid, confirmed: false}))
    };
  }

  // check if confirmed
  componentDidUpdate() {

    let confirmedAll = true;
    this.state.teammates.forEach((member) => {
      if (!member.confirmed) confirmedAll = false;
    }); 

    if (confirmedAll) {
      // this.props.confirm();
      console.log('All confirmed!');
    }

  }

  getNameFromPid(pid) {
    return Users.findOne({pid}).name;
  }

  // sets team member's state confirmed to true
  handleConfirmed(pid) {
    console.log("Found " + pid);
    this.setState((state) => {
      // look for teammate and update state
      state.teammates.forEach((member) => {
        if (member.pid === pid) {
          member.confirmed = true;
        }
      }); 
      return state;
    });
  }

  renderTeammates() {
    // if (this.state.all)
    return this.state.teammates.map(m => (
      <Button
        key={m.pid}
        active={m.confirmed}
        onClick={() => this.handleConfirmed(m.pid)}
      >
        {this.getNameFromPid(m.pid)}
      </Button>));
  }

  render() {
    if (!this.props.team_id) return "Something went wrong...";

    const team = Teams.findOne(this.props.team_id);
    const { shape, shapeColor } = team;

    return (
        <div className="team-formation-main">
          <div className="shape-main">
            <div>Find others with this shape and color</div>
            <img className="shape-img" src={"/shapes/" + shape + "-solid-" + shapeColor + ".png"} alt={shapeColor + " " + shape}/>
          </div>
          {this.renderTeammates()}
        </div>
  )
  }
}