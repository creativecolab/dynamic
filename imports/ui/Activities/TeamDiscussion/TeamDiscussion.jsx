import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Swiper from 'react-id-swiper';
import Mobile from '../../Layouts/Mobile/Mobile';

import './TeamDiscussion.scss';
import Questions from '../../../api/questions';

export default class TeamDiscussion extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired, // to handle responses
    status: PropTypes.number.isRequired, // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired, // length of this session in num of activities
    progress: PropTypes.number.isRequired, // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired // calculated in parent
  };

  state = {
    questions: this.shuffle(Questions.find().fetch())
  };

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  renderContent() {}

  render() {
    const params = {
      pagination: {
        el: '.swiper-pagination',
        clickable: true,
        dynamicBullets: true
      },
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev'
      }
    };

    const { questions } = this.state;

    const { progress, sessionLength, statusStartTime, duration } = this.props;

    return (
      <Mobile
        activityName="Icebreaker"
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        hasFooter={false}
      >
        <div className="slider-main">
          <Swiper {...params}>
            {questions.map(q => {
              return (
                <div className="question-card-wrapper" key={q._id}>
                  <div className="question-card">{q.prompt}</div>
                </div>
              );
            })}
          </Swiper>
        </div>
      </Mobile>
    );
  }
}