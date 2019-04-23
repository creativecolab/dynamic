import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './Waiting.scss'; 

export default class Waiting extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  }

  static defaultProps ={
      text: 'Wait for your instructor to begin'
  }

  render() {
    const {text} = this.props; 
    return (
      <div id="center-container">
      {text}
      <div><img id="moving-logo" src="./dynamic.gif" alt=""/></div>
      </div>
    )
  }
}



