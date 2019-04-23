import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../api/teams';
import Responses from '../../../api/responses';
import Users from '../../../api/users';
import Sessions from '../../../api/sessions';


export default class StatsPage extends Component {

  static propTypes = {
    session_id: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired
  }

  constructor(props) {
    super(props);
    const session = Sessions.findOne(this.props.session_id);
    this.state = {
      round: session.round
    };
  }

  // finds and returns the user in the session with the most points so far
  getTopUserPoints() {
    const { activity_id } = this.props;
    // get all teams in this activity
    const teams = Teams.find({activity_id}).fetch();
    var topUser = "";
    var topPoints = 0;
    // check each teams members 
    teams.map(team => {
      team.members.map(n => {
        var curr_user = Users.findOne({pid: n.pid});
        // for each memory, find their points for this session, and see if is the greatest
        curr_user.points_history.map(curr_user_point => {
          if (curr_user_point.session === this.props.session_id) {
            if (curr_user_point.points > topPoints) {
              topUser = curr_user.name;
              topPoints = curr_user_point.points;
            }
          }
        });
      });
    });
    if (topUser === "") return "No top user right now...";
    else return topUser + ", with " + topPoints + " points";
  }

  getBestLies() {
    const { activity_id } = this.props;

    // get responses, sort by num_voted
    const responses = Responses.find({activity_id}, {sort: {num_voted: -1}}).fetch();
    if (!responses) return 'No good lies...';
    if (!responses[0]) return 'No good lies...';

    if (responses[0].quiz_id) return 'TODO: this is a quiz!';


    const lies = responses.map(re => re.options[2]).filter(opt => opt.count === 0);

    if (!lies) return 'No good lies...';
    if (!lies[0]) return 'No good lies...';
    return lies[0].text;
  }

  getUniqueTruths() {
    const { activity_id } = this.props;

    // get responses
    const responses = Responses.find({activity_id}).fetch();
    if (!responses) return 'No unique truths...';
    if (!responses[0]) return 'No unique truths...';

    if (responses[0].quiz_id) return 'TODO: this is a quiz!';

    // get all truths
    const truths0 = responses.map(re => re.options[0]).filter(opt => opt.count > 0);
    const truths1 = responses.map(re => re.options[1]).filter(opt => opt.count > 0);
    const truths = truths0.concat(truths1).sort((a, b) => b.count - a.count);

    if (!truths) return 'No unique truths...';
    if (!truths[0]) return 'No unique truths...';
    return truths[0].text;
  }

  // give top users points
  addPoints(pid) {
    Users.findOne({pid});
  };

  getFastestTeams() {
    const { activity_id } = this.props;

    // get top 3 fastest teams
    const teams = Teams.find({activity_id, teamFormationTime: { $gt: 0 }}, {
      sort: { teamFormationTime: 1 },
      limit: 1
    }).fetch();

    if (teams == false) return "No data";

    return teams.map(team => {
      return <div key={team._id}>{team.members.map(n => Users.findOne({pid: n.pid}).name).join(', ')}:
      {' ' + parseInt(team.teamFormationTime / 1000)}s</div>
    });
  }

  // upon exiting this page, update the round we are on 
  componentWillUnmount() {
    Sessions.update(this.props.session_id, {
      $set: {
        round: this.state.round + 1
      }
    });
  }

  render() {
    return (
      <div>
        <div>
          <h1>Round {this.state.round}: 2 Truths and 1 Lie</h1>
            <br></br>
            <h2>Top Guesser:</h2>
            <div className="text-box-bigscreen-shrink">
              <h2>{this.getTopUserPoints()}</h2>
            </div>
            <h2>Best Lies:</h2>
            <div className="text-box-bigscreen-shrink">
              <h2>{this.getBestLies()}</h2>
            </div>
            <h2>Most Unique Truths:</h2>
            <div className="text-box-bigscreen-shrink">
              <h2>{this.getUniqueTruths()}</h2>
            </div>
            <h2>Fastest Teams:</h2>
            <div className="text-box-bigscreen-shrink">
              <h2> {this.getFastestTeams()}</h2>
            </div><br></br>
        </div>
      </div>
    )
  }
}
