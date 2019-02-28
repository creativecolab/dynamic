import React, { Component } from 'react'
// import { Mongo } from 'meteor/mongo'
import Users from '/imports/api/users'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
// import users from '../../api/users';


export default class ChooseUsername extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }

  //TODO: re-render when username is set
  // + once username is set, save it on database


  // TODO: create user on DB, so we can get them
  // and randomly assign shapes for team formation
  saveUser(evt) {
    evt.preventDefault();
    Users.insert({name: 'name'}, () => {
      console.log('DOne!')
    });
  }

  render() {
    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <form id="username-form" onSubmit={(evt) => this.saveUser(evt)}>
          <div id="username" className="field-container">
            <label className="field-title" htmlFor="username">Please enter an appropriate username</label>
            <div className="input-container">
              <input type="text" name="username" placeholder="Type your username here" id="username"/>
            </div>
          </div>
        </form>
      </Wrapper>
    )
  }
}
