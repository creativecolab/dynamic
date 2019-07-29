import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../api/teams';

import './TeamShapes.scss';

class TeamShapes extends Component {
  static propTypes = {
    activity_id: PropTypes.string.isRequired
  };

  mapShapes(teams) {
    return (
      <div>
        {teams.map(team => {
          if (team.confirmed) {
            return (
              <div key={team._id} className="shape-box">
                <img
                  src={'/shapes/' + team.shape + '-solid-' + team.color + '.jpg'}
                  alt={team.color + ' ' + team.shape}
                />
              </div>
            );
          } else {
            return (
              <div key={team._id} className="shape-box">
                <img
                  src={'/shapes/' + team.shape + '-outline-' + team.color + '.jpg'}
                  alt={team.color + ' ' + team.shape}
                />
              </div>
            );
          }
        })}
      </div>
    );
  }

  render() {
    const { teams, notConfirmed } = this.props;
    let numTeams = 0;

    if (teams) {
      numTeams = teams.length - notConfirmed;
    }

    return (
      <div className="teams">
        {teams && <div className="shape-grid">{this.mapShapes(teams)}</div>}
        {teams && <h2>{numTeams + '/' + teams.length} teams are ready!</h2>}
      </div>
    );
  }
}

export default withTracker(props => {
  const { activity_id } = props;
  const teams = Teams.find({ activity_id }).fetch();
  const notConfirmed = Teams.find({ activity_id, 'members.confirmed': false }).count();

  return { teams, notConfirmed };
})(TeamShapes);
