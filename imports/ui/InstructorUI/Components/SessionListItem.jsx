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

  startActivity() {

    

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
    if (participants.length === 0) {
      console.log('No participants!');
      return;
    }

    // let teams = [];

    // // form teams, teams of 3
    // let newTeam = [participants[0]];
    // for (let i = 1; i < participants.length; i++) {
    //   if (i % 3 == 0) {
    //     teams.push(newTeam);
    //     newTeam = [participants[i]];
    //   } else {
    //     newTeam.push(participants[i]);
    //   }
    // }

    // // last team
    // if (newTeam.length < 3) {
    //   teams.push(newTeam);
    // }

    // console.log(teams)

    Sessions.update(this.props._id, {
      $set: { status: 1 }
    });
    
  }

  render() {
    const { code, timestamp, participants, status } = this.props;
    return (
      <div>
        {this.renderRedirect()}
        Code: {code} | Participants: {participants.length} | Status: {status}
        <button onClick={() => this.startSession()}>start</button>
        <button onClick={() => this.editSession()}>edit</button>
      </div>
    )
  }
}

export default SessionListItem;
