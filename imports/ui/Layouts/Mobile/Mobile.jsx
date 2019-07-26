/* eslint-disable react/prefer-stateless-function */
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames/bind';
import posed from 'react-pose';
import { Textfit } from 'react-textfit';

import Button from '../../Components/Button/Button';
import Clock from '../../Clock/Clock';

import './Mobile.scss';
import Users from '../../../api/users';

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
    teamOpen: false
  };

  static propTypes = {
    hasFooter: PropTypes.bool,
    hasNavbar: PropTypes.bool,
    hasTimer: PropTypes.bool,
    title: PropTypes.string,
    displayTeam: PropTypes.bool,
    // team: PropTypes.object,
    _id: PropTypes.string,
    members: PropTypes.array,
    color: PropTypes.string,
    shape: PropTypes.string,
    buttonAction: PropTypes.func,
    buttonTxt: PropTypes.string,
    activityName: PropTypes.string,
    sessionStatus: PropTypes.number,
    sessionLength: PropTypes.number,
    clockDuration: PropTypes.number,
    clockStartTime: PropTypes.number,
    feedbackMsge: PropTypes.string,
    feedbackClass: PropTypes.string,
    footerText: PropTypes.string,
    children: PropTypes.node,
    questionToggle: PropTypes.number,
    questionNumber: PropTypes.number,
    questionsLength: PropTypes.number
  };

  static defaultProps = {
    activityName: 'Activity name',
    title: '',
    hasFooter: true,
    hasNavbar: true,
    hasTimer: true,
    displayTeam: false,
    buttonAction: () => {
      console.log('Button action not set');
    },
    buttonTxt: 'Next',
    clockDuration: 0,
    clockStartTime: 0,
    feedbackMsge: '',
    feedbackClass: '',
    footerText: '',
    sessionStatus: 0,
    sessionLength: 0,
    children: {}
  };

  componentDidMount() {
    this.setState({
      loading: false
    });
  }

  componentDidUpdate(prevProps) {
    const team_id = this.props._id;

    if (!team_id || !prevProps.team) return;

    if (prevProps.team_id !== team_id) {
      this.setState(
        {
          teamOpen: true
        },
        () => {
          setTimeout(() => {
            this.setState({
              teamOpen: false
            });
          }, 500);
        }
      );
    }
  }

  openTeam() {
    const { teamOpen } = this.state;
    const team_id = this.props._id;

    if (!team_id) return;

    if (teamOpen) {
      this.setState({
        teamOpen: false
      });
    } else {
      this.setState({
        teamOpen: true
      });
    }
  }

  getTeammateNames(members) {
    return members.map(m => Users.findOne({ pid: m.pid }).name);
  }

  render() {
    const { title, sessionStatus, sessionLength } = this.props;
    const { buttonTxt, buttonAction } = this.props;
    const { feedbackMsge, feedbackClass } = this.props;
    const { clockStartTime, clockDuration, displayTeam, members, shape, color } = this.props;
    const { hasFooter, hasNavbar, hasTimer } = this.props;
    const { children, footerText } = this.props;
    const { loading, teamOpen } = this.state;
    const team_id = this.props._id;

    let names = [];

    if (displayTeam && team_id) names = this.getTeammateNames(members);

    return (
      <div className="mobile-main">
        {hasNavbar && (
          <>
            <nav className="navbar">
              <div onClick={() => this.openTeam()} className="nav-team-shape">
                {displayTeam && team_id && (
                  <>
                    <img src={`/shapes/${shape}-solid-${color}-small.png`} alt="" />
                    {teamOpen ? <span>&#9650;</span> : <span>&#9660;</span>}
                  </>
                )}
              </div>
              <div className="progress-status">
                <div className="session-progress">
                  {title ? (
                    <>{title}</>
                  ) : (
                    <>
                      Round {sessionStatus} of {sessionLength}
                    </>
                  )}
                </div>
              </div>
              <div className="clock">
                {hasTimer && <Clock big startTime={clockStartTime} totalTime={clockDuration} />}
              </div>
            </nav>
            <Container
              className={teamOpen ? 'teammate-container open' : 'teammate-container closed'}
              pose={teamOpen ? 'open' : 'closed'}
            >
              {names.map(name => (
                <Slot className="teammate-slot" pose={teamOpen ? 'visible' : 'hidden'} key={name}>
                  <Textfit max={24} mode="single" forceSingleModeWidth={false}>
                    {name}
                  </Textfit>
                </Slot>
              ))}
            </Container>
          </>
        )}
        <div className={hasFooter ? 'content' : 'content-full'}>
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
        {footerText && (
          <Footer className="footer">
            <div className="footer-text">{footerText}</div>
          </Footer>
        )}
      </div>
    );
  }
}
