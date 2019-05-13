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

export default class Landing extends Component {
  constructor(props) {
    super(props);
    this.state = {
      code: '',
      name: '',
      pid: '',
      section: '',
      invalid: false,
      ready: false,
      codeSubmitted: false
    };
  }

  // update the code state so we know where to go
  handleCode = evt => {
    // if (evt.target.value.length === 0) {
    //   this.setState({
    //     code: evt.target.value.toUpperCase()
    //   });
    // }
    this.setState({
      code: evt.target.value.toUpperCase(),
      invalid: false
    });
  };

  // update the pid as the user types
  handleName(evt) {
    if (evt.target.value.length > 30) return;

    this.setState({
      name: evt.target.value
    });
  }

  // update the section as the user types
  handleSection(section) {
    this.setState({
      section
    });
  }

  // update the pid as the user types
  handlePid(evt) {
    if (evt.target.value.length > 9) return;

    this.setState({
      pid: evt.target.value.toUpperCase()
    });
  }

  // once the user enters the session code, go to that session's page
  handleCodeEntry = evt => {
    evt.preventDefault();

    // eslint-disable-next-line react/destructuring-assignment
    const code = this.state.code.toLowerCase();

    // handle invalid codes
    if (code === 'instructor' || code === 'sandbox' || code === '') {
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
        invalid: true
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
    const section = this.state.section.toLowerCase();
    /* eslint-enable react/destructuring-assignment */

    // TODO: invalid input, render error
    if (pid.length === 0 || name.length === 0 || section.length === 0) return;

    // find user by pid on database
    const user = Users.findOne({ pid });

    // find current session
    const session = Sessions.findOne({ code });

    // user exists!
    if (user) {
      // user is already a participant in this session!
      if (session.participants.includes(pid)) {
        this.setState({
          ready: true
        });
      }

      // user haven't joined this session yet
      else {
        // prepare points for this session
        Users.update(user._id, {
          $push: {
            points_history: {
              session_id: session._id,
              points: 0
            }
          },
          $set: {
            section
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
        section,
        timestamp: new Date().getTime(),
        teammates: [],
        points_history: [
          {
            session_id: session._id,
            points: 0
          }
        ],
        preference: []
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
    const { name, pid } = this.state;

    return (
      <Mobile buttonAction={this.handleLogin} hasNavbar={false}>
        {this.renderRedirect()}
        <div id="pid-container" className="field-container ugh">
          <label className="field-title" htmlFor="name">
            What is your name?{' '}
          </label>
          <div className="input-container">
            <input
              className="input-text"
              type="text"
              name="name"
              placeholder="King Triton"
              value={name}
              onChange={evt => this.handleName(evt)}
            />
          </div>
          <br />
          <label className="field-title" htmlFor="section">
            What time is your section?{' '}
          </label>
          <div>
            <Tags onSelection={evt => this.handleSection(evt)} options={['2PM', '3PM', '4PM']} />
            <br />
          </div>
          <label className="field-title" htmlFor="pid">
            What is your PID?
          </label>
          <div className="input-container">
            <input
              className="input-text"
              type="text"
              name="pid"
              placeholder="A12345678"
              value={pid}
              onChange={evt => this.handlePid(evt)}
            />
          </div>
          {/* <input className="small-button" type="submit" value="Continue" /> */}
        </div>
      </Mobile>
    );
  }

  renderSessionCode() {
    const { code, invalid } = this.state;

    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <img id="landing-logo" src="./small_dynamic.png" alt="" />

        <form id="session-form" onSubmit={evt => this.handleCodeEntry(evt)}>
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">
              Session code:
              <div className="input-container">
                <input
                  className={invalid ? 'input-text-invalid' : 'input-text'}
                  type="text"
                  name="session-code"
                  id="session-code"
                  placeholder="Enter your session code"
                  value={code}
                  onChange={evt => this.handleCode(evt)}
                />
                {invalid && <span className="invalid-input-message">A session with that code does not exist!</span>}
              </div>
            </label>
          </div>
          <input className="small-button" type="submit" value="Continue" />
        </form>
      </Wrapper>
    );
  }

  render() {
    const { codeSubmitted, code, invalid } = this.state;

    if (codeSubmitted) return this.renderLogin();
    else
      return (
        <Mobile buttonAction={this.handleCodeEntry} hasNavbar={false}>
          <JoinSection handleSubmit={this.handleCodeEntry} handleCode={this.handleCode} code={code} invalid={invalid} />
        </Mobile>
      );
    // else return this.renderSessionCode();
  }
}
