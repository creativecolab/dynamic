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
    team: null
  };

  constructor(props) {
    super(props);
    this.reactSwipeEl = null;
    let displayTeam = false;

    const { status } = this.props;

    if (status === ActivityEnums.status.INPUT_TEAM || status === ActivityEnums.status.ASSESSMENT) {
      displayTeam = true;
    }

    this.state = {
      choseTeammate: false,
      displayTeam
    };
  }

  getName(shared) {
    if (shared && shared.by) return Users.findOne({ pid: shared.by }).name;

    return '';
  }

  handleShare = () => {
    const { team, pid } = this.props;
    const { sharedBy } = this.state;

    if (sharedBy) return;

    if (!team) return;

    Teams.update(team._id, {
      $set: {
        shared: { by: pid, index: this.reactSwipeEl.getPos() }
      }
    });

    this.setState(
      {
        shared: true
      },
      () => {
        console.log('Sharing question #' + this.reactSwipeEl.getPos());
        setTimeout(() => {
          this.setState({
            shared: false
          });
        }, 500);
      }
    );
  };

  // renders based on activity status
  renderContent = ({ status, pid, questions, team }) => {
    // individual input phase (none for this activity)
    if (status === ActivityEnums.status.INPUT_INDV) {
      return 'Indvidual input';
    }

    // team formation phase
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      // joined after team formation
      if (!team) {
        console.log('No team!>?');

        return <Loading />;
      }

      return <TeamFormation pid={pid} {...team} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      return (
        <>
          <div className="swipe-instr-top">Choose questions to discuss as a group</div>
          <div
            className="swipe-instr-top"
            style={{ textAlign: 'center', fontSize: '0.8em', color: '#808080cc', margin: 0 }}
          >
            <strong>Swipe</strong> to see more questions
            {/* {team && (
              <>
                <br />
                <strong>Share</strong> favorites with group
              </>
            )} */}
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

            <Message className="pose-msge" pose={this.state.shared ? 'visible' : 'hidden'}>
              Shared with group!
            </Message>

            {team && (
              <Message className="pose-msge" pose={this.state.sharedBy ? 'visible' : 'hidden'}>
                <strong>{this.getName(team.shared)}</strong>
                <br />
                shared this question!
              </Message>
            )}
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
    const { status, team, pid } = this.props;

    if (
      prevProps.team &&
      team &&
      prevProps.team.shared &&
      team.shared &&
      team.shared.index !== prevProps.team.shared.index &&
      team.shared.by !== pid
    ) {
      this.reactSwipeEl.slide(team.shared.index, 300);
      this.setState(
        {
          sharedBy: true
        },
        () => {
          console.log('Sharing question #' + this.reactSwipeEl.getPos());
          setTimeout(() => {
            this.setState({
              sharedBy: false
            });
          }, 2000);
        }
      );
    }

    if (prevProps.status !== status) {
      this.setState({
        choseTeammate: false
      });

      if (status === ActivityEnums.status.INPUT_TEAM || status === ActivityEnums.status.ASSESSMENT) {
        this.setState({
          displayTeam: true
        });
      } else {
        this.setState({
          displayTeam: false
        });
      }
    }
  }

  handleChooseTeammate = () => {
    this.setState({
      choseTeammate: true
    });
  };

  onSlideChange = () => {
    // const { team } = this.props;

    // if (team) {
    //   Teams.update(
    //     team._id,
    //     {
    //       $set: {
    //         index: this.reactSwipeEl.getPos()
    //       }
    //     },
    //     error => {
    //       if (!error) {
    //         console.log(this.reactSwipeEl.getPos());
    //       } else {
    //         console.log(error);
    //       }
    //     }
    //   );
    // }

    const { questions } = this.props;

    console.log('changed: ' + questions[this.reactSwipeEl.getPos()].prompt);
  };

  render() {
    const { questions, team } = this.props;
    const { displayTeam } = this.state;

    if (!questions) return <Loading />;

    const { progress, sessionLength, statusStartTime, duration } = this.props;

    return (
      <Mobile
        activityName="IceBreaker" //TODO: turn this string into state
        sessionStatus={progress}
        sessionLength={sessionLength}
        clockDuration={duration}
        clockStartTime={statusStartTime}
        {...team}
        displayTeam={displayTeam}
        hasTimer
        hasFooter={false}
      >
        {this.renderContent(this.props)} {/*component*/}
      </Mobile>
    );
  }
}

export default withTracker(({ pid, activity_id }) => {
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
  const questions = Questions.find({}).fetch();

  if (team) {
    const { members, shared } = team;

    return { questions, team, members, shared };
  }

  return { questions, team };
})(TeamDiscussion);
