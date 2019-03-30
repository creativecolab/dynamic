import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Users from '../../api/users'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import Sessions from '../../api/sessions';
import Color from '../Color';
import Activity from '../Activity/Activity';

import './ChooseUsername.scss';

class ChooseUsername extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }

  //TODO: re-render when username is set
  // + once username is set, save it on database

  constructor(props) {
    super(props);
    this.state = {
      username: '',
      taken: false,
      ready: false //localStorage.getItem('username') != null
    };
  }

  //update the session_code state so we know where to go
  handleChange(evt) {
    this.setState({
      username: evt.target.value
    });
  }

  // TODO: create team formation activity and
  // randomly assign shapes for users
  saveUser(evt) {
    evt.preventDefault();
    const { username } = this.state;

    const user = Users.findOne({username});

    if (username.length === 0) return;

    if (user) {
      console.log('User exists!');
      this.setState({
        taken: true,
        ready: true
      });
    } else {
      Users.insert({
        username,
        teammates: []
      }, () => {
        
        // save username locally
        // localStorage.setItem('username', username);

        // add user to session
        Sessions.update(this.props.session._id, {
          $push: {
            participants: username
          }
        }, () => {
          this.setState({
            taken: false,
            ready: true
          });
        });
      });
    }    
  }

  //will alert the user that there username is not valid
  renderUsernameTaken = () => {
    if (this.state.taken) {
      return <p style={{color:"red"}}>That username is already taken! Please choose another one.</p>
    }
  }

  render() {
    const code = this.props.match.params.code;
    const { ready } = this.state;

    // TODO: might be a problem
    const username = this.state.username;// || localStorage.getItem("username");

    // session not available yet TODO: return loading component
    if (!this.props.session) return "";

    // user entered their name!
    // at this point, user is logged in!
    if (ready) {

      // get session_id
      const { _id } = this.props.session;

      return <Activity username={username} session_id={_id} />
    }

    return (
      
 <Wrapper>
   <h3 id="navbar">Dynamic</h3>
        <h2>Session: {code}</h2>

        <form id="username-form" onSubmit={(evt) => this.saveUser(evt)}>
          <div id="username" className="field-container">
            {this.renderUsernameTaken()}
            <label className="field-title" htmlFor="username">Username: </label>
            <div className="input-container">
              <input className="u-container" type="text" name="username" placeholder="Enter your username" id="username" value={this.state.username} onChange={(evt) => this.handleChange(evt)}/>
            </div>
            <input id="next_button" type="submit" value="Continue"/>
          </div>
        </form>
      </Wrapper>
    )
  }
}

export default withTracker((props) => {
  const users = Users.find().fetch();
  const session = Sessions.findOne({code: props.match.params.code});
  return { users, session }
})(ChooseUsername);