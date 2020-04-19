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
import PictureContent from '../../Components/PictureContent/PictureContent';
import TeamFormation from '../Components/TeamFormation/TeamFormation';
import TeammateSliders from '../Components/TeammateSliders/TeammateSliders';
import QuestionCarousel from '../Components/QuestionCarousel/QuestionCarousel';

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
    session_id: PropTypes.string.isRequired, // to relate preferences to
    activity_id: PropTypes.string.isRequired, // to handle responses
    status: PropTypes.number.isRequired, // status of this activity
    statusStartTime: PropTypes.number.isRequired, // start time of this status
    sessionLength: PropTypes.number.isRequired, // length of this session in num of activities
    progress: PropTypes.number.isRequired, // (index + 1) of activity in session's [Activity]
    duration: PropTypes.number.isRequired, // calculated in parent
    instructor: PropTypes.string // may be present if this is a custom session
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

    if (team.members) {
      teammates = team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 0 }));
    }

    this.state = {
      prevQuestionIndex: 0,
      startTime: new Date().getTime(),
      displayTeam,
      hasFooter: status === ActivityEnums.status.ASSESSMENT && !voted,
      teammates
    };
  }

  /* Helper and Handler Methods */

  getName(shared) {
    if (shared && shared.by) return Users.findOne({ pid: shared.by }).name;

    return '';
  }

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
    const { pid, activity_id, team } = this.props;

    if (!this.props.team._id) {
      return;
    }

    const { teammates } = this.state;

    const user = Users.findOne({ pid });

    Users.update(
      user._id,
      {
        $push: {
          preferences: {
            values: teammates,
            activity_id,
            team: team._id,
            timestamp: new Date().getTime(),
            shareEmail: false,
            round: this.props.progress,
            session: this.props.session_id
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
  renderContent = ({ status, pid, activity_id, questions, team, progress, session_id }) => {
    // individual input phase (none for this activity)
    if (status === ActivityEnums.status.BUILDING_TEAMS) {
      return 'Indvidual input';
    }

    // team formation phase
    if (status === ActivityEnums.status.TEAM_FORMATION) {
      // joined after team formation
      if (!team._id) {
        console.log('No team!?');

        return <Waiting text="No team? Try refreshing this page!" />;
      }
      console.log("current status", status);

      return <TeamFormation pid={pid} {...team} questions={questions} />;
    }

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM) {
      //console.log(questions)
      return (
        <QuestionCarousel
          pid={pid}
          team_id={team._id}
          questions={questions}
          currentQuestions={team.currentQuestions}
          title={"Choose questions to discuss as a group"}
        />
      );
    }

    // summary phase
    if (status === ActivityEnums.status.ASSESSMENT) {
      if (!this.props.voted) {
        // joined after team formation
        if (!team._id) {
          console.log('No team');
          console.log(team);

          return (<PictureContent
            imageSrc="/bye-jpg-500.jpg"
            title="See y'all later!"
            subtitle="No group this round! But get ready to form new groups for the next round."
          />)
        }

        return (
          <TeammateSliders
            pid={pid}
            activity_id={activity_id}
            teammates={this.state.teammates}
            handleChange={this.handlepreferenceChange}
            team_id={team._id}
            round={progress}
            session={session_id}
          />
        );
      } else {
        return (
          <PictureContent
            imageSrc="/bye-jpg-500.jpg"
            title="See y'all later!"
            subtitle="Response recorded! Say goodbye to your group members and get ready to form new groups."
          />
        );
      }
    }

    // should never get here
    return <Waiting text="Awesome! Now wait for the next activity to begin..." />;
  };

  render() {
    console.log('Render');
    const { questions, team } = this.props;
    const { displayTeam, hasFooter } = this.state;
    console.log(hasFooter);

    if (questions.length === 0) {
      return <Loading />;
    }

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
        hasFooter={!team._id ? false : hasFooter}
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

    // received team later than ctor
    if (!prevProps.team._id && team.members) {
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
          hasFooter: !voted && team._id
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
    }

    const { voted } = this.props;

    // if assessment and this user submitted a vote...
    if (status === ActivityEnums.status.ASSESSMENT && prevProps.voted !== voted) {
      this.setState({
        hasFooter: !voted && team._id
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
}

export default withTracker(({ pid, activity_id, progress, instructor }) => {
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

  let questions = []
  // get all the quesitons
  if (instructor === "default") {
    questions = Questions.find({ round: { $in: [progress, 0] }, owner: 'none' }).fetch();
  } else {
    questions = Questions.find({ round: { $in: [progress, 0] }, owner: instructor }).fetch();
  }

  const voted = Users.findOne({ pid, 'preferences.activity_id': activity_id }) !== undefined;

  return { questions, team, voted };
})(TeamDiscussion);
