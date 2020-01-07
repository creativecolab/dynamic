import ReactSwipe from 'react-swipe';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Textfit } from 'react-textfit';
import './QuestionCarousel.scss';

class QuestionCarousel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      prevQuestionIndex: 0,
      startTime: new Date().getTime(),
    };
  }

  static propTypes = {
    pid: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    questions: PropTypes.array.isRequired,
    currentQuestions: PropTypes.array.isRequired,
  };

  onSlideChange = () => {
    const endTime = new Date().getTime();
    const { startTime } = this.state;

    const { questions, _id, pid } = this.props;

    const past_question = questions[this.state.prevQuestionIndex]._id;
    const next_question = questions[this.reactSwipeEl.getPos()]._id;

    //update questions
    Meteor.call('questions.updateTimers', past_question, next_question, startTime, endTime, error => {
      if (!error) console.log('Tracked questions successfully');
      else console.log(error);
    });

    // keep track of this current question and when it began
    this.setState({
      prevQuestionIndex: this.reactSwipeEl.getPos(),
      startTime: new Date().getTime()
    });

    Meteor.call('questions.setCurrent', _id, pid, this.reactSwipeEl.getPos(), error => {
      if (!error) console.log('Set current question successfully');
      else console.log(error);
    });
  };

  getCurrentQuestion() {
    const { pid, currentQuestions } = this.props;
    for (var i = 0; i < currentQuestions.length; i++) {
      if (currentQuestions[i].pid == pid) {
        return currentQuestions[i].question_ind;
      }
    }
    return 0;
  }

  componentWillUnmount() {
    const { startTime, prevQuestionIndex } = this.state;
    const { questions } = this.props;
    const endTime = new Date().getTime();

    if (questions.length != 0) {
      Meteor.call('questions.updateTimers', questions[prevQuestionIndex]._id, '', startTime, endTime, error => {
        if (!error) console.log('Tracked final question successfully');
        else console.log(error);
      });
    }
  }

  render() {
    return (
      <div>
        <div className="swipe-instr-top">
          <Textfit mode="multi" max={36}>
            {this.props.title}
          </Textfit>
        </div>
        <div className="swipe-subinstr-top">
          <strong>Swipe</strong> to see more questions
          </div>
        <div className="slider-main">
          <ReactSwipe
            className="carousel"
            swipeOptions={{ continuous: true, callback: this.onSlideChange, startSlide: this.getCurrentQuestion() }}
            ref={el => (this.reactSwipeEl = el)}
          >
            {this.props.questions.map((q, index) => {
              return (
                <div className="question-card-wrapper" key={q._id}>
                  <div className="question-card">
                    <div className="label" style={{ background: q.color }}>
                      {q.label}
                    </div>
                    {index + 1}. {q.prompt}
                  </div>
                </div>
              );
            })}
          </ReactSwipe>

          <button className="prev" type="button" onClick={() => this.reactSwipeEl.prev()}>
            &larr;
            </button>
          <button className="next" type="button" onClick={() => this.reactSwipeEl.next()}>
            &rarr;
            </button>
        </div>
      </div>
    );
  }
}

export default QuestionCarousel;