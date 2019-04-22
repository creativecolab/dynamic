import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import { Redirect } from 'react-router-dom'
import Sessions from "../../api/sessions";
import Users from "../../api/users";
import '../assets/_main.scss';
import './Landing.scss';
import SessionHandler from '../Handlers/SessionHandler/SessionHandler';
import Tags from '../Components/Tags/Tags';

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
  handleCode(evt) {
    this.setState({
      code: evt.target.value.toUpperCase()
    });
  }

  // update the pid as the user types
  handleName(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      name: evt.target.value
    });
  }

  // update the section as the user types
  handleSection(evt) {
    if (evt.target.value.length > 3) return;
    this.setState({
      section: evt.target.value
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
  handleCodeEntry(evt) {
    evt.preventDefault();

    const code = this.state.code.toLowerCase();

    // handle invalid codes
    if (code === "instructor" || code === "sandbox" || code === "") {
      return;
    }

    // check if session exists
    const session = Sessions.findOne({code});
    if (session) {
      this.setState({
        codeSubmitted: true,
      });  
    } else {
      this.setState({
        invalid: true
      });
    }
  }

  // will redirect to the main session page
  renderRedirect = () => {

    const pid = this.state.pid.toLowerCase();

    if (this.state.ready) {
      return <Redirect to={{
        pathname: '/' + this.state.code.toLowerCase(),
        state: {pid}
      }}/>
    }
  }

  // TODO: maybe -- use localStorage to suggest login
  handleLogin(evt) {
    evt.preventDefault();

    const { name } = this.state;
    const pid = this.state.pid.toLowerCase();
    const code = this.state.code.toLowerCase();
    const section = this.state.section.toLowerCase();

    // TODO: invalid input, render error
    if (pid.length === 0 || name.length === 0 || section.length === 0) return;

    // find user by pid on database
    const user = Users.findOne({pid});

    // find current session
    const session = Sessions.findOne({code});

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
            },
          },
          $set: {
            section: this.state.section
          }
        });

        // add user to session
        Sessions.update(session._id, {
          $push: {
            participants: pid
          }
        }, () => {
          this.setState({
            ready: true
          });
        });
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
        points_history: [{
          session_id: session._id,
          points: 0
        }],
        preference: []
      });

      // add user to session
      Sessions.update(session._id, {
        $push: {
          participants: pid
        }
      }, () => {
        this.setState({
          ready: true
        });
      });
    }    
  }

  renderLogin() {
    const { name, section, pid } = this.state;
    return (
      <Wrapper>
        {this.renderRedirect()}
        <form id="pid-form" onSubmit={(evt) => this.handleLogin(evt)}>
          <div id="pid-container" className="field-container">
            <label className="field-title" htmlFor="name">What is your name? </label>
            <div className="input-container">
              <input className="input-text" type="text" name="name" placeholder="King Triton" value={name} onChange={(evt) => this.handleName(evt)}/>
            </div><br></br>
            <label className="field-title" htmlFor="section">What time is your section? </label>
            {/* <div className="input-container">
              <input className="input-text" type="text" name="section" placeholder="2pm, 3pm, or 4pm" value={section} onChange={(evt) => this.handleSection(evt)}/>
            </div><br></br> */}
            <Tags></Tags>
            <label className="field-title" htmlFor="pid">What is your PID?</label>
            <div className="input-container">
              <input className="input-text" type="text" name="pid" placeholder="A12345678" value={pid} onChange={(evt) => this.handlePid(evt)}/>
            </div>
            <input className="small-button" type="submit" value="Continue"/>
          </div>
        </form>
      </Wrapper>
    )
  }

  renderSessionCode() {
    const { code, invalid } = this.state;
    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <img id="landing-logo" src="./small_dynamic.png" alt=""/>

        {/* FORM BEGINS HERE */}
        <form id="session-form" onSubmit={(evt) => this.handleCodeEntry(evt)}>

          {/* FIRST INPUT */}
          <div id="session-code" className="field-container">

            {/* INPUT LABEL */}
            <label className="field-title" htmlFor="session-code">Session code:</label> 

            {/* DIV THAT HOLDS THE INPUT FIELD */}
            <div className="input-container">

              {/* INPUT FIELD, NOTE THAT THE CLASS CHANGES BASED ON THE STATE OF THIS COMPONENT */}
              <input className={invalid? "input-text-invalid" : "input-text"} type="text"
                name="session-code" placeholder="Enter your session code"
                value={code} onChange={(evt) => this.handleCode(evt)}/>
              
              {/* MESSAGE THAT APPEARS IF THE INPUT IS INVALID, SOME INPUTS MIGHT NOT NEED THIS */}
              {invalid && <span className="invalid-input-message">A session with that code does not exist!</span>}
            </div>
          
          {/* FIRT INPUT ENDS HERE, MAKE A COPY OF THIS DIV IF YOU NEED MORE INPUTS IN THE FORM */}
          </div>

          {/* CONTINUE BUTTON */}
          <input className="small-button" type="submit" value="Continue"/>

        </form>
      </Wrapper>
    );
  }

  render() {
    const { codeSubmitted, ready } = this.state;
    const pid = this.state.pid.toLowerCase();
    const code = this.state.code.toLowerCase();
    // if (ready) return <SessionHandler pid={pid} code={code}/>
    if (codeSubmitted) return this.renderLogin();
    else return this.renderSessionCode();
  }
}
