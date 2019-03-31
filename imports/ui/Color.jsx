import React, { Component } from 'react'
import './Color.scss';

export default class Color extends Component {
  render() {
    return (
      <div>
      <h3 id="navbar">Dynamic</h3>
      <div id="color-bar" style={{backgroundColor: this.props.color}}>
        <p>Find others with this color.</p>
        <div id="center-user">
          {this.props.username}
        </div> 
      </div>
      </div>
    )
  }
}
