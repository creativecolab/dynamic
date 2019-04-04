import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Users from '../../api/users'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import Sessions from '../../api/sessions';
import Color from '../Color';
import Activity from '../Activity/Activity';

import './Login.scss';

class Login extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }

  constructor(props) {
    super(props);
    this.state = {
      name: '',
      pid: '',
      ready: false,
      invalid: false,
      localUser: localStorage.getItem('pid')
    };
  }


  // update the pid as the user types
  handleName(evt) {
    this.setState({
      name: evt.target.value
    });
  }

  // update the pid as the user types
  handleChange(evt) {
    this.setState({
      pid: evt.target.value
    });
  }

  getUserFromLocalStorage() {
    if (this.state.saved) {

    }
  }

  // TODO: use localStorage to suggest login
  login(evt) {
    evt.preventDefault();

    const { pid, name } = this.state;

    if (pid.length === 0 /*|| firstname.length === 0 || lastname.length === 0*/) return;

    // find user by pid on database
    const user = Users.findOne({pid});

    // user exists!
    if (user) {

      // user is already a participant in this session!
      // TODO: something went wrong.. i.e., refreshed
      if (this.props.session.participants.includes(pid)) {
        this.setState({
          ready: true
        });
        return;
      }

      // add user to session
      Sessions.update(this.props.session._id, {
        $push: {
          participants: pid
        }
      }, () => {
        this.setState({
          ready: true
        });
      });

    } else {
      Users.insert({
        name,
        pid,
        teammates: []
      });
      // add user to session
      Sessions.update(this.props.session._id, {
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

  // will alert the user that there pid is not valid
  renderUsernameTaken = () => {
    if (this.state.invalid) {
      return <p style={{color:"red"}}>That PID is invalid!</p>
    }
  }

  signup() {    
    const { code } = this.props.session;
    console.log(code);
    window.location = "/" + code + "/signup";
  }

  render() {

    // session not available yet TODO: return loading component
    if (!this.props.session) return "Loading...";

    const { ready } = this.state;

    const pid = this.state.pid; // || localStorage.getItem("pid");

    // user entered their name!
    // at this point, user is logged in!
    if (ready) {

      // get session_id
      const { _id, status } = this.props.session;

      // session is over...
      if (status === 2) return <Wrapper><h2>Thanks for participating! Please fill out <a href="https://forms.gle/ATh7tQC5LFf547h19">this survey</a>.</h2></Wrapper>

      return <Activity pid={pid} session_id={_id} />
    }

    return (
      <Wrapper>
        <h3 id="navbar">Dynamic</h3>
        <form id="pid-form" onSubmit={(evt) => this.login(evt)}>
          <div id="pid" className="field-container">
            {this.renderUsernameTaken()}
            <div className="container">
            <label className="field-title" htmlFor="first">What is your name? </label>
            <div className="input-container" id="padding">
              <input className="u-container" type="text" name="first" placeholder="King Triton" value={this.state.name} onChange={(evt) => this.handleName(evt)}/>
            </div><br></br>
            <label className="field-title" htmlFor="pid">What is your PID?</label>
            <div className="input-container"id="padding">
              <input className="u-container" type="text" name="pid" placeholder="A12345678" value={this.state.pid} onChange={(evt) => this.handleChange(evt)}/>
            </div>
            </div>
            <input id="next_button" type="submit" value="Continue"/>
          </div>
        </form>
      </Wrapper>
    )
  }
}

export default withTracker((props) => {
  const session = Sessions.findOne({code: props.match.params.code});
  return { session }
})(Login);