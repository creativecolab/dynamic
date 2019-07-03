import React, { Component } from 'react';
// import PropTypes from 'prop-types';
import Swiper from 'react-id-swiper';
import Mobile from '../../Layouts/Mobile/Mobile';

import './TeamDiscussion.scss';
import Questions from '../../../api/questions';

export default class TeamDiscussion extends Component {
  // static propTypes = {
  //   prop: PropTypes
  // }
  state = {
    questions: Questions.find().fetch()
  };

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

    return (
      <Mobile
        activityName="Icebreaker"
        sessionStatus={1}
        sessionLength={3}
        clockDuration={50}
        clockStartTime={new Date().getTime()}
        hasFooter={false}
      >
        <div className="slider-main">
          <Swiper {...params}>
            {questions.map(q => {
              return (
                <div className="question-card-wrapper">
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
