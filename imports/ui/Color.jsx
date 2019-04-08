import React, { Component } from 'react'
import './Color.scss';

export default class Color extends Component {
  render() {
    const {shape, color} = this.props;
    return (
      <div>
      <h3 id="navbar">Dynamic</h3>
      <div id="color-bar">
        <div>Find others with this shape</div>
        <img className="shape" src={"/shapes/" + shape + "-solid-" + color + ".png.png"} alt={color + " " + shape}/>
      </div>
      </div>
    )
  }
}
