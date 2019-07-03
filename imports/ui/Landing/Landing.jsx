import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';
import Wrapper from '../Wrapper/Wrapper';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import '../assets/_main.scss';
import './Landing.scss';
import Tags from '../Components/Tags/Tags';
import JoinSection from './Components/JoinSection/JoinSection';
import Mobile from '../Layouts/Mobile/Mobile';
import TextInput from '../Components/TextInput/TextInput';

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
      codeSubmitted: false
    };
  }

  // update the code state so we know where to go
  handleCode = evt => {
    this.setState({
      code: evt.target.value.toUpperCase(),
      invalidCode: false
    });
  };

  // update the pid as the user types
  handleName = evt => {
    if (evt.target.value.length > 30) return;

    this.setState({
      name: evt.target.value
    });
  };

  // update the section as the user types -- deprecated currently
  // handleSection(section) {
  //   this.setState({
  //     section
  //   });
  // }

  // update the pid as the user types
  handlePid = evt => {
    if (evt.target.value.length > 20) return;

    this.setState({
      pid: evt.target.value
    });
  };

  // once the user enters the session code, try go to that session's page
  handleCodeSubmission = evt => {
    evt.preventDefault();

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
  handleLogin = evt => {
    evt.preventDefault();

    const { name } = this.state;

    /* eslint-disable react/destructuring-assignment */
    const pid = this.state.pid.toLowerCase();
    const code = this.state.code.toLowerCase();
    /* eslint-enable react/destructuring-assignment */

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

    if (pid.length === 0) {
      this.setState(
        {
          invalidPID: true
        }
      );
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
          ready: true
        });
      }

      // user hasn't joined this session yet
      else {
        // prepare points for this session, note the session join time
        Users.update(user._id, {
          $push: {
            points_history: {
              session_id: session._id,
              sessionJoinTime: new Date().getTime(),
              points: 0
            }
          },
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
            this.setState({
              ready: true
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
        pointsHistory: [
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
          this.setState({
            ready: true
          });
        }
      );
    }
  };

  renderLogin() {
    const { name, pid, invalidName, invalidPID } = this.state;

    return (
      <Mobile buttonAction={this.handleLogin} hasNavbar={false}>
        {this.renderRedirect()}
        <div className="login-main">
          {/* <div>Please fill the information below to participate</div>
          <hr /> */}
          <TextInput
            name="name"
            onSubmit={this.handleLogin}
            onChange={this.handleName}
            value={name}
            invalid={invalidName}
            invalidMsg="Not a valid name!"
            label="What is your name?"
            placeholder="King Triton"
          />
          <TextInput
            name="pid"
            onSubmit={this.handleLogin}
            onChange={this.handlePid}
            value={pid}
            invalid={invalidPID}
            invalidMsg="Not a valid username!"
            label="What do you want your username to be?"
            placeholder="XxKingTxX"
          />
          {/* <Tags
            label="What time is your section?"
            onSelection={evt => this.handleSection(evt)}
            options={['2PM', '3PM', '4PM']}
          /> */}
        </div>
      </Mobile>
    );
  }

  // renderSessionCode() {
  //   const { code, invalidCode } = this.state;

  //   return (
  //     <Wrapper>
  //       <h1 id="title-dynamic">Dynamic!</h1>
  //       <img id="landing-logo" src="./small_dynamic.png" alt="" />

  //       <form id="session-form" onSubmit={evt => this.handleCodeSubmission(evt)}>
  //         <div id="session-code" className="field-container">
  //           <label className="field-title" htmlFor="session-code">
  //             Session code:
  //             <div className="input-container">
  //               <input
  //                 className={invalidCode ? 'input-text-invalid' : 'input-text'}
  //                 type="text"
  //                 name="session-code"
  //                 id="session-code"
  //                 placeholder="Enter your session code"
  //                 value={code}
  //                 onChange={evt => this.handleCode(evt)}
  //               />
  //               {invalidCode && <span className="invalid-input-message">A session with that code does not exist!</span>}
  //             </div>
  //           </label>
  //         </div>
  //         <input className="small-button" type="submit" value="Continue" />
  //       </form>
  //     </Wrapper>
  //   );
  // }

  render() {
    const { codeSubmitted, code, invalidCode } = this.state;

    if (codeSubmitted) return this.renderLogin();
    else
      return (
        <Mobile buttonAction={this.handleCodeSubmission} hasNavbar={false}>
          <JoinSection handleSubmit={this.handleCodeSubmission} handleCode={this.handleCode} code={code}
            invalid={invalidCode} invalidMsg='A session with that code does not exist!' />
        </Mobile>
      );
  }
}
