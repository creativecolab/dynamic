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
      Meteor.call('users.addUser', pid, () => {
        localStorage.setItem("pid", pid);
        this.setState({
          pid: pid,
          pidSubmitted: true,
          codeSubmitted: true
        });
      });

    }

    // invalid session code
    else {
      this.setState({
        invalidCode: true
      });
    }
  };

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

  // TODO: maybe -- use localStorage to suggest login
  handleLogin = () => {
    const pid = this.state.pid.toLowerCase().trim();

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

    // find user by pid on database
    const user = Users.findOne({ pid });

    // user exists!
    if (user) {
      // user is already a participant in this session! TODO: handle case where two diff people enter the same username >:O
      this.setState({
        pidSubmitted: true,
        name: user.name
      });
    }

    // creating user for the first time! AKA signup
    else {
      // NOT ALLOWED, must use a key that we gave to them
      this.setState({
        invalidPID: true
      });

      // // create db object
      // Users.insert({
      //   name,
      //   pid,
      //   joinTime: new Date().getTime(),
      //   teamHistory: [],
      //   sessionHistory: [
      //     {
      //       session_id: session._id,
      //       sessionJoinTime: new Date().getTime(),
      //       points: 0
      //     }
      //   ],
      //   preferences: []
      // });

      // // add user to session
      // Sessions.update(
      //   session._id,
      //   {
      //     $push: {
      //       participants: pid
      //     }
      //   },
      //   () => {
      //    console.log(pid + " successfully joined the session!");

      //    this.setState({
      //      pidSubmitted: true,
      //      name: user.name
      //    });
      //   }
      // );
    }
  };

  handleConfirmation = () => {
    const pid = this.state.pid.toLowerCase().trim();
    const name = this.state.name.trim();
    const code = this.state.code.toLowerCase().trim();

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

    // update the user's name to their preferred name
    Users.update(user._id, {
      $set: {
        name
      }
    });

    // find current session
    const session = Sessions.findOne({ code });

    if (session.participants.includes(pid)) {
      this.setState({
        ready: true
      });
    }

    // user hasn't joined this session yet
    else {
      // prepare points for this session, note the session join time
      Users.update(user._id, {
        $push: {
          sessionHistory: {
            session_id: session._id,
            sessionJoinTime: new Date().getTime(),
            points: 0
          }
        }
      });

      // add user to session
      Sessions.update(
        session._id,
        {
          $push: {
            participants: pid
          }
        },
        () => {
          console.log(pid + ' successfully joined the session!');
          this.setState({
            ready: true
          });
        }
      );
    }
  };

  renderLogin() {
    const { pid, invalidPID } = this.state;

    return (
      <Mobile buttonAction={this.handleLogin} hasNavbar={false}>
        <div className="login-main">
          {/* <TextInput
            name="name"
            onSubmit={this.handleLogin}
            onChange={this.handleName}
            value={name}
            invalid={invalidName}
            invalidMsg="Not a valid name!"
            label="What is your name?"
            placeholder="Jane Doe"
          /> */}
          <TextInput
            name="pid"
            onSubmit={this.handleLogin}
            onChange={this.handlePid}
            value={pid}
            invalid={invalidPID}
            invalidMsg="Invalid key!"
            label="Please enter your code"
            placeholder="7"
          />
        </div>
      </Mobile>
    );
  }

  renderConfirmation() {
    const { name, invalidName } = this.state;

    return (
      <Mobile buttonAction={this.handleConfirmation} buttonTxt="Yes" hasNavbar={false}>
        {this.renderRedirect()}
        <div className="confirmation">
          <TextInput
            name="name"
            onSubmit={this.handleConfirmation}
            onChange={this.handleName}
            value={name}
            invalid={invalidName}
            invalidMsg="Invalid Name!"
            label="Is this your preferred name?"
            placeholder="Enter your preferred name here."
          />
        </div>
      </Mobile>
    );
  }

  render() {
    const { codeSubmitted, pidSubmitted, code, invalidCode } = this.state;

    if (pidSubmitted) return this.renderConfirmation();

    if (codeSubmitted) return this.renderLogin();
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
