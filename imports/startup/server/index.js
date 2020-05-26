import { Meteor } from 'meteor/meteor';
// import { PythonShell } from 'python-shell';

// enums
import ActivityEnums from '../../enums/activities';
import SessionEnums from '../../enums/sessions';

// collections
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';

// bundle modules
import './meteor-methods';
import './register-api';
import { formTeams } from './team-former';
import { buildColoredShapes, calculateDuration, readPreferences,
         defaultPreferences, createDefaultQuestions } from './helper-funcs';
import { updateTeamHistory_LateJoinees, updateTeamHistory_TeamFormation } from './team-historian';
import { getEmailCredentials, sendEmails } from './email-helper';

let timeout_timer;
let teams = [];

/* Meteor start-up function, called once server starts */
Meteor.startup(() => {

  /* Environment Variables */
  //TODO: Set up email credentials cleanly
  process.env.MAIL_URL = getEmailCredentials();

  /* Follow changes that occur to the Sessions collection */
  const sessionCursor = Sessions.find({});

  sessionCursor.observeChanges({
    changed(_id, update) {
      console.log('\n[Session] ' + _id + ' updated.');
      console.log(update);

      // start session!
      if (update.status === SessionEnums.status.ACTIVE) {
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
            console.log(err);
          } else {
            // success!
            console.log('\nStarting Activity Status ' + res);
          }
        });
      } 

      if (update.status === SessionEnums.status.SUMMARY) {
        // during this status, monitor if all participants are done viewing the summary
        console.log("Activities complete, users are viewing the session summary.");
      }

      // check if all participants have confirmed their emails
      if (update.doneParticipants) {
        // get the session of interest
        const session = Sessions.findOne(_id);

        // check if everyone has confirmed their emails
        if (session.participants.length == update.doneParticipants.length) {
          // if everyone is done, automatically move on
          console.log("All users have confirmed their emails.");
          Sessions.update(_id, 
            { $set: {
              status: SessionEnums.status.FINISHED
            }
          });
        }
      }

      if (update.status === SessionEnums.status.FINISHED) {
        // clear teamHistory from Session to make it more readable in db
        Sessions.update(_id, {
          $set: {
            teamHistory: {}
          }
        }, () => console.log("Session Complete.\n"));
        // send out emails to everyone in 5 minutes
        clearTimeout(timeout_timer);
        timeout_timer = setTimeout(() => sendEmails(_id), 30 * 1000);
      }
      
    }
  });

  /* Follow changes that occur to the Teams collection */
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
            teamFormationTime: new Date().getTime() - activity.statusStartTimes.teamForm
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
            peerAssessmentTime: new Date().getTime() - activity.statusStartTimes.peerAsessment
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
              console.log(err);
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
              console.log('All members have completed the assessment. Ending Activity ' + res);
            }
          });
        }
      }
    }
  });

  /* Follow changes that occur to the Activities collection */
  const activitiesCursor = Activities.find({});

  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log('\n[Activity] ' + _id + ' updated.');
      console.log(update);

      // get duration
      let duration = 0;
      let activity;

      if (update.status) {
        activity = Activities.findOne({ _id });

        duration = calculateDuration(activity);
      }

      // debug flag, useful for verifying styling changes to main activity screen
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

      if (update.status === ActivityEnums.status.BUILDING_TEAMS) {
        console.log('\n[BUILDING TEAMS PHASE]');
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
              removed: true,
              teamFormationTime: 0,
              peerAssessmentTime: 0,
              currentQuestions: teams[i].map(pid => ({ pid, question_ind:0}))
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

        // move this activity forward now that teams have been formed.
        Meteor.call('activities.updateStatus', activity._id, (err, res) => {
          if (err) {
            console.log(err);
          } else {
            // success!
            console.log('\nStarting Activity Status ' + res);
          }
        });
      }

      // team formation
      if (update.status === ActivityEnums.status.TEAM_FORMATION) {
        console.log('\n[FORMATION PHASE]');

      }

      // discussion time!
      if (update.status === ActivityEnums.status.INPUT_TEAM) {
        console.log('\n[ACTIVITY PHASE]');
        clearTimeout(timeout_timer);
        timeout_timer = setTimeout(() => endPhase(_id, ActivityEnums.status.INPUT_TEAM), duration * 1000); // move on to next phase
        // update the teamHistory matrix after the teams have been formed, during the next phase to save time
        const session_id = Activities.findOne(_id).session_id;
        updateTeamHistory_TeamFormation(session_id, teams);
      }

      // group assessment
      if (update.status === ActivityEnums.status.ASSESSMENT) {
        console.log('\n[ASSESSMENT PHASE]');
        clearTimeout(timeout_timer); // in case the last phase was ended early

      }

      // activity just ended
      if (update.status === ActivityEnums.status.FINISHED) {
        console.log('\n[ACTIVITY FINISHED]');
        // get session in context
        const session = Sessions.findOne({ activities: _id });

        // get next activity
        const nextActivity = Activities.findOne(
          { session_id: session._id, status: ActivityEnums.status.READY },
          { sort: { index: 1 } }
        );

        // no activities left!! end active session...
        if (!nextActivity) {
          console.log("Ending Session...");
          Sessions.update(session._id, {
            $set: {
              status: SessionEnums.status.SUMMARY,
              summaryTime: new Date().getTime()
            }
          });
        }
        // start next activity! 
        else {         
          Meteor.call('activities.updateStatus', nextActivity._id, (err, res) => {
            if (err) {
              console.log(err);
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
