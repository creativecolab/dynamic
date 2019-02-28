import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sessions from '../../../api/sessions';

class SessionListItem extends Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    timestamp: PropTypes.string.isRequired,
    status: PropTypes.number.isRequired
  }

  // this should be it's own component, with its own view
  startSession() {
    console.log('woo');
    Sessions.update(this.props._id, {
      $set: { status: 1 /*- this.props.status*/ }
    });
  }

  render() {
    const { code, timestamp, participants, status } = this.props;
    return (
      <div>
        Code: {code} | Participants: {participants} | Status: {status}
        <button onClick={() => this.startSession()}>start</button>
      </div>
    )
  }
}

export default SessionListItem;
