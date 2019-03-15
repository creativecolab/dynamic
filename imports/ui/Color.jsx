import React, { Component } from 'react'

export default class Color extends Component {
  render() {
    return (
      <div style={{ display: 'flex', position: 'absolute', top: 0, left: 0, fontSize: '50px', width: '100%', height: '100px', color: 'white', backgroundColor: this.props.color}}>
        <div style={{margin: 'auto'}}>
          {this.props.username}
        </div> 
      </div>
    )
  }
}
