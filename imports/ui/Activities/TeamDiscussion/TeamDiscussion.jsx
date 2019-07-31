import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ReactSwipe from 'react-swipe';
import posed from 'react-pose';

import Questions from '../../../api/questions';
import Teams from '../../../api/teams';
import Users from '../../../api/users';
import ActivityEnums from '../../../enums/activities';
import Mobile from '../../Layouts/Mobile/Mobile';

import Loading from '../../Components/Loading/Loading';
import Waiting from '../../Components/Waiting/Waiting';
import TeamFormation from '../Components/TeamFormation/TeamFormation';
import TeammateSliders from '../Components/TeammateSliders/TeammateSliders';

import './TeamDiscussion.scss';
import Group from 'antd/lib/input/Group';

const Message = posed.div({
  hidden: {
    opacity: 0,
    transition: { duration: 150 }
  },
  visible: {
    opacity: 1,
    transition: { duration: 50 }
  }
});

class TeamDiscussion extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    questions: PropTypes.array,
    team: PropTypes.object,
    activity_id: PropTypes.string.isRequired, // to handle responses
    status: PropTypes.number.isRequired, // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired, // length of this session in num of activities
    progress: PropTypes.number.isRequired, // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired // calculated in parent
  };

  static defaultProps = {
    questions: [],
    team: {}
  };

  constructor(props) {
    super(props);

    console.log('Constructor');

    this.reactSwipeEl = null;
    let displayTeam = false;

    const { status, pid, team, activity_id } = this.props;

    if (status === ActivityEnums.status.INPUT_TEAM) {
      displayTeam = true;
    }

    let voted = Users.findOne({ pid, 'preference.activity_id': activity_id }) !== undefined;

    let teammates = [];

    if (team && team.members) {
      teammates = team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 2 }));
    } else {
      voted = true;
    }

    this.state = {
      prevQuestionIndex: 0,
      startTime: new Date().getTime(),
      choseTeammate: voted,
      displayTeam,
      hasFooter: props.status === ActivityEnums.status.ASSESSMENT && !voted,
      teammates
    };
  }

  /* Helper and Handler Methods */

  getName(shared) {
    if (shared && shared.by) return Users.findOne({ pid: shared.by }).name;

    return '';
  }

  // handleShare = () => {
  //   const { team, pid } = this.props;
  //   const { sharedBy } = this.state;

  //   if (sharedBy) return;

  //   if (!team) return;

  //   Teams.update(team._id, {
  //     $set: {
  //       shared: { by: pid, index: this.reactSwipeEl.getPos() }
  //     }
  //   });

  //   this.setState(
  //     {
  //       shared: true
  //     },
  //     () => {
  //       console.log('Sharing question #' + this.reactSwipeEl.getPos());
  //       setTimeout(() => {
  //         this.setState({
  //           shared: false
  //         });
  //       }, 500);
  //     }
  //   );
  // };

  handleChooseTeammate = () => {
    this.setState({
      choseTeammate: true
    });
  };

  onSlideChange = () => {
    const endTime = new Date().getTime();
    const { startTime } = this.state;

    const { questions } = this.props;

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
  };

  // check if we're ready to go with questions and teams
  shouldComponentUpdate(nextProps) {
    console.log('ShouldComponentUpdate');

    const { questions, team } = nextProps;

    // if (questions.length < 10) {
    //   console.log('Not enough questions?');
    //   console.log(questions);

    //   return false;
    // }

    // if (!team) {
    //   console.log('No team yet?');
    //   console.log(team);
    //   return false;
    // }
    // if (team.members === []) {
    //   console.log('No teammates?');
    //   console.log(team);
    //   return false;
    // }

    return true;
  }

  // renders based on activity status
  renderContent = ({ status, pid, questions, team }) => {
    // individual input phase (none for this activity)
    if (status === ActivityEnums.status.INPUT_INDV) {
      return 'Indvidual input';
    }

    // team formation phase
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      // joined after team formation
      if (!team._id) {
        console.log('No team!>?');

        // return <div>No team? Try reloading t?he page!</div>;
        return <Waiting text="No team? Try refreshing this page!" />;
      }

      return <TeamFormation pid={pid} {...team} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      //console.log(questions)
      return (
        <>
          <div className="swipe-instr-top">Choose questions to discuss as a group</div>
          <div className="swipe-subinstr-top">
            <strong>Swipe</strong> to see more questions
          </div>
          <div className="slider-main">
            <ReactSwipe
              className="carousel"
              swipeOptions={{ continuous: true, callback: this.onSlideChange }}
              ref={el => (this.reactSwipeEl = el)}
            >
              {questions.map((q, index) => {
                return (
                  <div className="question-card-wrapper" key={q._id}>
                    <div className="question-card">
                      <div className="label">{q.label}</div>
                      {index + 1}. {q.prompt}
                      {/* {team && (
                        <div onClick={() => this.handleShare()} className="suggest-question-tag">
                          Share
                        </div>
                      )} */}
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

            {/* <Message className="pose-msge" pose={this.state.shared ? 'visible' : 'hidden'}>
              Shared with group!
            </Message>

            {team && (
              <Message className="pose-msge" pose={this.state.sharedBy ? 'visible' : 'hidden'}>
                <strong>{this.getName(team.shared)}</strong>
                <br />
                shared this question!
              </Message>
            )} */}
          </div>
        </>
      );
    }

    // summary phase
    if (status === ActivityEnums.status.ASSESSMENT) {
      if (!this.state.choseTeammate) {
        // joined after team formation
        if (!team._id) {
          console.log('No team');
          console.log(team);

          return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;
        }

        return (
          <TeammateSliders
            team_id={team._id}
            pid={pid}
            teammates={this.state.teammates}
            handleChange={this.handlePreferenceChange}
          />
        );
      }
    }

    return <Waiting text="Awesome! Now wait for the next activity to begin..." />;
  };

  handlePreferenceChange = (value, index) => {
    const { teammates } = this.state;

    teammates[index].value = value;
    this.setState({
      teammates
    });
    console.log(teammates);
  };

  handleVote = () => {
    const { pid, activity_id } = this.props;
    const { teammates } = this.state;

    const user = Users.findOne({ pid });

    Users.update(
      user._id,
      {
        $push: {
          preference: {
            values: teammates,
            activity_id,
            timestamp: new Date().getTime()
          }
        }
      },
      error => {
        if (error) {
          console.log(error);
        } else {
          this.setState({
            choseTeammate: true,
            hasFooter: false
          });
        }
      }
    );
  };

  componentDidUpdate(prevProps) {
    console.log('ComponentDidUpdate');

    const { status, team, activity_id, pid } = this.props;

    // new team!
    if (prevProps.team && team && prevProps.team._id !== team._id) {
      this.setState({
        teammates: team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 2 }))
      });
    }

    // changed status
    if (prevProps.status !== status) {
      this.setState({
        choseTeammate: false
      });

      // set up footer and voted
      if (status === ActivityEnums.status.ASSESSMENT) {
        const voted = Users.findOne({ pid, 'preference.activity_id': activity_id }) !== undefined;

        this.setState({
          teammates: team._id ? team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 2 })) : [],
          choseTeammate: voted,
          hasFooter: !voted && team
        });
      } else {
        this.setState({
          hasFooter: false
        });
      }

      // decide whether or not to display the team in the navbar, also update the time question 1 was viewed
      if (status === ActivityEnums.status.INPUT_TEAM) {
        this.setState({
          displayTeam: true,
          startTime: new Date().getTime()
        });
        // update question 1 times viewed
        const { questions } = this.props;

        if (questions.length != 0) {
          Meteor.call('questions.updateTimers', questions[0]._id, questions[0]._id, 0, 0, error => {
            if (!error) console.log('Tracked question 1 successfully');
            else console.log(error);
          });
        }
      } else {
        this.setState({
          displayTeam: false
        });
      }

      // save the view time of the last viewed question
      if (prevProps.status === ActivityEnums.status.INPUT_TEAM) {
        // update the amount of time the last question that we are on was viewed
        const endTime = new Date().getTime();
        const { prevQuestionIndex, startTime } = this.state;
        const { questions } = this.props;

        if (questions.length != 0) {
          Meteor.call('questions.updateTimers', questions[prevQuestionIndex]._id, '', startTime, endTime, error => {
            if (!error) console.log('Tracked final question successfully');
            else console.log(error);
          });
        }
      }
    }
  }

  render() {
    console.log('Render');
    const { questions, team } = this.props;
    const { displayTeam, hasFooter } = this.state;

    if (questions.length === 0) return <Loading />;

    const { progress, sessionLength, statusStartTime, duration } = this.props;

    return (
      <Mobile
        activityName="Icebreaker" //TODO: turn this string into state
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        {...team}
        displayTeam={displayTeam}
        hasTimer
        hasFooter={hasFooter}
        buttonAction={this.handleVote}
        buttonTxt="Submit"
      >
        {this.renderContent(this.props)} {/*component*/}
      </Mobile>
    );
  }
}

export default withTracker(({ pid, activity_id, progress }) => {
  // get the team that this user is in for this activity
  const team = Teams.findOne(
    {
      members: {
        $elemMatch: {
          pid
        }
      },
      activity_id
    },
    { sort: { teamCreated: -1 } }
  );

  // get all the quesitons
  const questions = Questions.find({ round: { $in: [progress, 0] } }).fetch();

  console.log('withTracker, #questions: ' + questions.length);
  console.log(team);

  return { questions, team };
})(TeamDiscussion);
