/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import posed from 'react-pose';
import { access } from 'fs';

import Button from '../../Components/Button/Button';
import Clock from '../../Clock/Clock';
import Loading from '../../Components/Loading/Loading';

import './BigScreen.scss';

export default class BigScreen extends Component {
  state = {
    loading: true
  };

  static propTypes = {
    hasButton: PropTypes.bool,
    hasNavbar: PropTypes.bool,
    sessionCode: PropTypes.string,
    hasRound: PropTypes.bool,
    sessionRound: PropTypes.number,
    sessionNumRounds: PropTypes.number,
    url: PropTypes.string,
    hasTimer: PropTypes.bool,
    clockDuration: PropTypes.number,
    clockStartTime: PropTypes.number,
    buttonAction: PropTypes.func,
    buttonText: PropTypes.string,
    activityPhase: PropTypes.string,
    instructions: PropTypes.string,
    feedbackMsge: PropTypes.string,
    feedbackClass: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    hasButton: true,
    hasNavbar: true,
    sessionCode: '',
    url: 'prototeams.com',
    hasRound: false,
    sessionRound: 0,
    sessionNumRounds: 0,
    hasTimer: true,
    clockDuration: -1,
    clockStartTime: 0,
    buttonAction: () => {
      console.log('Button action not set');
    },
    buttonText: 'Next',
    activityPhase: '',
    instructions: '',
    sessionStatus: 0,
    feedbackMsge: '',
    feedbackClass: '',
    children: {}
  };

  componentDidMount() {
    this.setState({
      loading: false
    });
  }

  render() {
    const { sessionCode, url } = this.props;
    const { sessionRound, sessionNumRounds } = this.props;
    const { activityPhase, instructions } = this.props;
    const { buttonText, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration } = this.props;
    const { hasButton, hasNavbar, hasTimer, hasRound } = this.props;
    const { children } = this.props;
    const { loading } = this.state;

    if (loading) return <Loading>Setting up an activity!</Loading>;

    return (
      <>
        <div className="shared-main">
          {hasNavbar && (
            <nav className="navbar">
              {hasRound && <div className="round">Round <span>{sessionRound}</span> of <span>{sessionNumRounds}</span></div>}
              <div className="session-code">
                Join at <span>{url}</span> with session code <span>{sessionCode.toUpperCase()}</span>
              </div>
              <div className="clock">
                {hasTimer && <Clock big startTime={clockStartTime} totalTime={clockDuration} />}
              </div>
            </nav>
          )}
          <div className="content">
            <div className="activity-phase">{activityPhase.toUpperCase()}</div>
            {children}
            <div className="instructions">{instructions}</div>
          </div>
          <div className="footer">
            {hasButton && (
              <Button size="small" onClick={buttonAction}>
                {buttonText}
              </Button>
            )}
          </div>
        </div>
      </>
    );
  }
}
