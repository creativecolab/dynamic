import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Users from '../../api/users'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import Sessions from '../../api/sessions';

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
    } else {
      Users.insert({
        username,
        teammates: []
      }, () => {        

        // add user to session
        Sessions.update(this.props.session._id, {
          $push: {
            participants: {username}
          }
        });

        this.setState({
          username: '',
          ready: true
        });
      });
    }    
  }

  render() {
    const code = this.props.match.params.code;
    const { ready } = this.state;

    // user entered their name!
    if (ready) {

      // TODO: fix this, prop might not exist yet
      if (this.props.session.status === 1) {
        return <Wrapper><h1>You color is blue!!</h1></Wrapper>
      } else {
        return (
          <Wrapper><h1>Waiting for more people...</h1></Wrapper>
        )
      }
    }

    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <h2>Session: {code}</h2>
        <form id="username-form" onSubmit={(evt) => this.saveUser(evt)}>
          <div id="username" className="field-container">
            <label className="field-title" htmlFor="username">Username</label>
            <div className="input-container">
              <input type="text" name="username" placeholder="Enter your username" id="username" value={this.state.username} onChange={(evt) => this.handleChange(evt)}/>
            </div>
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