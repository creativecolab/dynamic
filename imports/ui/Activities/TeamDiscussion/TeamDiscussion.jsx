import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import ReactSwipe from 'react-swipe';

import Mobile from '../../Layouts/Mobile/Mobile';

import './TeamDiscussion.scss';
import Questions from '../../../api/questions';
// import Button from '../../Components/Button/Button';
import Loading from '../../Components/Loading/Loading';

class TeamDiscussion extends Component {
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

  renderContent() { }

  render() {
    const { questions } = this.props;

    if (!questions) return <Loading />;

    const { progress, sessionLength, statusStartTime, duration } = this.props;

    let reactSwipeEl;

    return (
      <Mobile
        activityName="Icebreaker"
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        hasFooter={false}
      >
        <div className="swipe-instr">Swipe to see more questions</div>
        <div className="slider-main">
          <ReactSwipe className="carousel" swipeOptions={{ continuous: false }} ref={el => (reactSwipeEl = el)}>
            {questions.map(q => {
              return (
                <div className="question-card-wrapper" key={q._id}>
                  <div className="question-card">{q.prompt}</div>
                </div>
              );
            })}
          </ReactSwipe>
          <button className="prev" type="button" onClick={() => reactSwipeEl.prev()}>
            Previous
          </button>
          <button className="next" type="button" onClick={() => reactSwipeEl.next()}>
            Next
          </button>
        </div>
      </Mobile>
    );
  }
}

export default withTracker(props => {
  const questions = Questions.find().fetch();

  return { questions };
})(TeamDiscussion);
