import React, { Component } from 'react'
import Button from '../../Components/Button/Button';
import PropTypes from 'prop-types'

import './Standard.scss';
import MobileTimer from '../../Components/MobileTimer/MobileTimer';

export default class Standard extends Component {
  static propTypes = {
    hasFooter: PropTypes.bool,
    buttonAction: PropTypes.func,
    buttonTxt: PropTypes.string,
    activityName: PropTypes.string,
    sessionStatus: PropTypes.number,
    clockDuration: PropTypes.number,
    clockStartTime: PropTypes.number,
  }

  static defaultProps = {
    hasFooter: true,
    buttonAction: () => {
      console.log('Clicked!');
    },
    buttonTxt: 'Click me',
    activityName: 'No activity',
    sessionStatus: 'No status',
    clockStartTime: new Date().getTime(),
    clockDuration: 0
  }

  constructor(props) {
    super(props);
    this.state = {
      buttonAction: props.buttonAction,
      buttonTxt: props.buttonTxt,
      activityName: props.activityName,
      sessionStatus: props.sessionStatus,
      clockStartTime: props.clockStartTime,
      clockDuration: props.clockDuration
    }
  }

  // sets up the footer button, called from above
  setUpButton(action, buttonTxt) {
    this.setState({
      buttonAction: action,
      buttonTxt,
    });
  }

  // sets up the navbar, called from above
  setUpNavbar(activityName, sessionStatus) {
    this.setState({
      activityName,
      sessionStatus
    });
  }

  // start time: date().getTime() integer
  setTimer(clockStartTime, clockDuration) {
    this.setState({
      clockStartTime,
      clockDuration
    });
  }

  render() {
    const { buttonTxt, buttonAction, activityName, sessionStatus } = this.state;
    const { clockStartTime, clockDuration } = this.state;
    const { hasFooter, children } = this.props;
    return (
      <div className="main">
        <nav className="navbar">
          <div className="progress-status">
            <div className="activity-name">{activityName.toUpperCase()}</div>
            <div className="session-progress">Round {sessionStatus}</div>
          </div>
          <MobileTimer startTime={clockStartTime} duration={clockDuration} />
        </nav>
        <div className="content">{children}</div>
        {hasFooter && <footer className="footer">
          <Button size="small" onClick={buttonAction}>{buttonTxt}</Button>
        </footer>}
      </div>
    )
  }
}
