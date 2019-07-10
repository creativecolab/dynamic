import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';

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
import { buildInitialTeams, buildNewTeams } from './grouping-helper.js'

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

/* Meteor methods (server-side function, mostly database work) */
Meteor.methods({
  'activities.updateStatus': function(activity_id) {
    try {
      const activity = Activities.findOne(activity_id);

      const currentStatus = activity.status;

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

  'users.addPoints': function({ user_id, session_id, points }) {
    //TODO: points_history changed to sessionHistory
    Users.update(
      { _id: user_id, 'points_history.session': session_id },
      {
        $set: {
          'points_history.$.points': points
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
  if (Questions.find({}).count() != 0) {
    return;
  }
  Questions.remove({});
  dbquestions.map(q => {
    Questions.insert({
      prompt: q,
      default: true,
      createdTime: new Date().getTime(),
      viewedTimer: 0,
      selectedCount: 0
    });
  });
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
      if (update.members) {
        // if all confirmed, set team formation time
        if (update.members.map(x => x.confirmed).reduce((res, x) => res && x)) {
          const team = Teams.findOne(_id);
          const activity = Activities.findOne(team.activity_id);

          Teams.update(team._id, {
            $set: {
              teamFormationTime: new Date().getTime() - activity.statusStartTimes.indvPhase
            }
          });
        }
      }

      // get current activity in context
      const activity_id = Teams.findOne(_id).activity_id;

      // get number of teams that have not confirmed yet
      const num_not_confirmed = Teams.find({ activity_id, 'members.confirmed': false }).count();

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

      // let input phase last for 120 seconds the first round, 60 seconds other rounds
      if (update.status === 1) {
        console.log('[INDIVIDUAL PHASE]');
        this.timer1 = setTimeout(() => endPhase(_id, 2), duration * 1000); //TODO: MAKE THIS DURATION NOT HARDCODED
      }

      // team formation
      if (update.status === 2) {
        console.log('[TEAM FORMATION PHASE]');

        // get the questions we need
        const questions = Questions.find({}).fetch(); // TODO: move this somewhere else

        // get snapshot of participants and activities in session
        const session_id = Activities.findOne(_id).session_id;
        const sess = Sessions.findOne(session_id);
        const participants = sess.participants;
        const acts = sess.activities;

        // decide which kind of team formation to undergo
        const prevActIndex = acts.indexOf(_id) - 1;
        let teams = [];
        if (prevActIndex < 0) teams = buildInitialTeams(_id, participants.slice(0), questions);
        else teams = buildNewTeams(_id, participants.slice(0), questions);

        // start and update activity on database
        Activities.update(
          _id,
          {
            $set: {
              teams,
              allTeamsFound: false
            }
          },
          error => {
            if (!error) {
              console.log('Teams created!');
            } else {
              console.log(error);
            }
          }
        );
      }

      // discussion time!
      if (update.status === 3) {
        console.log('[TEAM PHASE]');
        clearTimeout(this.timer1);
        this.timer2 = setTimeout(() => endPhase(_id, 4), duration * 1000); // move on to next phase
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

  // debug flag, useful for styling
  const debug = true;

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
});
