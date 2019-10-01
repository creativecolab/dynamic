import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Random } from 'meteor/random';
import ActivityEnums from '../../enums/activities';

import Sessions from '../../api/sessions';
import SessionListItem from './Components/SessionListItem';
import Logs from '../../api/logs';
import Activities from '../../api/activities';
import '../assets/_main.scss';
import './InstructorUI.scss';
import Quizzes from '../../api/quizzes';
import SessionEnums from '../../enums/sessions';

class InstructorUI extends Component {
  static propTypes = {
    sessions: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      instructor: '',
      code: ''
    };
  }

  // insert new session to db
  handleNewSession(evt) {
    evt.preventDefault();
    const { instructor } = this.state;

    // invalid instructor title
    if (instructor === '') {
      console.log('Invalid instructor name!');

      return;
    }

    // make a new code
    let newcode = '';
    const characters = 'ABCDEFGHJKLMNPQRSTWXYZ23456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 5; i++) {
      newcode += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    // FIXME: probably don't need this
    const session = Sessions.findOne({ newcode });
    if (session) {
      console.log('Session already exists!');

      return;
    }

    // create session
    Sessions.insert(
      {
        code: newcode.toLowerCase(),
        instructor: instructor.toLowerCase(),
        participants: [],
        teamHistory: {},
        activities: [],
        status: SessionEnums.status.READY,
        creationTime: new Date().getTime(),
        startTime: 0,
        endTime: 0
      },
      error => {
        if (error) console.log('Something went wrong!');
        else console.log('Session created!');
      }
    );

    // save the code that was made
    this.setState({
      code: newcode
    });
  }

  //update the code state so we know where to go
  handleSessionChange(evt) {
    this.setState({
      instructor: evt.target.value
    });
  }

  // list sessions
  mapSessions() {
    return this.props.sessions.map(({ _id, code, participants, creationTime, status, instructor }) => (
      <SessionListItem
        key={_id}
        _id={_id}
        participants={participants}
        code={code}
        instructor={instructor}
        creationTime={creationTime}
        status={status}
      />
    ));
  }

  render() {
    return (
      <div className="outer">
        {/* <div class="header"><img id="dynamic-logo-big" src="./dynamic_logo.png" alt=""/> */}
        <div className="inner">
          <h1>Manage Sessions</h1>
          <br />
          <form id="session-form" onSubmit={evt => this.handleNewSession(evt)}>
            <div id="session-code">
              <label>Instructor for the Next Session</label>
              <div>
                <input
                  className="bigscreen-input-text"
                  type="text"
                  name="session-code"
                  placeholder="Name of Instructor"
                  value={this.state.instructor}
                  onChange={evt => this.handleSessionChange(evt)}
                />
              </div>
            </div>
            <div id="submit" className="field-container">
              <input className="bigscreen-button" type="submit" value="Create" />
            </div>
          </form>
          <br />
          <div>{this.mapSessions()}</div>
        </div>
      </div>
    );
  }
}

export default withTracker(() => {
  const sessions = Sessions.find().fetch();

  return { sessions };
})(InstructorUI);
