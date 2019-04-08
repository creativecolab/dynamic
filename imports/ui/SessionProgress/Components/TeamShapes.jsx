import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { withTracker } from 'meteor/react-meteor-data';
import Teams from '../../../api/teams';

import './TeamShapes.scss';

class TeamShapes extends Component {
  static propTypes = {
    activity_id: PropTypes.string.isRequired,
    skip: PropTypes.func.isRequired,
  }

  mapShapes(teams) {
    return <div>{teams.map(team => {
      if (team.members.map(x => x.confirmed).reduce((res, x) => res && x)) {
        return (<div key={team._id} className="shape-box">
          <img src={"/shapes/" + team.shape + "-solid-" + team.shapeColor + ".png.png"} alt={team.shapeColor + " " + team.shape} />
        </div>);
      } else {
        return (<div key={team._id} className="shape-box">
          <img src={"/shapes/" + team.shape + "-outline-" + team.shapeColor + ".png.png"} alt={team.shapeColor + " " + team.shape} />
        </div>);
      }
    })}</div>;
  }

  render() {
    const { teams, notConfirmed } = this.props;
    let numTeams = 0;
    if (teams) {
      numTeams = teams.length - notConfirmed;
    }
    return (
      <div>
        <h1>Find your team</h1>
        <div>Find others who have the same colored shape</div>
        {teams && <div className="shape-grid">{this.mapShapes(teams)}</div>}
        {teams && <h2>{numTeams + '/' + teams.length}{numTeams === 1? ' team has ' : ' teams have '}joined</h2>}
        {/* <button onClick={() => this.props.skip()}>Skip to activity</button> */}
      </div>
    )
  }
}

export default withTracker(props => {
  const { activity_id } = props;
  const teams = Teams.find({activity_id}).fetch();
  const notConfirmed = Teams.find({activity_id, 'members.confirmed': false}).count();
  return {teams, notConfirmed}
})(TeamShapes);