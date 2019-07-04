/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import posed from 'react-pose';
import Button from '../../Components/Button/Button';

import './Mobile.scss';
import MobileTimer from '../../Components/MobileTimer/MobileTimer';
import { access } from 'fs';

const Footer = posed.div({
  hidden: {
    x: -100,
    opacity: 0,
    delay: 300,
    transition: {
      x: { type: 'spring', stiffness: 1000, damping: 15 },
      default: { duration: 300 }
    }
  },
  visible: {
    x: 0,
    opacity: 1,
    transition: { duration: 150 }
  }
});

export default class Mobile extends Component {
  state = {
    loading: true
  };

  static propTypes = {
    hasFooter: PropTypes.bool,
    hasNavbar: PropTypes.bool,
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
    children: PropTypes.node,
    questionToggle: PropTypes.number,
    questionNumber: PropTypes.number,
    questionsLength: PropTypes.number
  };

  static defaultProps = {
    activityName: 'Activity name',
    hasFooter: true,
    hasNavbar: true,
    hasTimer: true,
    buttonAction: () => {
      console.log('Button action not set');
    },
    buttonTxt: 'Next',
    clockDuration: 0,
    clockStartTime: 0,
    feedbackMsge: '',
    feedbackClass: '',
    sessionStatus: 0,
    sessionLength: 0,
    children: {}
  };

  componentDidMount() {
    this.setState({
      loading: false
    });
  }

  render() {
    const { activityName, sessionStatus, sessionLength } = this.props;
    const { buttonTxt, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration } = this.props;
    const { hasFooter, hasNavbar, hasTimer } = this.props;
    const { children } = this.props;
    const { loading } = this.state;

    return (
      <div className="main">
        {hasNavbar && (
          <nav className="navbar">
            <div className="progress-status">
              <div className="activity-name">{activityName.toUpperCase()}</div>
              <div className="session-progress">
                Round {sessionStatus} out of {sessionLength}
              </div>
            </div>
            {hasTimer && <MobileTimer startTime={clockStartTime} duration={clockDuration} />}
            <hr className="navbar-hr" />
          </nav>
        )}
        <div className="content">
          {children}
          <div className={classNames('feedback-msge', feedbackClass)}>{feedbackMsge}</div>
        </div>
        {hasFooter && (
          <Footer className="footer" pose={loading ? 'hidden' : 'visible'}>
            <Button size="small" onClick={buttonAction}>
              {buttonTxt}
            </Button>
          </Footer>
        )}
      </div>
    );
  }
}
/* eslint-enable react/prefer-stateless-function */
