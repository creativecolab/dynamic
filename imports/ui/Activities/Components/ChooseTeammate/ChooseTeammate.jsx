import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import '../../../assets/_main.scss';
import './ChooseTeammate.scss';
import Button from '../../../Components/Button/Button';

export default class ChooseTeammate extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    team_id: PropTypes.string.isRequired,
    handleChosen: PropTypes.func
  };

  constructor(props) {
    super(props);
    const { pid, team_id } = props;
    const team = Teams.findOne(team_id);
    const user = Users.findOne(
      { pid, 'preference.activity_id': team.activity_id },
      { sort: { 'preference.timestamp': 1 } }
    );

    if (user) {
      this.props.handleChosen();
      this.state = {
        votedOn: user.preference.filter(pref => pref.activity_id === team.activity_id)[0].pid
      };
    } else {
      this.state = {
        votedOn: null
      };
    }
  }

  handleVote = votedPid => {
    const { pid, team_id } = this.props;
    const team = Teams.findOne(team_id);

    const user = Users.findOne({ pid });

    if (votedPid === this.state.votedOn) {
      console.log('Already voted on ' + votedPid);

      return;
    }

    Users.update(
      user._id,
      {
        $push: {
          preference: {
            pid: votedPid,
            activity_id: team.activity_id,
            timestamp: new Date().getTime()
          }
        }
      },
      error => {
        if (error) {
          console.log(error);
        } else {
          console.log('You voted on ' + votedPid);
          this.setState({
            votedOn: votedPid
          });
          this.props.handleChosen();
        }
      }
    );
  };

  getName(pid) {
    return Users.findOne({ pid }).name;
  }

  getStyle(pid) {
    if (pid === this.state.votedOn) return { background: '#FBF2C0' };

    return {};
  }

  renderOptions() {
    const { pid, team_id } = this.props;
    const team = Teams.findOne(team_id);
    const teammates = team.members.filter(member => member.pid !== pid);
    const opts = teammates.map(mate => (
      // <button
      //   style={this.getStyle(mate.pid)}
      //   key={mate.pid}
      //   className="big-button"
      //   onClick={() => this.handleVote(mate.pid)}
      // >
      //   {this.getName(mate.pid)}
      // </button>
      <Button key={mate.pid} onClick={() => this.handleVote(mate.pid)}>
        {this.getName(mate.pid)}
      </Button>
    ));

    opts.push(
      // <button style={this.getStyle('all')} key="all" className="big-button" onClick={() => this.handleVote('all')}>
      //   All
      // </button>
      <Button key="all" onClick={() => this.handleVote('all')}>
        All
      </Button>
    );

    return opts;
  }

  render() {
    return (
      <div className="end-main">
        <div className="end-instructions">Which team member would you see yourself working with again?</div>
        <div>{this.renderOptions()}</div>
        {this.state.votedOn && <div>Thanks for choosing!</div>}
      </div>
    );
  }
}
