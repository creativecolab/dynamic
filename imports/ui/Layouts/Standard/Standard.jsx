import React, { Component } from 'react'
import Button from '../../Components/Button/Button';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';


import './Standard.scss';
import MobileTimer from '../../Components/MobileTimer/MobileTimer';

export default class Standard extends Component {
  static propTypes = {
    hasFooter: PropTypes.bool,
    hasTimer: PropTypes.bool,
    buttonAction: PropTypes.func,
    buttonTxt: PropTypes.string,
    activityName: PropTypes.string,
    sessionStatus: PropTypes.number,
    sessionLength: PropTypes.number,
    clockDuration: PropTypes.number,
    clockStartTime: PropTypes.number,
    feedbackMsge: PropTypes.string,
    feedbackClass: PropTypes.string,
  };

  static defaultProps = {
    hasFooter: true,
    hasTimer: true,
    buttonAction: () => {console.log('Button action not set')},
    buttonTxt: "Next",
    feedbackClass: "",
    sessionStatus: 0,
    sessionLength: 0
  };

  render() {
    const { activityName, sessionStatus, sessionLength } = this.props;
    const { buttonTxt, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration } = this.props;
    const { hasFooter, hasTimer } = this.props;
    const { children } = this.props;

    return (
      <div className="main">
        <nav className="navbar">
          <div className="progress-status">
            <div className="activity-name">{activityName.toUpperCase()}</div>
            <div className="session-progress">Activity {sessionStatus} out of {sessionLength}</div>
          </div>
          {hasTimer && <MobileTimer startTime={clockStartTime} duration={clockDuration} />}
        </nav>
        <div className="content">
          {children}
          <div className={classNames("feedback-msge", feedbackClass)}>{feedbackMsge}</div>
        </div>
        {hasFooter && <footer className="footer">
          <Button size="small" onClick={buttonAction}>{buttonTxt}</Button>
        </footer>}
      </div>
    )
  }
}
