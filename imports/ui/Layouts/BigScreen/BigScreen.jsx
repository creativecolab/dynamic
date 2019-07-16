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
  }

  static propTypes = {
    hasButton: PropTypes.bool,
    hasNavbar: PropTypes.bool,
    hasTimer: PropTypes.bool,
    clockDuration: PropTypes.number,
    clockStartTime: PropTypes.number,
    buttonAction: PropTypes.func,
    buttonText: PropTypes.string,
    activityPhase: PropTypes.string,
    instructions: PropTypes.string,
    sessionCode: PropTypes.string,
    url: PropTypes.string,
    feedbackMsge: PropTypes.string,
    feedbackClass: PropTypes.string,
    children: PropTypes.node,
  };

  static defaultProps = {
    hasButton: true,
    hasNavbar: true,
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
    sessionCode: '',
    url: 'prototeams.com',
    feedbackMsge: '',
    feedbackClass: '',
    children: {},
  };

  componentDidMount() {
    this.setState({
      loading: false
    });
  }

  render() {
    const { sessionCode, url } = this.props;
    const { activityPhase, instructions } = this.props;
    const { buttonText, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration } = this.props;
    const { hasButton, hasNavbar, hasTimer } = this.props;
    const { children } = this.props;
    const { loading } = this.state;

    if (loading) return <Loading>Setting up an activity!</Loading>;


    return (
      <>
        <div className="main">
          {hasNavbar && (
            <nav className="navbar">
              <div className="session-code">
                <p> Join at <b>{url}</b> with session code <b>{sessionCode.toUpperCase()}</b> </p>
              </div>
              <div className="clock">
                {hasTimer && <Clock big={true} startTime={clockStartTime} totalTime={clockDuration} />}
              </div>
            </nav>
          )}
          <div className="content">
            <h1 className="activityPhase">{activityPhase}</h1>
            {children}
            <div className={classNames('feedback-msge', feedbackClass)}>{feedbackMsge}</div>
          </div>
          <div className="text-box-bigscreen2">
            <h2 id="instructions">{instructions}</h2>
          </div>
          {/* <br /> */}
          {hasButton && <Button onClick={buttonAction}>{buttonText}</Button>}
        </div>
      </>
    );
  }



}