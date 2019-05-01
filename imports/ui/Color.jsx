import React, { Component } from "react";
import "./Color.scss";

export default class Color extends Component {
  render() {
    const { shape, color } = this.props;
    return (
      <div>
        <h2 id="text-spacing">Find others with this shape and color</h2>
        <img
          className="shape"
          src={"/shapes/" + shape + "-solid-" + color + ".png.png"}
          alt={color + " " + shape}
        />
      </div>
    );
  }
}
