import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Sessions from "../../api/sessions";
import SessionListItem from './Components/SessionListItem';
import Logs from "../../api/logs";
import '../assets/_main.scss';
import './InstructorUI.scss';


class InstructorUI extends Component {
  static propTypes = {
    sessions: PropTypes.array,
  }

  constructor(props) {
    super(props);
    this.state = {
      session_code: ''
    }
  }

  // insert new session to db
  handleNewSession(evt) {
    evt.preventDefault();
    const { session_code } = this.state;

    // invalid session code
    if (session_code === "") {
      console.log("Invalid session name!");
      return;
    }

    const session = Sessions.findOne({code: session_code});

    // session already exists!
    if (session) {
      console.log('Session already exists!');
      return;
    }

    // create session
    const session_id = Sessions.insert({
      code: session_code.toLowerCase(),
      timestamp: new Date().getTime(),
      participants: [],
      activities: [],
      status: 0 // TODO: ENUM with status PENDING, DONE, IN_PROGRESS
    }, (data) => {
      console.log(data);
      this.setState({
        session_code: '',
        size: 3
      });
    });


    // create 3 default activities
    const activities = [];
    for (var i = 0; i < 3; i++) {
      const activity = Activities.insert({
        name: 'Icebreaker',
        session_id,
        timestamp: new Date().getTime(),
        team_size: 3, // TODO: default value?
        status: 0,
        startTime: 0,
        teams: []
      });
      activities.push(activity);
    }

    // add new activity to this session, necessary? good?
    Sessions.update(session_id, {
      $set: {
        activities
      }
    });

    //track the session that was created
    const new_log = Logs.insert({
      log_type: "Session Created",
      code: session_code,
      timestamp: new Date().getTime(),
    });

    console.log(new_log);

  }

  //update the session_code state so we know where to go
  handleSessionChange(evt) {
    this.setState({
      session_code: evt.target.value
    });
  }

  // list sessions
  mapSessions() {
    return this.props.sessions.map(({_id, code, participants, timestamp, status}) => (
      <SessionListItem key={_id} _id={_id} participants={participants} code={code} timestamp={timestamp} status={status} />
    ));
  }

  render() {
    return (
      <div>
        {/* <div class="header"><img id="dynamic-logo-big" src="./dynamic_logo.png" alt=""/> */}
        <div id="inner">
        <h1>Manage Sessions</h1>
        <br></br>
        <form id="session-form" onSubmit={(evt) => this.handleNewSession(evt)}>
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">New session code</label>
            <div className="input-container">
              <input className="bigscreen-input-text" type="text" name="session-code" placeholder="Type your session code here" value={this.state.session_code} onChange={(evt) => this.handleSessionChange(evt)}/>
            </div>
          </div>
          <div id="submit" className="field-container">
          <input className="bigscreen-button" type="submit" value="Create"/>
          </div>
        </form>
        <br></br>
        <div>
        {this.mapSessions()}
        </div>
      </div>
      </div>
    )
  }
}

export default withTracker(() => {
  const sessions = Sessions.find().fetch();
  return {sessions};
})(InstructorUI);