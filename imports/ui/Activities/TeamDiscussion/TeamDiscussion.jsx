import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ReactSwipe from 'react-swipe';

import Questions from '../../../api/questions';
import Teams from '../../../api/teams';
import ActivityEnums from '../../../enums/activities';
import Mobile from '../../Layouts/Mobile/Mobile';

// import Button from '../../Components/Button/Button';
import Loading from '../../Components/Loading/Loading';
import Waiting from '../../Components/Waiting/Waiting';
import TeamFormation from '../Components/TeamFormation/TeamFormation';
import TeammateSliders from '../Components/TeammateSliders/TeammateSliders';
import Clock from '../../Clock/Clock';

import './TeamDiscussion.scss';


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

  constructor(props) {
    super(props);
    this.reactSwipeEl = null;

    this.state = {
      choseTeammate: false
    };
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));

      [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
  }

  renderClock() {

    return <Clock startTime={this.props.statusStartTime} big={false} totalTime={this.props.duration} />;
  }

  // renders based on activity status
  renderContent = ({ status, pid, activity_id, questions, team, index }) => {
    // individual input phase (none for this activity)
    if (status === ActivityEnums.status.INPUT_INDV) {
      return 'Indvidual input';
    }

    // team formation phase
    if (status === ActivityEnums.status.TEAM_FORMATION) {

      // joined after team formation
      if (!team) return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;

      return <TeamFormation team_id={team._id} pid={pid} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      return (
        <>
          {this.renderClock()}
          <div className="swipe-instr-top">Have group members answer:</div>
          <div className="swipe-instr-top" style={{ padding: "0 1.5em", fontSize: "0.8em" }}>Swipe to see more questions. This will change your teammates' screens too!</div>
          <div className="slider-main">
            <ReactSwipe
              className="carousel"
              swipeOptions={{ continuous: true, callback: this.onSlideChange, startSlide: index }}
              ref={el => (this.reactSwipeEl = el)}
            >
              {questions.map((q, index) => {
                return (
                  <div className="question-card-wrapper" key={q._id}>
                    <div className="question-card">{index + 1}. {q.prompt}</div>
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

            {/* <div className="swipe-instr-bottom">Swipe for next question</div> */}
          </div>


        </>
      );
    }

    // summary phase
    if (status === ActivityEnums.status.ASSESSMENT) {
      if (!this.state.choseTeammate) {
        // joined after team formation
        if (!team) return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;

        return <TeammateSliders team_id={team._id} pid={pid} handleChosen={this.handleChooseTeammate} />;
      }
    }

    return <Waiting text="Waiting for next activity of this session to begin..." />;
  };

  componentDidUpdate(prevProps) {
    if (prevProps.status !== this.props.status) {
      this.setState({
        choseTeammate: false
      });
    }
  }

  handleChooseTeammate = () => {
    this.setState({
      choseTeammate: true
    });
  };

  onSlideChange = () => {
    const { team } = this.props;

    if (team) {
      Teams.update(
        team._id,
        {
          $set: {
            index: this.reactSwipeEl.getPos()
          }
        },
        error => {
          if (!error) {
            console.log(this.reactSwipeEl.getPos());
          } else {
            console.log(error);
          }
        }
      );
    }

    const { questions } = this.props;

    console.log('changed: ' + questions[this.reactSwipeEl.getPos()].prompt);
  };

  render() {
    const { questions, index } = this.props;

    if (!questions) return <Loading />;

    const { progress, sessionLength, statusStartTime, duration } = this.props;

    return (
      <Mobile
        activityName="IceBreakers" //TODO: turn this string into state
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        hasFooter={false}
      >
        {this.renderContent(this.props)}
      </Mobile>
    );
  }
}

export default withTracker(({ pid }) => {
  const team = Teams.findOne({
    'members': {
      $elemMatch: {
        'pid': pid
      }
    }
  }, { sort: { teamCreated: -1 } });
  let questions = Questions.find().fetch();
  let index = 0;

  if (team) {
    questions = team.questions;
    index = team.index;
  }

  return { questions, index, team };
})(TeamDiscussion);
