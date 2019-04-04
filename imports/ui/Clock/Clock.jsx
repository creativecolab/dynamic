import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';


import './Clock.scss';

export default class Clock extends Component {
  static propTypes = {
    startTime: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    // use a state to track the time left
    console.log(new Date().getTime());
    this.state = {
      timeLeft: props.totalTime - parseInt(Math.abs(props.startTime - new Date().getTime()) / 1000)
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
      timeLeft: this.props.totalTime - parseInt(Math.abs(this.props.startTime - new Date().getTime()) / 1000)
    });
  }
  
  render() {
    const percentage = parseInt(100 - (this.state.timeLeft / this.props.totalTime) * 100);
    // console.log(percentage);
    return (
      <div id="clock">
        <CircularProgressbar
        percentage={percentage}
        strokeWidth={50}
        textForPercentage={null}
        styles={{
          path: { strokeLinecap: 'butt' },
          text: { fill: '#000' },
        }}/>
      </div> 
    )
  }
}
