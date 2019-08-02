import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../api/teams';

import './TeamShapes.scss';
import Users from '../../../api/users';

class TeamShapes extends Component {
  static propTypes = {
    activity_id: PropTypes.string.isRequired
  };

  mapShapes(teams) {
    // const ret = [];

    // for (let i = 0; i < 23; i++) {
    //   ret.push(
    //     <div key={i} className="shape-box">
    //       <img src={'/shapes/' + 'square' + '-outline-' + 'blue' + '.jpg'} />
    //     </div>
    //   );
    // }

    // return ret;

    return (
      <>
        {teams.map(team => {
          if (team.confirmed) {
            return (
              <div key={team._id} className="shape-box">
                <img
                  src={'/shapes/' + team.shape + '-solid-' + team.color + '.jpg'}
                  alt={team.color + ' ' + team.shape}
                  title={team.members
                    .map(m => {
                      const user = Users.findOne({ pid: m.pid });

                      if (user) return user.name;

                      return '';
                    })
                    .join(', ')}
                />
              </div>
            );
          } else {
            return (
              <div key={team._id} className="shape-box">
                <img
                  src={'/shapes/' + team.shape + '-outline-' + team.color + '.jpg'}
                  alt={team.color + ' ' + team.shape}
                  title={team.members
                    .map(m => {
                      const user = Users.findOne({ pid: m.pid });

                      if (user) return user.name;

                      return '';
                    })
                    .join(', ')}
                />
              </div>
            );
          }
        })}
      </>
    );
  }

  render() {
    const { teams, notConfirmed } = this.props;
    let numTeams = 0;

    if (teams) {
      numTeams = teams.length - notConfirmed;
    }

    return (
      <>
        {teams && <div className="shapes-flex">{this.mapShapes(teams)}</div>}
        {teams && <h2>{numTeams + ' out of ' + teams.length} teams are ready!</h2>}
      </>
    );
  }
}

export default withTracker(props => {
  const { activity_id } = props;
  const teams = Teams.find({ activity_id }).fetch();
  const notConfirmed = Teams.find({ activity_id, confirmed: false }).count();
  const users = Users.find().fetch();

  return { teams, users, notConfirmed };
})(TeamShapes);
