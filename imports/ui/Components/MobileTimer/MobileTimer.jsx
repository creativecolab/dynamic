import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';


import './MobileTimer.scss';

export default class MobileTimer extends Component {
  static propTypes = {
    startTime: PropTypes.number.isRequired,
    duration: PropTypes.number.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      timeLeft: props.duration - parseInt(Math.abs(props.startTime - new Date().getTime()) / 1000)
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
    //if (this.state.timeLeft <= 0) return; NONO, doesn't account for props taking a while to update
    this.setState({
      timeLeft: this.props.duration - parseInt(Math.abs(this.props.startTime - new Date().getTime()) / 1000)
    });
  }

  render() {
    if (this.state.timeLeft < 0) {
      return "";
    }
    let percentage = parseInt(100 - (this.state.timeLeft / this.props.duration) * 100);
    percentage = percentage < 0 ? 0 : percentage;
    return (
      <div id="mobile-timer" >
        <CircularProgressbar
          percentage={percentage}
          strokeWidth={50}
          text={this.state.timeLeft}
          styles={{
            path: {
              strokeLinecap: 'butt',
              transition: 'stroke-dashoffset 0.5s ease 0s',
              stroke: this.state.timeLeft < 10 ? '#F05D5E' : '#1E91D6'
            },
            text: {
              fill: '#000',
              fontSize: '60px'
            }
          }} />
      </div>
    )
  }
}
