import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Sessions from '../../api/sessions';
import Users from '../../api/users';

import Mobile from '../Layouts/Mobile/Mobile';

import JoinSection from './Components/JoinSection/JoinSection';
import TextInput from '../Components/TextInput/TextInput';

import '../assets/_main.scss';
import './Landing.scss';

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      name: '',
      pid: '',
      invalidCode: false,
      invalidName: false,
      invalidPID: false,
      ready: false,
      codeSubmitted: false,
      pidSubmitted: false
    };
  }

  /* text field handlers */

  // update the code state so we know where to go
  handleCode = evt => {
    this.setState({
      code: evt.target.value.toUpperCase(),
      invalidCode: false
    });
  };

  // update the name as the user types
  handleName = evt => {
    if (evt.target.value.length > 30) return;

    this.setState({
      name: evt.target.value
    });
  };

  // update the pid as the user types
  handlePid = evt => {
    if (evt.target.value.length > 20) return;

    this.setState({
      pid: evt.target.value
    });
  };

  /* event handlers */

  // once the user enters the session code, try go to that session's page
  handleCodeSubmission = () => {
    const code = this.state.code.toLowerCase();

    // handle invalid codes
    if (code === 'instructor' || code === 'sandbox' || code === 'data' || code === '') {
      this.setState({
        invalidCode: true
      });

      return;
    }

    // check if session exists
    const session = Sessions.findOne({ code });

    // session exists
    if (session) {
      // if this is an unowned session, let user's just enter a name, and we'll create a PID for them
      if (!session.instructor) {
        // generate a pid for the user
        if (localStorage.getItem("pid")) {
          console.log("pid " + localStorage.getItem("pid") + " found");
        }
        let pid = [...Array(6)].map(() => Math.random().toString(36)[2]).join('');
        let user = Users.findOne({ pid: pid });
        while (user != undefined) {
          console.log("Pid is already taken!");
          pid = [...Array(6)].map(() => Math.random().toString(36)[2]).join('');
          user = Users.findOne({ pid: pid });
        }
        Meteor.call('users.addUser', pid, "steve", () => {
          localStorage.setItem("pid", pid);
          this.setState({
            pid: pid,
            pidSubmitted: true,
            codeSubmitted: true,
          });
        });
      }
      // this is an owned session, so there is a roster with PIDs
      else {
        this.setState({
          codeSubmitted: true
        });
      }

    }
    // invalid session code
    else {
      this.setState({
        invalidCode: true
      });
    }
  };

  handleConfirmation = () => {
    const pid = this.state.pid.toLowerCase().trim();
    const name = this.state.name.trim();
    const code = this.state.code.toLowerCase().trim();

    if (!this.state.pidSubmitted) {
      // check for valid input
      if (pid.length === 0) {
        this.setState({
          invalidPID: true
        });

        return;
      } else {
        this.setState({
          invalidPID: false
        });
      }

      if (name.length === 0) {
        this.setState({
          invalidName: true
        });

        return;
      } else {
        this.setState({
          invalidName: false
        });
      }

      // find user by pid on database
      const user = Users.findOne({ pid });

      // check if user exists!
      if (user) {
        this.setState({
          pidSubmitted: true,
        });
        // update the user's name to their preferred name
        Users.update(user._id, {
          $set: {
            name
          }
        });
      }
      // creating user for the first time! AKA signup
      else {
        console.log("New User!");
        Meteor.call('users.addUser', pid, name, () => {
          this.setState({
            pidSubmitted: true,
          });
        });
      }
    }

    // find current session
    console.log(code);
    const session = Sessions.findOne({ code });

    if (session.participants.includes(pid)) {
      this.setState({
        ready: true
      });
    }
    // user hasn't joined this session yet
    else {
      Meteor.call('sessions.addUser', pid, session._id, () => {
        this.setState({
          ready: true,
        });
      });
    }
  };

  /* render functions */

  // will redirect to the main session page
  renderRedirect = () => {
    // eslint-disable-next-line react/destructuring-assignment
    const pid = this.state.pid.toLowerCase();
    const { ready, code } = this.state;

    if (ready) {
      return (
        <Redirect
          to={{
            pathname: '/' + code.toLowerCase(),
            state: { pid }
          }}
        />
      );
    }
  };

  renderConfirmation() {
    const { pid, name, invalidName, invalidPID } = this.state;

    return (
      <Mobile buttonAction={this.handleConfirmation} buttonTxt="Yes" hasNavbar={false}>
        {this.renderRedirect()}
        <div className="confirmation">
          <TextInput
            name="pid"
            onSubmit={this.handleConfirmation}
            onChange={this.handlePid}
            value={pid}
            invalid={invalidPID}
            invalidMsg="Invalid PID!"
            label="What is your PID?"
            placeholder="Please enter your PID here."
          />
          <TextInput
            name="name"
            onSubmit={this.handleConfirmation}
            onChange={this.handleName}
            value={name}
            invalid={invalidName}
            invalidMsg="Invalid Name!"
            label="What is your preferred name?"
            placeholder="Enter your preferred name here."
          />
        </div>
      </Mobile>
    );
  }

  render() {
    const { codeSubmitted, code, invalidCode } = this.state;

    if (codeSubmitted) return this.renderConfirmation();

    else
      return (
        <Mobile buttonAction={this.handleCodeSubmission} hasNavbar={false}>
          <JoinSection
            handleSubmit={this.handleCodeSubmission}
            handleCode={this.handleCode}
            code={code}
            invalid={invalidCode}
            invalidMsg="A session with that code does not exist!"
          />
        </Mobile>
      );
  }
}
