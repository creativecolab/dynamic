import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Survey.scss';


export default class Survey extends Component {
    
  render() {
    return (
      <div id="center-container">
      You're all done!<br></br> Please fill out our survey!
      <div><img id="small-logo" src="./dynamic.gif" alt=""/></div>
      <a id="survey-button" href="https://forms.gle/JY3cEFfBy4SBfx6C6">Continue to survey</a>
      </div>
    )
  }
}
