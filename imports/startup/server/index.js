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

import './register-api';
import { formTeams } from './team-former';
import {
  getPreference,
  getInteractions,
  getUserHistory,
  getUserJoinTimes,
  getTeamConfirmationTimes,
  getUserAssessmentTimes
} from './data-getter';
import { buildColoredShapes, calculateDuration, readPreferences, defaultPreferences, createDefaultQuestions } from './helper-funcs';
import { updateTeamHistory_LateJoinees, updateTeamHistory_TeamFormation } from './team-historian';

let timeout_timer;
let teams = [];

/* Meteor start-up function, called once server starts */
Meteor.startup(() => {
  // handles session start/end
  const sessionCursor = Sessions.find({});

  sessionCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + ' updated.');
      console.log(update);

      // start session!
      if (update.status === 1) {
        const session = Sessions.findOne(_id);

        // check if this is a specially made session
        if (session.instructor) {
          // fufill preferences
          readPreferences(session.instructor, session._id);
        } 
        // make some default stuff
        else {
          // create 6 default activities
          if (!session.activities) {
            defaultPreferences(session._id);
          }
          createDefaultQuestions();
        }

        // start first activity
        const firstActivity = Activities.findOne({ session_id: _id, index: 0 });
        Meteor.call('activities.updateStatus', firstActivity._id, (err, res) => {
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
      }

      // set team formation time
      if (update.assessed) {
        // if all confirmed, set team formation time
        // if (update.members.map(x => x.confirmed).reduce((res, x) => res && x)) {
        const team = Teams.findOne(_id);
        const activity = Activities.findOne(team.activity_id);

        Teams.update(team._id, {
          $set: {
            peerAssessmentTime: new Date().getTime() - activity.statusStartTimes.teamPhase
          }
        });
      }

      // get current activity in context
      const activity_id = Teams.findOne(_id).activity_id;

      // during teamFormation, see if all teams have confirmed to try to move on
      if (Activities.findOne(activity_id).status === ActivityEnums.status.TEAM_FORMATION) {
        // get number of teams that have not confirmed yet
        const num_not_confirmed = Teams.find({ activity_id, confirmed: false }).count();

        console.log(num_not_confirmed + " teams haven't confirmed yet.");

        // everyone confirmed, no need to wait
        if (num_not_confirmed === 0) {
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
      } else if (Activities.findOne(activity_id).status === ActivityEnums.status.ASSESSMENT) {
        // get number of teams that have not confirmed yet
        const num_not_assessed = Teams.find({ activity_id, assessed: false }).count();

        console.log(num_not_assessed + (num_not_assessed === 1 ? " team hasn't" : " teams haven't") + ' assessed yet.');

        // everyone confirmed, no need to wait
        if (num_not_assessed === 0) {
          Activities.update(activity_id, {
            $set: {
              allTeamsAssessed: true
            }
          });
          Meteor.call('activities.updateStatus', activity_id, (err, res) => {
            if (err) {
              console.log(err);
            } else {
              // success!
              console.log('Ending Activity ' + res);
            }
          });
        }
      }
    }
  });

  // handles team formation
  const activitiesCursor = Activities.find({});

  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log('[Activity] ' + _id + ' updated.');
      console.log(update);

      // get duration
      let duration = 0;
      let activity;

      if (update.status) {
        activity = Activities.findOne({ _id });

        duration = calculateDuration(activity);
      }

      // debug flag, useful for styling
      const debug = false;

      // called to end an activity phase
      const endPhase = Meteor.bindEnvironment((activity_id, status) => {
        if (debug) return;

        Meteor.call('activities.updateStatus', activity_id, (err, status) => {
          if (err) {
            console.log(err);
          } else {
            // success!
            console.log('Starting Activity Status ' + status);
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

        // get snapshot of participants and teamHistory in session that this activity is in. one db call
        const session = Sessions.findOne({ activities: _id });

        // prepare for team formation
        const colored_shapes = [];
        const prevActIndex = session.activities.indexOf(_id) - 1;

        // time our team formation
        const teamFormStart = new Date();

        // update the teamHistory matrix in case we got some late joinees
        updateTeamHistory_LateJoinees(session._id);

        // Stable team-building??
        buildColoredShapes(colored_shapes);
        teams = formTeams(session._id, prevActIndex, activity.teamSize);

        // update the database collections
        const team_ids = [];

        for (let i = 0; i < teams.length; i++) {
          team_ids[team_ids.length] =
            Teams.insert({
              activity_id: _id,
              teamCreated: new Date().getTime(),
              members: teams[i].map(pid => ({ pid, fruitNumber: Math.floor(Math.random() * 9) + 1 })),
              color: colored_shapes[i].color,
              shape: colored_shapes[i].shape,
              teamNumber: teams.length,
              confirmed: false,
              assessed: false,
              teamFormationTime: 0,
              peerAssessmentTime: 0
            });

          for (let j = 0; j < teams[i].length; j++) {
            Users.update(
              {
                pid: teams[i][j]
              },
              {
                $push: {
                  teamHistory: {
                    team: team_ids[i],
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
            console.log('Team Formation Elapsed Time: ' + (new Date() - teamFormStart));
          }
        );
      }

      // discussion time!
      if (update.status === 3) {
        console.log('[TEAM PHASE]');
        clearTimeout(timeout_timer);
        timeout_timer = setTimeout(() => endPhase(_id, 4), duration * 1000); // move on to next phase
        // update the teamHistory matrix after the teams have been formed, during the next phase to save time
        const session_id = Activities.findOne(_id).session_id;
        updateTeamHistory_TeamFormation(session_id, teams);
      }

      // activity just ended
      if (update.status === 5) {
        // get session in context
        const session = Sessions.findOne({ activities: _id });

        // get next activity
        const nextActivity = Activities.findOne(
          { session_id: session._id, status: ActivityEnums.status.READY },
          { sort: { index: 1 } }
        );

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

/* Meteor methods (server-side function, mostly database work) */
Meteor.methods({
  'users.addUser': function(pid, name) {
    Users.insert({
      name: name,
      pid,
      joinTime: new Date().getTime(),
      teamHistory: [],
      sessionHistory: [],
      preferences: []
    });
  },

  'sessions.addUser': function(pid, session_id) {
    // note the session join time
    const user_id = Users.findOne({pid: pid})._id;
    Users.update(user_id, {
      $push: {
        sessionHistory: {
          session_id: session_id,
          sessionJoinTime: new Date().getTime(),
          points: 0
        }
      }
    });

    // add user to session
    Sessions.update(session_id, {
        $push: {
          participants: pid
        }
      }
    );
  },

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
          //console.log('Saved past question');
        } else {
          console.log(error);
        }
      }
    );

    // update how many times the next question has been viewed
    if (next_question != '') {
      Questions.update(
        next_question,
        {
          $inc: {
            timesViewed: 1
          }
        },
        error => {
          if (!error) {
            //console.log('Saved next question');
          } else {
            console.log(error);
          }
        }
      );
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

/* APIs */

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

  Api.addRoute('interactions/:code', {
    get() {
      const content_disposition = 'attachment; filename=interactions_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getInteractions(this.urlParams.code)
      };
    }
  });

  Api.addRoute('users/:code', {
    get() {
      const content_disposition = 'attachment; filename=users_' + this.urlParams.code.toLowerCase() + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getUserHistory(this.urlParams.code)
      };
    }
  });

  Api.addRoute('last-teams/:code', {
    get() {
      const content_disposition = 'attachment; filename=last-teams_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getLastTeams(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-join-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-join-times_' + this.urlParams.code + '.txt';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getUserJoinTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('team-confirmation-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=team-confirmation-times_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getTeamConfirmationTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-confirmation-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-confirmation-times_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getUserConfirmationTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-assessment-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-assessment-times_' + this.urlParams.code + '.txt';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: getUserAssessmentTimes(this.urlParams.code)
      };
    }
  });
}
