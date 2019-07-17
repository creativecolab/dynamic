/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import posed from 'react-pose';
import { Textfit } from 'react-textfit';

import Button from '../../Components/Button/Button';
import Clock from '../../Clock/Clock';

import './Mobile.scss';

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

const Container = posed.div({
  closed: {
    height: 0,
    delay: 50,
    transition: { duration: 100 }
  },
  open: { height: 'auto', transition: { duration: 100 } }
});

const Slot = posed.div({
  hidden: {
    // y: -10,
    opacity: 0,
    transition: { duration: 150 }
  },
  visible: {
    // y: 0,
    opacity: 1,
    delay: 100
  }
});

export default class Mobile extends Component {
  state = {
    loading: true,
    teamOpen: false,
    names: ['Amy KIH dhIgd SUHUasuhsu hhsa Bdudas G', 'Gusdhag dha', 'Sam J']
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

  openTeam() {
    const { teamOpen } = this.state;

    if (teamOpen) {
      console.log('close!');
      this.setState({
        teamOpen: false
      });
    } else {
      console.log('open!');
      this.setState({
        teamOpen: true
      });
    }
  }

  render() {
    const { activityName, sessionStatus, sessionLength } = this.props;
    const { buttonTxt, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration } = this.props;
    const { hasFooter, hasNavbar, hasTimer } = this.props;
    const { children } = this.props;
    const { loading, teamOpen, names } = this.state;

    return (
      <div className="mobile-main">
        {hasNavbar && (
          <>
            <nav className="navbar">
              <div onClick={() => this.openTeam()} className="nav-team-shape">
                <img src="/shapes/plus-color-yellow-small.png" alt="" />
                {teamOpen ? <span>&#9650;</span> : <span>&#9660;</span>}
              </div>
              <div className="progress-status">
                <div className="session-progress">
                  Round {sessionStatus} of {sessionLength}
                </div>
              </div>
              <div className="clock">
                {hasTimer && <Clock big startTime={clockStartTime} totalTime={clockDuration} />}
              </div>
            </nav>
            <Container className="teammate-container" pose={teamOpen ? 'open' : 'closed'}>
              {names.map(name => (
                <Slot className="teammate-slot" pose={teamOpen ? 'visible' : 'hidden'} key={name}>
                  <Textfit mode="single" forceSingleModeWidth={false}>
                    {name}
                  </Textfit>
                </Slot>
              ))}
            </Container>
          </>
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
