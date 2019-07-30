import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';
// import { PythonShell } from 'python-shell';

import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';
import Questions from '../../api/questions';
import Responses from '../../api/responses';

import dbquestions from './dbquestions';
import './register-api';
import { formTeams } from './team-former.js';

function getPreference() {
  const session = Sessions.findOne({ code: 'quiz2' });

  // TODO: currently assumes there is only one session, need to make more general in the future

  if (!session) {
    return 'No session named quiz2 yet!';
  }

  const { participants } = session;

  if (!participants) {
    return 'No particpants for this session yet';
  }

  // csv format
  let ret = 'pid,pref_0,rating_0,pref_1,rating_1,pref_2,rating_2\n';

  // get the data on the preferences of each participant
  participants.map(user_pid => {
    ret += `"${user_pid.toUpperCase()}",`;
    const user = Users.findOne({ pid: user_pid });

    if (user) {
      user.preference.map(activity_pref => {
        activity_pref.values.map((pref, index) => {
          ret += pref.pid + ',' + pref.value;

          // add a comma when not on preference 3
          if (index != 2) ret += ',';
        });

        // handles ratings from only 2 people
        if (activity_pref.values.length < 3) ret += ',\n';
        else ret += '\n';
      });

      // when user exists but has no preference data (happens sometimes)
      if (user.preference.length == 0) ret += ',,,,,\n';
    } else {
      // no preference info on this user for some reason
      ret += ',,,,,\n';
    }
    // ret += '\n';
  });

  return ret;
}

if (Meteor.isServer) {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  Api.addRoute('csv', {
    get() {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': 'attachment; filename=preferences_quiz2.csv'
        },
        body: getPreference()
      };
    }
  });

  // Meteor.publish('responses.private', function() {
  //   return Responses.find();
  // });
}

let timeout_timer;

/* Meteor methods (server-side function, mostly database work) */
Meteor.methods({
  'sessions.buildTeamHistory': function(participants, session_id) {
    teamHistory = {};
    participants.forEach(participant => {
      teamHistory[participant] = {};
      participants.forEach(other_participants => {
        if (other_participants != participant) teamHistory[participant][other_participants] = 0;
      });
    });
    Sessions.update(session_id, {
      $set: {
        teamHistory
      }
    });
  },

  'sessions.updateTeamHistory_TeamFormation': function(teams, teamHistory, session_id) {
    teams.forEach(team => {
      team.forEach(member => {
        team.forEach(other_member => {
          if (member != other_member) teamHistory[member][other_member] = teamHistory[member][other_member] + 1;
        });
      });
    });
    Sessions.update(session_id, {
      $set: {
        teamHistory
      }
    });
  },

  'sessions.updateTeamHistory_LateJoinees': function(participants, new_person, teamHistory, session_id) {
    teamHistory[new_person] = {};
    participants.forEach(participant => {
      if (participant != new_person) teamHistory[participant][new_person] = 0;

      teamHistory[new_person][participant] = 0;
    });
    Sessions.update(session_id, {
      $set: {
        teamHistory
      }
    });
    console.log(teamHistory);
  },

  'activities.updateStatus': function(activity_id) {
    try {
      const activity = Activities.findOne(activity_id);

      const currentStatus = activity.status;

      //in case this was called due to an instructor skipping ahead, reset the timer
      clearTimeout(timeout_timer);

      // increment the status, get the appropriate timestamp, and prepare for next status
      switch (currentStatus) {
        case 0:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 2, // FIXME: skipping first status
              'statusStartTimes.indvPhase': new Date().getTime()
            }
          });

          return currentStatus + 2;
        case 1:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.teamForm': new Date().getTime(),
              allTeamsFound: false
            }
          });

          return currentStatus + 1;
        case 2:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.teamPhase': new Date().getTime()
            }
          });

          return currentStatus + 1;
        case 3:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.peerAssessment': new Date().getTime()
            }
          });

          return currentStatus + 1;
        case 4:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              endTime: new Date().getTime()
            }
          });

          return currentStatus + 1;
        default:
          console.log('No longer incrementing');

          return -1;
      }
    } catch (error) {
      console.log(error);
    }
  },

  // write the the database for tracking question time
  'questions.updateTimers': function(past_question, next_question, startTime, endTime) {
    // save the time spent on the last question
    Questions.update(
      past_question,
      {
        $inc: {
          viewTimer: endTime - startTime
        }
      },
      error => {
        if (!error) {
          console.log('Saved past question');
        } else {
          console.log(error);
        }
      });
    // update how many times the next question has been viewed
    if (next_question != "") {
      Questions.update(next_question, {
        $inc: {
          timesViewed: 1
        }
      },
        error => {
          if (!error) {
            console.log('Saved next question');
          } else {
            console.log(error);
          }
        });
    }
    
  },

  'users.addPoints': function({ user_id, session_id, points }) {
    Users.update(
      {
        _id: user_id,
        sessionHistory: {
          $elemMatch: {
            session: session_id
          }
        }
      },
      {
        $set: {
          'sessionHistory.$.points': points
        }
      },
      () => {
        //track the session that was created
        Logs.insert({
          log_type: 'Points Added',
          code: session_id,
          user: Users.findOne(user_id).pid,
          timestamp: new Date().getTime()
        });
      }
    );
  }
});

function createQuestions() {
  if (Questions.find({}).count() !== 0) {
    return;
  }

  // for each group of questions
  dbquestions.map(group => {
    // icebreaker questions
    // add 5 icebreaker questions per round
    // up to round 4
    if (group.label === 'icebreaker') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 5 === 0) round += 1;

        if (round > 3) return;

        Questions.insert({
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          round
        });
      });
    } else if (group.label === 'design') {
      let round = 3;

      group.prompts.map((q, index) => {
        if (index % 3 === 0) round += 1;

        Questions.insert({
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          round
        });
      });
    } else if (group.label === 'team') {
      group.prompts.map(q => {
        Questions.insert({
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          round: 0
        });
      });
    }
  });
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// set up the colors that the teams will use
function buildColoredShapes(colored_shapes) {
  const shapes = shuffle(['circle', 'plus', 'moon', 'square', 'star', 'heart', 'triangle']);
  const shapeColors = shuffle(['blue', 'purple', 'green', 'yellow', 'red']);

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapeColors.length; j++) {
      colored_shapes.push({ shape: shapes[i], color: shapeColors[j] });
    }
  }

  shuffle(colored_shapes);
}

/* Meteor start-up function, called once server starts */
Meteor.startup(() => {
  // updateRoster();

  getPreference();

  createQuestions();

  // handles session start/end
  const sessionCursor = Sessions.find({});

  sessionCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + ' updated.');
      console.log(update);

      // start session!
      if (update.status === 1) {
        // start first activity
        const session = Sessions.findOne(_id);

        Meteor.call('activities.updateStatus', session.activities[0], (err, res) => {
          if (err) {
            alert(err);
          } else {
            // success!
            console.log('\nStarting Activity Status ' + res);
          }
        });

        // TODO: Update logs
        Logs.insert({
          status: 1,
          message: 'Session started',
          session_id: session._id,
          timestamp: new Date().getTime()
        });
      }
    }
  });

  // speeds up activity based on teams ready
  Teams.find({}).observeChanges({
    changed(_id, update) {
      // set team formation time
      if (update.confirmed) {
        // if all confirmed, set team formation time
        // if (update.members.map(x => x.confirmed).reduce((res, x) => res && x)) {
        const team = Teams.findOne(_id);
        const activity = Activities.findOne(team.activity_id);

        Teams.update(team._id, {
          $set: {
            teamFormationTime: new Date().getTime() - activity.statusStartTimes.indvPhase
          }
        });
        // }
      }

      // get current activity in context
      const activity_id = Teams.findOne(_id).activity_id;

      // get number of teams that have not confirmed yet
      const num_not_confirmed = Teams.find({ activity_id, confirmed: false }).count();

      console.log(num_not_confirmed + " teams haven't confirmed yet.");

      // everyone confirmed, no need to wait
      if (num_not_confirmed === 0 && Activities.findOne(activity_id).status === 2) {
        Activities.update(activity_id, {
          $set: {
            allTeamsFound: true
          }
        });
        Meteor.call('activities.updateStatus', activity_id, (err, res) => {
          if (err) {
            alert(err);
          } else {
            // success!
            console.log('Starting Activity Status ' + res);
          }
        });
      }
    }
  });

  // set duration based on activity status and session progress
  function calculateDuration(activity) {
    // get activity status
    const { status, index } = activity;

    // get durations
    const { durationIndv, durationOffsetIndv } = activity;
    const { durationTeam, durationOffsetTeam } = activity;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
      return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

    return -1;
  }

  // handles team formation
  const activitiesCursor = Activities.find({});

  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log('[Activity] ' + _id + ' updated.');
      console.log(update);

      // get duration
      let duration = 0;

      if (update.status) {
        const activity = Activities.findOne({ _id });

        duration = calculateDuration(activity);
      }

      // debug flag, useful for styling
      const debug = false;

      // called to end an activity phase
      const endPhase = Meteor.bindEnvironment((activity_id, status) => {
        if (debug) return;

        Meteor.call('activities.updateStatus', activity_id, (err, res) => {
          if (err) {
            alert(err);
          } else {
            // success!
            console.log('Starting Activity Status ' + res);
          }
        });
      });

      // let input phase last for 120 seconds the first round, 60 seconds other rounds
      if (update.status === 1) {
        console.log('[INDIVIDUAL PHASE]');
        clearTimeout(timeout_timer);
        timeout_timer = setTimeout(() => endPhase(_id, 2), duration * 1000);
      }

      // team formation
      if (update.status === 2) {
        console.log('[TEAM FORMATION PHASE]');

        // get snapshot of participants and activities in session
        const session_id = Activities.findOne(_id).session_id;
        const sess = Sessions.findOne(session_id);
        const participants = sess.participants;

        // decide which kind of team formation to undergo
        const acts = sess.activities;
        const prevActIndex = acts.indexOf(_id) - 1;
        const teamFormStart = new Date();

        // get the teamHistory from Sessions
        const teamHistory = sess.teamHistory;
        const colored_shapes = [];
        let teams = [];

        // Stable team-building??
        buildColoredShapes(colored_shapes);
        teams = formTeams(participants.slice(0), prevActIndex, teamHistory);

        // update the teamHistory matrix
        Meteor.call('sessions.updateTeamHistory_TeamFormation', teams, sess.teamHistory, session_id, (err, res) => {
          if (err) {
            alert(err);
          } else {
            // success!
            console.log('\nUpdated Team History Matrix.');
          }
        });

        // update the database collections
        const team_ids = [];

        for (let i = 0; i < teams.length; i++) {
          team_ids.push(
            Teams.insert({
              activity_id: _id,
              teamCreated: new Date().getTime(),
              members: teams[i].map(pid => ({ pid, userNumber: Math.floor(Math.random() * 9) + 1 })),
              color: colored_shapes[i].color,
              shape: colored_shapes[i].shape,
              teamNumber: teams.length,
              confirmed: false,
              responses: []
            })
          );

          for (let j = 0; j < teams[i].length; j++) {
            Users.update(
              {
                pid: teams[i][j]
              },
              {
                $push: {
                  teamHistory: {
                    team: team_ids[i],
                    //teamNumber: Math.floor(Math.random() * 9) + 1, // for the sum game
                    activity_id: _id
                  }
                }
              }
            );
          }
        }

        //FIXME: Using python script
        // var python_start = new Date();
        // const options = {
        //   args: [session_id, _id, participants.join(',')]
        // };

        // const form_teams = Assets.absoluteFilePath('teamFormation/form_teams.py');

        // PythonShell.run(form_teams, options, function(err, results) {
        //   if (err) throw err;

        //   // results is an array consisting of messages collected during execution
        //   console.log(new Date() - python_start);
        //   console.log('results: %j', results);
        // });

        //start and update activity on database
        Activities.update(
          _id,
          {
            $set: {
              'statusStartTimes.teamForm': new Date().getTime(),
              team_ids,
              allTeamsFound: false
            }
          },
          error => {
            if (!error) {
              console.log('Teams created!');
            } else {
              console.log(error);
            }
          },
          () => {
            console.log(new Date() - teamFormStart);
          }
        );
      }

      // discussion time!
      if (update.status === 3) {
        console.log('[TEAM PHASE]');
        clearTimeout(timeout_timer);
        timeout_timer = setTimeout(() => endPhase(_id, 4), duration * 1000); // move on to next phase
      }

      // activity just ended
      if (update.status === 5) {
        // get session in context
        const session = Sessions.findOne({ activities: _id });

        // get next activity
        const nextActivity = Activities.findOne({ session_id: session._id, status: 0 }, { sort: { timestamp: 1 } });

        // no activities left!! end session...
        if (!nextActivity) {
          Sessions.update(session._id, {
            $set: {
              status: 2,
              endTime: new Date().getTime()
            }
          });
        }
        // start next activity! // FIXME: nono
        else {
          Meteor.call('activities.updateStatus', nextActivity._id, (err, res) => {
            if (err) {
              alert(err);
            } else {
              // success!
              console.log('Starting Activity Status ' + res);
            }
          });
        }
      }
    }
  });
});
