import React, { Component } from 'react';
import PropTypes from 'prop-types';
import CircularProgressbar from 'react-circular-progressbar';


import './Clock.scss';

export default class Clock extends Component {
  static propTypes = {
    startTime: PropTypes.number.isRequired,
    totalTime: PropTypes.number.isRequired,
    big: PropTypes.bool
  }

  static defaultProps = {
    big: false
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
    if (this.state.timeLeft < 0) {
      return "";
    }
    const clock = new Date(2019, 0, 0, 0, this.state.timeLeft / 60, this.state.timeLeft % 60);
    const clockString = clock.getMinutes() + ':' + (clock.getSeconds() === 0 ? '00' : clock.getSeconds());
    return <p id="timer">{clockString}</p>;

    /* Progress Bar code, no longer in use */
    // let percentage = parseInt(100 - (this.state.timeLeft / this.props.totalTime) * 100);
    // percentage = percentage < 0 ? 0 : percentage;

    // if (!this.props.big) {
    //   return (
    //     <div id="clock">
    //       <CircularProgressbar
    //         percentage={percentage}
    //         strokeWidth={50}
    //         text={this.state.timeLeft}
    //         styles={{
    //           path: { strokeLinecap: 'butt', transition: 'stroke-dashoffset 0.5s ease 0s', stroke: '#1E91D6' },
    //           text: { fill: '#000', fontSize: '60px' }
    //         }} />
    //     </div>
    //   )
    // } else {
    // return (
    //   <div className="big-clock">
    //     <p>{clockString}</p>
    {/* <CircularProgressbar
          percentage={percentage}
          text={this.state.timeLeft}
          strokeWidth={5}
          styles={{
            path: {
              // Tweak path color:
              stroke: '#1E91D6',
              // Tweak path to use flat or rounded ends:
              strokeLinecap: 'butt',
              // Tweak transition animation:
              transition: 'stroke-dashoffset 0.5s ease 0s',
            },
            // Customize the circle behind the path
            trail: {
              // Tweak the trail color:
              stroke: '#d6d6d6',
            },
            // Customize the text
            text: {
              // Tweak text color:
              fill: '#1E91D6',
              // Tweak text size:
              fontSize: '60px',
            },
          }}
        /> */}
    // </div>)
    // }
  }
}
