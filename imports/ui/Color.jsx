import React, { Component } from 'react'

export default class Color extends Component {
  render() {
    return (
      <div style={{width: '100%', height: '100%', backgroundColor: this.props.color}}>
        {this.props.children}
      </div>
    )
  }
}
