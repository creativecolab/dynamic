import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Clock.scss';

export default class Clock extends Component {
  static propTypes = {
    timeLeft: PropTypes.number.isRequired
  }

  render() {
    return (
      <div id="clock" className={this.props.timeLeft < 10? "low" : "high"}>
        <div>{this.props.timeLeft}</div>
      </div>
    )
  }
}
