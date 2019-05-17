import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import { Random } from 'meteor/random';
import ActivityEnums from '../../enums/activities';

import Sessions from '../../api/sessions';
import SessionListItem from './Components/SessionListItem';
import Logs from '../../api/logs';
import '../assets/_main.scss';
import './InstructorUI.scss';
import Quizzes from '../../api/quizzes';

class InstructorUI extends Component {
  static propTypes = {
    sessions: PropTypes.array
  };

  constructor(props) {
    super(props);
    this.state = {
      code: ''
    };
  }

  // insert new session to db
  handleNewSession(evt) {
    evt.preventDefault();
    const { code } = this.state;

    // invalid session code
    if (code === '') {
      console.log('Invalid session name!');

      return;
    }

    const session = Sessions.findOne({ code });

    // session already exists!
    if (session) {
      console.log('Session already exists!');

      return;
    }

    // create session
    const session_id = Sessions.insert(
      {
        code: code.toLowerCase(),
        timestamp: new Date().getTime(),
        participants: [],
        activities: [],
        round: 0,
        status: 0 // TODO: ENUM with status PENDING, DONE, IN_PROGRESS
      },
      data => {
        console.log(data);
        this.setState({
          code: '',
          size: 3
        });
      }
    );

    // create 3 default activities
    const activities = [];

    for (let i = 0; i < 1; i++) {
      const activity = Activities.insert({
        name: 'quiz',
        index: i,
        session_id,
        timestamp: new Date().getTime(),
        team_size: 3, // TODO: default value?
        durationIndv: 60,
        durationTeam: 60,
        durationOffsetIndv: 0,
        durationOffsetTeam: 0,
        status: 0,
        statusStartTime: 0,
        teams: []
      });

      activities.push(activity);

      // Question 1
      if (i === 0) {
        Quizzes.insert({
          activity_id: activity,
          questions: [
            {
              type: ActivityEnums.quiz.MULTI_CHOICE,
              prompt: 'This is question number 1',
              options: [
                {
                  text: 'Correct answer',
                  id: Random.id(),
                  countIndv: 0,
                  countIndvTeam: 0,
                  correct: true
                },
                {
                  text: 'Option 2',
                  id: Random.id(),
                  countIndv: 0,
                  countTeam: 0,
                  correct: false
                },
                {
                  text: 'Option 3',
                  id: Random.id(),
                  countIndv: 0,
                  countTeam: 0,
                  correct: false
                },
                {
                  text: 'Option 4',
                  id: Random.id(),
                  countIndv: 0,
                  countTeam: 0,
                  correct: false
                }
              ]
            },
            {
              type: ActivityEnums.quiz.FREE_RESPONSE,
              prompt: 'This is question number 2',
              answer: 'This is the answer',
              studentAswers: []
            }
          ]
        });
      } else if (i === 1) {
        Quizzes.insert({
          activity_id: activity,
          prompt: 'According to Belle Beth Cooper, you can harness the power of constraints by',
          options: [
            {
              text: 'Expanding your team',
              id: Random.id(),
              countIndv: 0,
              countIndvTeam: 0,
              correct: true
            },
            {
              text: 'Pushing back your deadlines',
              id: Random.id(),
              countIndv: 0,
              countTeam: 0,
              correct: false
            },
            {
              text: 'Focusing on one small task at a time',
              id: Random.id(),
              countIndv: 0,
              countTeam: 0,
              correct: false
            }
          ]
        });
      } else if (i === 2) {
        Quizzes.insert({
          activity_id: activity,
          prompt:
            'Sutton describes an experimental event hosted by the San Francisco Opera House entitled, "Barely Opera" that was a big success. This is because',
          options: [
            {
              text: 'it upheld the traditional aesthetics of Opera culture',
              id: Random.id(),
              countIndv: 0,
              countIndvTeam: 0,
              correct: false
            },
            {
              text: 'it was done cheap, quick, and in a logistically challenging location',
              id: Random.id(),
              countIndv: 0,
              countTeam: 0,
              correct: true
            },
            {
              text: 'it took place in a big, formal setting',
              id: Random.id(),
              countIndv: 0,
              countTeam: 0,
              correct: false
            }
          ]
        });
      } // else {
      //   Quizzes.insert({
      //     activity_id: activity,
      //     prompt: 'According to Belle Beth Cooper, you can harness the power of constraints by',
      //     options: [
      //       {
      //         text: "Expanding your team",
      //         id: Random.id(),
      //         countIndv: 0,
      //         countIndvTeam: 0,
      //         correct: true
      //       },
      //       {
      //         text: "Pushing back your deadlines",
      //         id: Random.id(),
      //         countIndv: 0,
      //         countTeam: 0,
      //         correct: false
      //       },
      //       {
      //         text: "Focusing on one small task at a time",
      //         id: Random.id(),
      //         countIndv: 0,
      //         countTeam: 0,
      //         correct: false
      //       }
      //     ]
      //   });
      // }
    }

    // add new activity to this session, necessary? good?
    Sessions.update(session_id, {
      $set: {
        activities
      }
    });

    //track the session that was created
    const new_log = Logs.insert({
      log_type: 'Session Created',
      code,
      timestamp: new Date().getTime()
    });

    console.log(new_log);
  }

  //update the code state so we know where to go
  handleSessionChange(evt) {
    this.setState({
      code: evt.target.value
    });
  }

  // list sessions
  mapSessions() {
    return this.props.sessions.map(({ _id, code, participants, timestamp, status }) => (
      <SessionListItem
        key={_id}
        _id={_id}
        participants={participants}
        code={code}
        timestamp={timestamp}
        status={status}
      />
    ));
  }

  render() {
    return (
      <div>
        {/* <div class="header"><img id="dynamic-logo-big" src="./dynamic_logo.png" alt=""/> */}
        <div id="inner">
          <h1>Manage Sessions</h1>
          <br />
          <form id="session-form" onSubmit={evt => this.handleNewSession(evt)}>
            <div id="session-code" className="field-container">
              <label className="field-title" htmlFor="session-code">
                New session code
              </label>
              <div className="input-container">
                <input
                  className="bigscreen-input-text"
                  type="text"
                  name="session-code"
                  placeholder="Type your session code here"
                  value={this.state.code}
                  onChange={evt => this.handleSessionChange(evt)}
                />
              </div>
            </div>
            <div id="submit" className="field-container">
              <input className="bigscreen-button" type="submit" value="Create" />
            </div>
          </form>
          <br />
          <div>{this.mapSessions()}</div>
        </div>
      </div>
    );
  }
}

export default withTracker(() => {
  const sessions = Sessions.find().fetch();

  return { sessions };
})(InstructorUI);
