import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Sessions from '../../../api/sessions';
import Users from '../../../api/users';
import Activities from '../../../api/activities'
import { Redirect } from 'react-router-dom'


// TODO: two types of users: within session, and permanent (cross-sessions)

class SessionListItem extends Component {
  static propTypes = {
    code: PropTypes.string.isRequired,
    timestamp: PropTypes.number.isRequired,
    status: PropTypes.number.isRequired
  }

  constructor(props) {
    super(props);
    this.state = {
      redirect: false
    };
  } 

  editSession() {
    this.setState({
      redirect: true
    });
  }

  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: '/' + this.props.code + '/edit'
      }}/>
    }
  }

  // this should be it's own component, with its own view
  startSession() {

    const { participants } = this.props;

    // need participants!
    if (participants.length < 2) {
      console.log('Not enough participants!');
      return;
    }

    // ready to start session!
    Sessions.update(this.props._id, {
      $set: { status: 1 }
    });
    
  }

  render() {
    const { code, timestamp, participants, status } = this.props;
    return (
      <div>
        {this.renderRedirect()}
        Code: {code} | Status: {status} {" "}
        <button onClick={() => this.startSession()}>start</button>
        <button onClick={() => this.editSession()}>edit</button>
      </div>
    )
  }
}

export default SessionListItem;
