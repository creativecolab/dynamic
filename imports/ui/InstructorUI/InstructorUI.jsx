import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper';
import { withTracker } from 'meteor/react-meteor-data';
import Sessions from "../../api/sessions";
import SessionListItem from './Components/SessionListItem';


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
    const { session_code, size } = this.state;
    Sessions.insert({
      code: session_code,
      timestamp: new Date().toDateString(),
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
  }

  //update the session_code state so we know where to go
  handleSessionChange(evt) {
    this.setState({
      session_code: evt.target.value
    });
  }

  handleSizeChange(evt) {
    this.setState({
      size: parseInt(evt.target.value)
    });
  }

  mapSessions() {
    return this.props.sessions.map(({_id, code, participants, timestamp, status}) => (
      <SessionListItem key={_id} _id={_id} participants={participants.length} code={code} timestamp={timestamp} status={status} />
    ));
  }

  render() {
    return (
      <Wrapper>
        <h1>Manage Sessions</h1>
        <form id="session-form" onSubmit={(evt) => this.handleNewSession(evt)}>
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">New session code</label>
            <div className="input-container">
              <input type="text" name="session-code" placeholder="Type your session code here" value={this.state.session_code} onChange={(evt) => this.handleSessionChange(evt)}/>
            </div>
          </div>
          {/* <div id="team-size" className="field-container">
            <label className="field-title" htmlFor="team-size">Maximum team size</label>
            <div className="input-container">
              <input type="number" name="team-size" placeholder="Maximum team size" value={this.state.size} onChange={(evt) => this.handleSizeChange(evt)}/>
            </div>
          </div> */}
          <div id="submit" className="field-container">
            <div className="input-container">
              <input type="submit" name="submit" value="Create"/>
            </div>
          </div>
        </form>
        <div>
          {this.mapSessions()}
        </div>
      </Wrapper>
    )
  }
}

export default withTracker(() => {
  const sessions = Sessions.find().fetch();
  return {sessions};
})(InstructorUI);