import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Sessions from '../../api/sessions';
import Users from '../../api/users';

import Tags from '../Components/Tags/Tags';
import Wrapper from '../Wrapper/Wrapper';
import JoinSection from './Components/JoinSection/JoinSection';
import Mobile from '../Layouts/Mobile/Mobile';
import TextInput from '../Components/TextInput/TextInput';

import '../assets/_main.scss';
import './Landing.scss';
import SessionEnd from '../SessionProgress/Components/SessionEnd';
import SessionEnums from '../../enums/sessions';

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

  // // update the pid as the user types
  // handleName = evt => {
  //   if (evt.target.value.length > 30) return;

  //   this.setState({
  //     name: evt.target.value
  //   });
  // };

  // update the pid as the user types
  handlePid = evt => {
    if (evt.target.value.length > 20) return;

    this.setState({
      pid: evt.target.value
    });
  };

  // once the user enters the session code, try go to that session's page
  handleCodeSubmission = () => {
    // eslint-disable-next-line react/destructuring-assignment
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
      this.setState({
        codeSubmitted: true
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
    // evt.preventDefault();

    const { name } = this.state;

    /* eslint-disable react/destructuring-assignment */
    const pid = this.state.pid.toLowerCase().trim();
    const code = this.state.code.toLowerCase().trim();
    /* eslint-enable react/destructuring-assignment */

    // if (name.length === 0) {
    //   this.setState({
    //     invalidName: true
    //   });

    //   return;
    // } else {
    //   this.setState({
    //     invalidName: false
    //   });
    // }

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

    // find current session
    const session = Sessions.findOne({ code });

    // user exists!
    if (user) {
      // user is already a participant in this session! TODO: handle case where two diff people enter the same username >:O
      if (session.participants.includes(pid)) {
        this.setState({
          pidSubmitted: true
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
            if (session.status === SessionEnums.status.ACTIVE) {
              Meteor.call(
                'sessions.updateTeamHistory_LateJoinees',
                session.participants,
                pid,
                session.teamHistory,
                session._id,
                (err, res) => {
                  if (err) {
                    alert(err);
                  } else {
                    // success!
                    console.log('\nSuccessfully joined late. ' + res);
                  }
                }
              );
            }

            this.setState({
              pidSubmitted: true
            });
          }
        );
      }
    }

    // creating user for the first time! AKA signup
    else {
      // create db object
      Users.insert({
        name,
        pid,
        joinTime: new Date().getTime(),
        teamHistory: [],
        sessionHistory: [
          {
            session_id: session._id,
            sessionJoinTime: new Date().getTime(),
            points: 0
          }
        ],
        preferences: []
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
          if (session.status === SessionEnums.status.ACTIVE) {
            Meteor.call(
              'sessions.updateTeamHistory_LateJoinees',
              session.participants,
              pid,
              session.teamHistory,
              session._id,
              (err, res) => {
                if (err) {
                  alert(err);
                } else {
                  // success!
                  console.log('\nSuccessfully joined late.');
                }
              }
            );
          }

          this.setState({
            pidSubmitted: true
          });
        }
      );
    }
  };

  handleConfirmation = () => {
    this.setState({
      ready: true
    });
  }

  renderLogin() {
    const { name, pid, invalidName, invalidPID } = this.state;

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
            invalidMsg="That key is not recognized!"
            label="Please enter the 4-digit key given to you by email."
            placeholder="abcd"
          />
        </div>
      </Mobile>
    );
  }

  renderConfirmation() {

    const { pid } = this.state;
    const user = Users.findOne({ pid });

    return (
      <Mobile buttonAction={this.handleConfirmation} buttonTxt={"Yes"} hasNavbar={false}>
        {this.renderRedirect()}
        <div className="confirmation">
          <div className="question">Is this you?</div>
          <div className="name">Name: <strong>{user.name}</strong></div>
          <div className="skill">Jedi or Wizard?: <strong>{user.skill}</strong></div>
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
