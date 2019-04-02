import React, { Component } from 'react';
import PropTypes from 'prop-types';

import './Clock.scss';

export default class Clock extends Component {
  static propTypes = {
    end_time: PropTypes.number.isRequired,
  }
  constructor(props) {
    super(props);
    // use a state to track the time left
    console.log(this.props.end_time);
    console.log(new Date().getTime());
    this.state = {
      time_left: Math.round((this.props.end_time) - (new Date().getTime()) / 1000)
    };
  }

  // set up timer to tick every second
  componentDidMount() {
    this.timerID = setInterval(
      () => this.tick(),
      1000
    );
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // decrease every second
  tick() {
    this.setState({
      time_left: Math.round(((this.props.end_time) - (new Date().getTime())) / 1000)
    });
  }
  
  // TODO: color the clock
  render() {
    return (
      <div id="clock" className={this.state.time_left < 15? "low" : "high"}>
        <div>{this.state.time_left}</div>
      </div>
    )
  }
}
