import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';

import './Clock.scss';

export default class Clock extends Component {
  static propTypes = {
    startTime: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired
  };

  // static defaultProps = {
  //   startTime: 0,
  //   totalTime: 0
  // };

  constructor(props) {
    super(props);
    // use a state to track the time left
    this.state = {
      timeLeft: props.totalTime - parseInt(Math.abs(props.startTime - new Date().getTime()) / 1000)
    };
  }

  // set up timer to tick every second
  componentDidMount() {
    this.timerID = setInterval(() => this.tick(), 1000);
  }

  componentWillUnmount() {
    clearInterval(this.timerID);
  }

  // decrease every second
  tick() {
    const { totalTime, startTime } = this.props;

    this.setState({
      timeLeft: totalTime - parseInt(Math.abs(startTime - new Date().getTime()) / 1000)
    });
  }

  render() {
    const { timeLeft } = this.state;

    if (timeLeft < 0) {
      return '';
    }

    const clock = new Date(2019, 0, 0, 0, timeLeft / 60, timeLeft % 60);
    const clockString =
      clock.getMinutes() + ':' + (clock.getSeconds() < 10 ? '0' + clock.getSeconds() : clock.getSeconds());

    return <>{clockString}</>;
  }
}
