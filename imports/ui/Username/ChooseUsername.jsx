import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';


export default class ChooseUsername extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }

  backToHome() {    
    window.location = '/';
  }

  //TODO: re-render when username is set

  render() {
    return (
      <Wrapper>
        <button onClick={() => this.backToHome()} id="back-button">back</button>
        <h1 id="title-dynamic">Dynamic!</h1>
        <form id="username-form">
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
