import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Waiting extends Component {
  static propTypes = {
    text: PropTypes.string.isRequired,
  }

  static defaultProps ={
      text: 'Waiting for your instructor to begin...'
  }

  render() {
    const {text} = this.props; 
    return (
      <div>
      {text}
      <img id="moving-logo" src="./dynamic.gif" alt=""/>
      </div>
    )
  }
}



