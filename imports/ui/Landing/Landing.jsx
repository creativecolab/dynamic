import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';


export default class Landing extends Component {
  static propTypes = {
    prop: PropTypes
  }

  render() {
    return (
      <Wrapper>
        <h1 id="title-dynamic">Dynamic!</h1>
        <form id="session-form">
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">Please enter session code</label>
            <div className="input-container">
              <input type="text" name="session-code" placeholder="Type your session code here" id="session-code"/>
            </div>
          </div>
        </form>
      </Wrapper>
    )
  }
}
