import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import Button from '../../../Components/Button/Button';
import Loading from '../../../Components/Loading/Loading';
import './TeamFormation.scss';

class TeamFormation extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    team: PropTypes.object,
    team_id: PropTypes.string.isRequired
  };

  static defaultProps = {
    team: {}
  };

  constructor(props) {
    super(props);

    // find team in context
    const team = Teams.findOne(props.team_id);
    const { pid } = props;

    // state always starts as false
    this.state = {
      teammates: team.members
        .filter(member => member.pid !== pid)
        .map(member => ({ pid: member.pid, confirmed: false }))
    };
  }

  // check if confirmed
  componentDidUpdate() {
    let confirmedAll = true;

    this.state.teammates.forEach(member => {
      if (!member.confirmed) confirmedAll = false;
    });

    if (confirmedAll) {
      // get index of this user
      let pidIndex = -1;

      this.props.team.members.map((m, index) => {
        if (m.pid === this.props.pid) {
          pidIndex = index;
        }
      });

      // update that index on db
      Teams.update(
        this.props.team_id,
        {
          $set: {
            [`members.${pidIndex}.confirmed`]: true
          }
        },
        error => {
          if (error) console.log(error);
          else console.log('All confirmed!');
        }
      );
    }
  }

  getNameFromPid(pid) {
    return Users.findOne({ pid }).name;
  }

  // sets team member's state confirmed to true
  handleConfirmed(pid) {
    console.log(`Found ${pid}`);
    this.setState(state => {
      // look for teammate and update state
      state.teammates.forEach(member => {
        if (member.pid === pid) {
          member.confirmed = true;
        }
      });

      return state;
    });
  }

  renderTeammates() {
    if (this.props.allConfirmed) {
      return 'Everyone in your group has confirmed! While waiting for other groups, introduce yourself to your teammates.';
    }

    if (this.props.confirmed) return 'Confirmed. Waiting for other groupmates.';

    return this.state.teammates.map(m => (
      <Button key={m.pid} active={m.confirmed} onClick={() => this.handleConfirmed(m.pid)}>
        {this.getNameFromPid(m.pid)}
      </Button>
    ));
  }

  render() {
    const { team } = this.props;

    if (!team) return <Loading />;

    const { shape, color } = team;

    return (
      <div className="team-formation-main">
        <div className="shape-main">
          <div>Find others with this shape and color</div>
          <img className="shape-img" src={`/shapes/${shape}-solid-${color}.png`} alt={`${color} ${shape}`} />
          {!this.props.confirmed && <div>Select members found:</div>}
        </div>
        {this.renderTeammates()}
      </div>
    );
  }
}

export default withTracker(props => {
  const team = Teams.findOne(props.team_id);
  let confirmed = false;
  let allConfirmed = false;

  try {
    confirmed = team.members.filter(m => m.pid === props.pid)[0].confirmed;
    allConfirmed = true;
    team.members.forEach(member => {
      if (!member.confirmed) allConfirmed = false;
    });
  } catch (error) {
    console.log(error);
  }

  return { team, confirmed, allConfirmed };
})(TeamFormation);
