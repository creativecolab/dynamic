import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';

import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';
import Questions from '../../api/questions';
import dbquestions from './dbquestions';

import './register-api';
import Responses from '../../api/responses';

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

  // for (let i = 0; i < participants.length; i++) {
  //   // find current user
  //   const user = Users.findOne({ pid: participants[i] });

  //   ret += `"${user.name}","${user.pid.toUpperCase()}",`;

  //   // iterate through activities
  //   for (let a = 0; a < activities.length; a++) {
  //     // append activity_id
  //     // ret += activities[a] + ",";

  //     // find team
  //     const team = Teams.findOne({ activity_id: activities[a], 'members.pid': user.pid });

  //     if (!team) {
  //       // ret += "no_team\n";
  //       continue;
  //     }

  //     // append team pids
  //     // ret += `"${team.members.map(m => m.pid.toUpperCase())}",`;

  //     let pref = '';

  //     for (let j = 0; j < user.preference.length; j++) {
  //       if (user.preference[j].activity_id === activities[a]) {
  //         pref = user.preference[j].pid;
  //         break;
  //       }
  //     }

  //     ret += pref.toUpperCase() + ',';

  //     if (pref !== '' && pref !== 'all') ret += `"${Users.findOne({ pid: pref }).name}",`;
  //     else ret += ',';

  //     // not_pref
  //     if (team) {
  //       if (pref === 'all') ret += ',';
  //       else
  //         ret += `"${team.members.filter(m => m.pid !== pref && m.pid !== user.pid).map(m => m.pid.toUpperCase())}",`;
  //       // ret += `"${team.members.filter(m => m.pid !== pref && m.pid !== user.pid).map(m => Users.findOne({pid: m.pid}).name).toString()}"`;
  //     }
  //   }

  //   ret += '\n';
  // }
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

// hard-coded roster for testing
function updateRoster() {
  const roster = [
    {
      name: 'Gustavo Umbelino',
      firstname: 'Gustavo',
      lastname: 'Umbelino',
      pid: 'gus',
      section: '2pm',
      points_history: [],
      preference: []
    },
    {
      name: 'Vivian Ta',
      firstname: 'Vivian',
      lastname: 'Ta',
      pid: 'viv',
      section: '3pm',
      points_history: [],
      preference: []
    },
    {
      name: 'Eric Truong',
      firstname: 'Eric',
      lastname: 'Truong',
      pid: 'eric',
      section: '3pm',
      points_history: [],
      preference: []
    },
    {
      name: 'Steven Dow',
      firstname: 'Steven',
      lastname: 'Dow',
      pid: 'steven',
      section: '3pm',
      points_history: [],
      preference: []
    },
    {
      name: 'Samuel Blake',
      firstname: 'Samuel',
      lastname: 'Blake',
      pid: 'sam',
      section: '2pm',
      points_history: [],
      preference: []
    }
  ];

  // iterate through users in roster
  roster.map(user => {
    // find user in database
    const dbuser = Users.findOne({ pid: user.pid });

    // user already exists
    if (dbuser) return;

    // insert to database
    Users.insert(
      {
        ...user,
        teammates: []
      },
      () => {
        console.log(user.name + ' inserted to mongo!');
      }
    );
  });
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

  // createQuestions();

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
        // helper function to shuffle array
        // reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        const shuffle = a => {
          for (let i = a.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));

            [a[i], a[j]] = [a[j], a[i]];
          }

          return a;
        };

        // get snapshot of participants in session
        const session_id = Activities.findOne(_id).session_id;
        const participants = Sessions.findOne(session_id).participants;
        const questions = Questions.find({}).fetch();

        // TODO: get these from instructor
        const MAX_TEAM_SIZE = 3;
        const MAX_NUM_TEAMS = 50;

        //--- SET COLORS ---//

        // // set of team colors
        // const colors = [];

        // // helper method to generate a new color
        // const getRandomColor = () => {
        //   const letters = '123456789A';
        //   let color = '#';

        //   for (let i = 0; i < 6; i++) {
        //     color += letters[Math.floor(Math.random() * 10)];
        //   }

        //   return color;
        // };

        // // make array of random colors
        // for (let i = 0; i < MAX_NUM_TEAMS; i++) {
        //   const newColor = getRandomColor();

        //   if (!colors.includes(newColor)) colors.push(newColor);
        //   else i--;
        // }

        const shapes = shuffle(['circle', 'cross', 'moon', 'square', 'star', 'sun', 'heart', 'car', 'triangle']);
        const shapeColors = shuffle(['blue', 'green', 'orange', 'red']);
        const colored_shapes = [];

        for (let i = 0; i < shapes.length; i++) {
          for (let j = 0; j < shapeColors.length; j++) {
            colored_shapes.push({ shape: shapes[i], color: shapeColors[j] });
          }
        }

        shuffle(colored_shapes);

        //--- SEPARATE EVERYONE BY SECTION ---// //TODO: Currently deprecated (not using sections)
        // const session_sections = {};

        // for (let j = 0; j < participants.length; j++) {
        //   const participant_section = Users.findOne({ pid: participants[j] }).section;

        //   if (!session_sections.hasOwnProperty(participant_section.toLowerCase())) {
        //     //first time seeing this section
        //     session_sections[participant_section.toLowerCase()] = [];
        //   }

        //   session_sections[participant_section.toLowerCase()].push(participants[j]);
        // }

        // --- Order Object based on the size of sections (smaller sections last) --- //
        // const sortable = [];

        // for (const section in session_sections) {
        //   sortable.push([section, session_sections[section]]);
        // }
        // // console.log("Unsorted: " + sortable);

        // sortable.sort(function(section1, section2) {
        //   return section1[1].length < section2[1].length;
        // });
        // // console.log("Sorted: " + sortable);

        // //--- FORM TEAMS ---//
        // const teams = [];
        // let oldTeam = [];
        // let olderTeam = [];
        // let team_id = '';
        // let older_team_id = '';

        // for (const section in session_sections) {  <-- deprecated code
        //   // make teams based on sections
        //   if (session_sections.hasOwnProperty(section)) {
        //     // console.log(section + " -> " + session_sections[section]);
        //     // used to keep track of current and older teams for database
        //     const section_members = session_sections[section];

        //     shuffle(section_members);
        //     //console.log("Participants: " + section_members);

        //     // form teams, teams of 3
        //     let newTeam = [section_members[0]];

        //array to hold the team_ids of all the created teams
        const teams = [];

        //array to hold the current team being built
        let newTeam = [participants[0]];

        //arrays and saved team_ids to saved previously built teams in the case of uneven sizings
        let oldTeam = [];
        let olderTeam = [];
        let team_id = '';
        let older_team_id = '';

        // team formation process
        for (let i = 1; i < participants.length; i++) {
          // completed a new team
          if (i % MAX_TEAM_SIZE == 0) {
            // second most-recent team created
            older_team_id = team_id;
            // most recent team created
            team_id = Teams.insert({
              activity_id: _id,
              teamCreated: new Date().getTime(),
              members: newTeam.map(pid => ({ pid, confirmed: false })),
              color: colored_shapes[teams.length].color,
              shape: colored_shapes[teams.length].shape,
              responses: [],
              questions: shuffle(questions),
              index: 0
            });

            //update the users teammates
            for (let k = 0; k < newTeam.length; k++) {
              Users.update(
                { pid: newTeam[k] },
                {
                  $push: {
                    teamHistory: {
                      team: team_id,
                      activity: _id
                    }
                  }
                }
              );
            }

            // keep track of older teams just in case
            olderTeam = oldTeam;
            oldTeam = newTeam;

            // save this added team
            teams.push(team_id);

            //onto next member
            newTeam = [participants[i]];
          }

          // add new member to team
          else {
            newTeam.push(participants[i]);
          }
        }

        // only 1 participant left, create team of MAX_TEAM_SIZE + 1 because there is already a team of 3
        if (newTeam.length === 1 && teams.length > 0 && oldTeam.length < 4) {
          // update the team in database
          Teams.update(team_id, {
            $push: {
              members: { pid: newTeam[0], confirmed: false }
            }
          });
          // update this odd-one out user's team history
          Users.update(
            { pid: newTeam[0] },
            {
              $push: {
                teamHistory: { team: team_id, activity: _id }
              }
            }
          );

          oldTeam.push(newTeam[0]);

          // //update the users teammates (don't need this anymore)
          // Users.update(
          //   { pid: newTeam[0] },
          //   {
          //     $push: {
          //       teammates: oldTeam.filter(teammate => teammate != newTeam[0])
          //     }
          //   }
          // );
        }

        // only 2 participants left, create 2 teams of MAX_TEAM_SIZE + 1
        else if (
          newTeam.length === MAX_TEAM_SIZE - 1 &&
          teams.length > 1 &&
          oldTeam.length < MAX_TEAM_SIZE + 1 &&
          olderTeam.length < MAX_TEAM_SIZE + 1
        ) {
          // add the first user to an older team
          Teams.update(team_id, {
            $push: {
              members: { pid: newTeam[0], confirmed: false }
            }
          });
          // update the first odd-one-out user's team history
          Users.update(
            { pid: newTeam[0] },
            {
              $push: {
                teamHistory: { team: team_id, activity: _id }
              }
            }
          );
          // keep track of this now team of 4
          oldTeam.push(newTeam[0]);

          // add the second user
          Teams.update(older_team_id, {
            $push: {
              members: { pid: newTeam[1], confirmed: false }
            }
          });
          // update the second odd-one-out user's team history
          Users.update(
            { pid: newTeam[1] },
            {
              $push: {
                teamHistory: { team: older_team_id, activity: _id }
              }
            }
          );
          //also keep track of this now team of 4
          olderTeam.push(newTeam[1]);
        }

        // last team is of MAX_TEAM_SIZE or less and there aren't enough other teams to build proper teams of MAX_SIZE+1
        else if (newTeam.length <= MAX_TEAM_SIZE) {
          team_id = Teams.insert({
            activity_id: _id,
            teamCreated: new Date().getTime(),
            members: newTeam.map(pid => ({ pid, confirmed: false })),
            color: colored_shapes[teams.length].color,
            shape: colored_shapes[teams.length].shape,
            responses: [],
            questions: shuffle(questions),
            index: 0
          });

          // keep track of older teams just in case
          olderTeam = oldTeam;
          oldTeam = newTeam;

          //update each of these left-out users' team histories
          for (let k = 0; k < newTeam.length; k++) {
            Users.update(
              { pid: newTeam[k] },
              {
                $push: {
                  teamHistory: { team: team_id, activity: _id }
                }
              }
            );
          }

          teams.push(team_id);
        }
        //   }
        // }

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
          Activities.update(nextActivity._id, {
            $set: {
              status: 2,
              startTime: new Date().getTime(),
              statusStartTime: new Date().getTime()
            }
          });
        }
      }
    }
  });

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
});
