import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ReactSwipe from 'react-swipe';
import posed from 'react-pose';

import { Textfit } from 'react-textfit';
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
    voted: PropTypes.bool,
    activity_id: PropTypes.string.isRequired, // to handle responses
    status: PropTypes.number.isRequired, // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired, // length of this session in num of activities
    progress: PropTypes.number.isRequired, // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired // calculated in parent
  };

  static defaultProps = {
    questions: [],
    team: {},
    voted: false
  };

  constructor(props) {
    super(props);

    console.log('Constructor');

    this.reactSwipeEl = null;
    let displayTeam = false;

    const { status, pid, team, voted } = this.props;

    if (status === ActivityEnums.status.INPUT_TEAM) {
      displayTeam = true;
    }

    let teammates = [];

    if (team._id && team.members) {
      teammates = team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 0 }));
    }

    this.state = {
      prevQuestionIndex: 0,
      startTime: new Date().getTime(),
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

  // make sure we submit preferences for people
  shouldComponentUpdate(nextProps) {
    console.log('ShouldComponentUpdate');

    return true;
  }

  handlepreferenceChange = (value, index) => {
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
          preferences: {
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
          console.log('Submitted preferences');
          this.setState({
            hasFooter: false
          });
        }
      }
    );
  };

  // renders based on activity status
  renderContent = ({ status, pid, activity_id, questions, team }) => {
    // individual input phase (none for this activity)
    if (status === ActivityEnums.status.INPUT_INDV) {
      return 'Indvidual input';
    }

    // team formation phase
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      // joined after team formation
      if (!team._id) {
        console.log('No team!?');

        return <Waiting text="No team? Try refreshing this page!" />;
      }

      return <TeamFormation pid={pid} {...team} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      //console.log(questions)
      return (
        <div>
          <div className="swipe-instr-top">
            <Textfit mode="single" max={36}>
              Choose questions to discuss as a group
            </Textfit>
          </div>
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

    // summary phase
    if (status === ActivityEnums.status.ASSESSMENT) {
      if (!this.props.voted) {
        // joined after team formation
        if (!team._id) {
          console.log('No team');
          console.log(team);

          return <Waiting text="You have not been assigned a team. Please wait for the next activity." />;
        }

        return (
          <TeammateSliders
            pid={pid}
            activity_id={activity_id}
            teammates={this.state.teammates}
            handleChange={this.handlepreferenceChange}
          />
        );
      } else {
        return <Waiting text="Response recorded! Now wait for the next activity to begin..." />;
      }
    }

    // should never get here
    return <Waiting text="Awesome! Now wait for the next activity to begin..." />;
  };

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

  componentDidUpdate(prevProps) {
    console.log('ComponentDidUpdate');

    const { status, team, activity_id, pid } = this.props;

    // new team!
    if (prevProps.team._id && team._id && prevProps.team._id !== team._id) {
      this.setState({
        teammates: team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 0 }))
      });
    }

    // changed status
    if (prevProps.status !== status) {
      // set up footer and voted
      if (status === ActivityEnums.status.ASSESSMENT) {
        const { voted } = this.props;

        this.setState({
          teammates: team._id ? team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 0 })) : [],
          hasFooter: !voted
        });

        // update the amount of time the last question that we were on was viewed
        const endTime = new Date().getTime();
        const { prevQuestionIndex, startTime } = this.state;
        const { questions } = this.props;

        if (questions.length != 0) {
          Meteor.call('questions.updateTimers', questions[prevQuestionIndex]._id, '', startTime, endTime, error => {
            if (!error) console.log('Tracked final question successfully');
            else console.log(error);
          });
        }
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
    }

    const { voted } = this.props;

    // if assessment and this user submitted a vote...
    if (status === ActivityEnums.status.ASSESSMENT && prevProps.voted !== voted) {
      this.setState({
        hasFooter: !voted
      });

      // if voted is true, check if other team members have voted
      if (voted && !team.assessed) {
        let num_assessed = 1; // since this is only called after the client submits their vote

        team.members.forEach(member => {
          if (member.pid !== pid) {
            if (Users.findOne({ pid: member.pid, 'preferences.activity_id': activity_id }) !== undefined)
              num_assessed++;
          }
        });

        if (num_assessed === team.members.length) {
          // since everyone in this team has submitted their assessments, we can mark this team as assessed (and tell the other clients)
          Teams.update(
            team._id,
            {
              $set: {
                assessed: true
              }
            },
            error => {
              if (!error) console.log('Team assessed!');
              else console.log(error);
            }
          );
        }
      }
    }
  }

  componentWillUnmount() {
    console.log('ComponentWillUnmount');
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

  const voted = Users.findOne({ pid, 'preferences.activity_id': activity_id }) !== undefined;

  return { questions, team, voted };
})(TeamDiscussion);
