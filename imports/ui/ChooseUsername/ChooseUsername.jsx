import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Users from '../../api/users'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import Sessions from '../../api/sessions';
import Color from '../Color';
import Activity from '../Activity/Activity';

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
      ready: false
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

    if (user) {
      console.log('User exists!');
      this.setState({
        taken: true
      });
    } else {
      Users.insert({
        username,
        teammates: []
      }, () => {        

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
    const { ready, username } = this.state;

    // session not available yet TODO: return loading component
    if (!this.props.session) return "";

    // user entered their name!
    if (ready) {
      
      // get status and participants of session
      const { _id, participants } = this.props.session;

      return <Activity username={username} session_id={_id} participants={participants}/>

      // // session is active!
      // // TODO: decide between redirect or this
      // if (status === 1) {
        
      // }
      
      // // waiting for instructor... TODO: make this a component
      // else {
      //   return (
      //     <Wrapper><h1>Waiting for more people to join...</h1><h2>There are currently {this.props.session.participants.length}</h2></Wrapper>
      //   )
      // }
    }

    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <h2>Session: {code}</h2>
        <form id="username-form" onSubmit={(evt) => this.saveUser(evt)}>
          <div id="username" className="field-container">
            {this.renderUsernameTaken()}
            <label className="field-title" htmlFor="username">Username</label>
            <div className="input-container">
              <input type="text" name="username" placeholder="Enter your username" id="username" value={this.state.username} onChange={(evt) => this.handleChange(evt)}/>
            </div>
            <input type="submit" value="Next"/>
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