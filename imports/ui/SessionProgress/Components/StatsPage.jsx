import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../api/teams';
import Responses from '../../../api/responses';
import Users from '../../../api/users';

export default class StatsPage extends Component {

  getBestLies() {
    const { activity_id } = this.props;
    const responses = Responses.find({activity_id}, { sort: {'options.count': -1 }}).fetch();
    if (!responses) return 'No good lies...';
    const lies = responses.map(re => re.options[2]).filter(opt => opt.count === 0);
    if (!lies) return 'No good lies...';
    if (!lies[0]) return 'No good lies...';
    return lies[0].text;
  }

  getUniqueTruths() {
    const { activity_id } = this.props;
    const responses = Responses.find({activity_id}, { sort: {'options.count': -1 }}).fetch();
    if (!responses) return 'No good lies...';
    // TODO: get both index 0 and 1
    const truths = responses.map(re => re.options[0]).filter(opt => opt.count > 0);
    if (!truths) return 'No unique truths...';
    if (!truths[0]) return 'No unique truths...';
    //TODO: fix this
    return truths[0].text;
  }

  getFastestTeams() {
    const { activity_id } = this.props;
    const teams = Teams.find({activity_id}, {sort: {teamFormationTime: 1}}).fetch();
    return teams.map(team => {
      return <div key={team._id}>{team.members.map(n => Users.findOne({pid: n.pid}).name).join(', ')}:
      {' ' + parseInt(team.teamFormationTime / 1000)}s</div>
    });
  }

  render() {
    return (
      <div>
        <div><b>Best Lies</b>: {this.getBestLies()}</div>
        <div><b>Most Unique Truths</b>: {this.getUniqueTruths()}</div>
        <div><b>Fastest Teams</b>: {this.getFastestTeams()}</div>
      </div>
    )
  }
}
