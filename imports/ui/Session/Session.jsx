import React, { Component } from "react";
import PropTypes from "prop-types";
import Wrapper from "../Wrapper/Wrapper";
import { withTracker } from "meteor/react-meteor-data";

import "./Session.scss";
import Activities from "../../api/activities";
import Sessions from "../../api/sessions";
import Logs from "../../api/logs";
import Teams from "../../api/teams";

class Session extends Component {
  static propTypes = {
    // code: PropTypes.string.isRequired,
  };

  // add new activity to database
  addActivity(evt) {
    evt.preventDefault();

    const name = "quiz";
    const session_id = this.props.session._id;

    // session is over
    if (this.props.session.status === 2) {
      console.log("Session is over, can't add more activities!");
      return;
    }

    // add new activity to db
    const activity = Activities.insert({
      name,
      index: this.props.activities.length,
      session_id,
      timestamp: new Date().getTime(),
      team_size: 3, // TODO: default value?
      status: 0,
      durationIndv: 20,
      durationTeam: 30,
      durationOffsetIndv: 5,
      durationOffsetTeam: 10,
      startTime: 0,
      statusStartTime: 0,
      teams: []
    });

    // add new activity to this session
    Sessions.update(session_id, {
      $push: {
        activities: activity
      }
    });

    //track the session that had an activity added
    const new_log = Logs.insert({
      log_type: "Activity Added to Session",
      code: this.props.match.params.code,
      activity: name,
      timestamp: new Date().getTime()
    });

    console.log(new_log);
  }

  mapActivities() {
    const { activities } = this.props;
    if (!activities) return "";
    return activities.map(act => {
      return (
        <div key={act._id}>
          Name: {act.name} | Status: {act.status}
        </div>
      );
    });
  }

  backToHome() {
    window.location = "/instructor";
  }

  mapPreference() {
    return "";
    const { session } = this.props;
    if (!session) return "";
    const teams = Teams.find({}).fetch();
    return (
      <div>
        <strong>Average team formation time: </strong>
        {teams.reduce((base, t) => {
          console.log(base + " " + t);
        })}
      </div>
    );
  }

  render() {
    if (!this.props.session) return "TODO: Loading component";
    const { status, timestamp, participants } = this.props.session;
    return (
      <Wrapper>
        <button onClick={() => this.backToHome()} id="back-button">
          back
        </button>
        <h1>{this.props.match.params.code}</h1>
        <table>
          <tbody id="session-info">
            <tr>
              <th>Created on:</th>
              <td>{new Date(timestamp).toDateString()}</td>
            </tr>
            <tr>
              <th>Status:</th>
              <td>{status}</td>
            </tr>
            <tr>
              <th>Size:</th>
              <td>{participants.length}</td>
            </tr>
          </tbody>
        </table>
        <div>{this.mapActivities()}</div>
        <form id="activity-form" onSubmit={evt => this.addActivity(evt)}>
          <div id="submit" className="field-container">
            <div className="input-container">
              <input type="submit" name="submit" value="Add activity" />
            </div>
          </div>
        </form>
        <div>{this.mapPreference()}</div>
      </Wrapper>
    );
  }
}

export default withTracker(props => {
  const { code } = props.match.params;
  const session = Sessions.findOne({ code });
  if (!session) return {};
  const activities = Activities.find({ session_id: session._id }).fetch();
  return { session, activities };
})(Session);
