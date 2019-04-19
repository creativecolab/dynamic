import { Meteor } from 'meteor/meteor';

import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';

import './register-api';

// hard-coded roster for testing
function updateRoster() {

  const roster = [{
    name: 'Gustavo Umbelino',
    firstname: 'Gustavo',
    lastname: 'Umbelino',
    pid: 'gus',
    section: 'A00',
    points_history: [],
    preference: []
  },
  {
    name: 'Vivian Ta',
    firstname: 'Vivian',
    lastname: 'Ta',
    pid: 'viv',
    section: 'B00',
    points_history: [],
    preference: []
  },
  {
    name: 'Eric Truong',
    firstname: 'Eric',
    lastname: 'Truong',
    pid: 'eric',
    section: 'C00',
    points_history: [],
    preference: []
  },
  {
    name: 'Steven Dow',
    firstname: 'Steven',
    lastname: 'Dow',
    pid: 'steven',
    section: 'C00',
    points_history: [],
    preference: []
  },
  {
    name: 'Samuel Blake',
    firstname: 'Samuel',
    lastname: 'Blake',
    pid: 'sam',
    section: 'B00',
    points_history: [],
    preference: []
  }];

  // iterate through users in roster
  roster.map(user => {

    // find user in database
    const dbuser = Users.findOne({pid: user.pid});

    // user already exists
    if (dbuser) return;

    // insert to database
    Users.insert({
      ...user,
      teammates: []
    }, () => {
      console.log(user.name + ' inserted to mongo!')
    })
  });

}

/* Meteor methods (server-side function, mostly database work) */
Meteor.methods({
  'activity.start'({ activity_id }) {
    // new SimpleSchema({
    //   team_id: { type: String },
    //   username: { type: String }
    // }).validate({ team_id, username });

    console.log(Activities.findOne(activity_id));
    // Teams.rawCollection().update(team_id,
    //   { $set: { "members.$[elem].confirmed": true } },
    //   {
    //     arrayFilters: [ { "elem.username": username } ]
    //   }
    // );
    // console.log(Teams.findOne(team_id));

  },

  'users.addPoints' ({ user_id, session_id, points }) {
    Users.update({_id: user_id, "points_history.session": session_id}, {
      $set: {
        "points_history.$.points": points
      }
    }, () => {
      //track the session that was created
      Logs.insert({
        log_type: "Points Added",
        code: session_id,
        user: Users.findOne(user_id).pid,
        timestamp: new Date().getTime(),
      });
    });
  }

});

/* Meteor start-up function, called once server starts */
Meteor.startup(() => {

  //TODO: NO MORE THIS
  // IF WE PUSH THIS TO HEROKU,
  // WE LOSE ALL OUR DATA!!!
  //clearCollections(); 

  // update roster on startup
  updateRoster();

  // handles session start/end
  const sessionCursor = Sessions.find({});
  sessionCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + " updated.");
      console.log(update);

      // start session!
      if (update.status === 1) {

        // start first activity
        const session = Sessions.findOne(_id);
        Activities.update(session.activities[0], {
          $set: {
            status: 1,
            startTime: new Date().getTime(),
            statusStartTime: new Date().getTime()
          }
        });

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
              teamFormationTime: new Date().getTime() - activity.statusStartTime
            }
          });

        }
      }

      // get current activity in context
      const activity_id = Teams.findOne(_id).activity_id;

      // get number of teams that have not confirmed yet
      const num_not_confirmed = Teams.find({activity_id, 'members.confirmed': false}).count();
      console.log(num_not_confirmed + ' teams haven\'t confirmed yet.');

      // everyone confirmed, no need to wait
      if (num_not_confirmed === 0 && Activities.findOne(activity_id).status === 2) {
        Activities.update(activity_id, {
          $set: {
            status: 3,
            statusStartTime: new Date().getTime()
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
    const { durationIndv, durationOffsetIndv} = activity;
    const { durationTeam, durationOffsetTeam} = activity;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
        return index === 0? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return index === 0? durationTeam : durationTeam - durationOffsetTeam;
    
    return -1;
    
  }

  // handles team formation
  const activitiesCursor = Activities.find({});
  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + " updated. [Activity]");
      console.log(update);

      // get duration
      let duration = 0;
      if (update.status) {
        const activity = Activities.findOne({_id});
        duration = calculateDuration(activity);
      }

      // let input phase last for 120 seconds the first round, 60 seconds other rounds
      if (update.status === 1) {
        console.log('[ACTIVITY STARTED]')
        this.timer1 = setTimeout(
          () => endPhase(_id, 2),
          duration * 1000
        );
      }

      // start activity! aka form teams
      if (update.status === 2) {

        // helper function to shuffle array
        // reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
        const shuffle = (a) => {
          for (let i = a.length - 1; i > 0; i--) {
              const j = Math.floor(Math.random() * (i + 1));
              [a[i], a[j]] = [a[j], a[i]];
          }
          return a;
        }

        // get snapshot of participants in session
        const session_id = Activities.findOne(_id).session_id;
        const participants  = Sessions.findOne(session_id).participants;
        shuffle(participants); // TODO -- maybe shuffle after grouping into sections
        console.log("Participants: " + participants);

        // TODO: get these from instructor
        const MAX_TEAM_SIZE = 3;
        const MAX_NUM_TEAMS = 50;

        //--- SET COLORS ---//

        // set of team colors
        const colors = [];

        // helper method to generate a new color
        const getRandomColor = () => {
          var letters = '123456789A';
          var color = '#';
          for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 10)];
          }
          return color;
        }

        // make array of random colors
        // TODO: get MAX_NUM_TEAMS from instructor!
        for (let i = 0; i < MAX_NUM_TEAMS; i++) {
          let newColor = getRandomColor();
          if (!colors.includes(newColor)) colors.push(newColor);
          else i--;
        }

        const shapes = shuffle(['circle', 'cross', 'moon', 'square', 'star', 'triangle']);
        const shapeColors = shuffle(['blue', 'brown', 'green', 'orange', 'purple', 'red']);
        const colored_shapes = []
        for (let i = 0; i < shapes.length; i++) {
          for (let j = 0; j < shapeColors.length; j++) {
            colored_shapes.push({shape: shapes[i], color: shapeColors[j]});
          }
        }

        //--- FORM TEAMS ---//

        // TODO, separate everyone by section
        var session_sections = {}

        for (let j = 0; j < participants.length; j++) {
          var participant_section = Users.findOne({pid: participants[j]}).section;
          if (!(session_sections.hasOwnProperty(participant_section))) {
            //first time seeing this section
            session_sections[participant_section] = [];
          }
          session_sections[participant_section].push(participants[j]);
        }

        console.log(session_sections);

        // used to keep track of current and older teams for database
        let teams = [];
        let oldTeam = [];
        let olderTeam = [];
        let team_id = "";
        let older_team_id = "";

        // form teams, teams of 3
        let newTeam =[participants[0]];
        for (let i = 1; i < participants.length; i++) {

          // completed a new team
          // TODO: get MAX_TEAM_SIZE from instructor!
          if (i % MAX_TEAM_SIZE == 0) {
            // second most-recent team created
            older_team_id = team_id;
            // most recent team created
            team_id = Teams.insert({
              activity_id: _id,
              timestamp: new Date().getTime(),
              members: newTeam.map(pid => ({pid, confirmed: false})),
              color: colors[teams.length],
              shape: colored_shapes[teams.length].shape,
              shapeColor: colored_shapes[teams.length].color,
              responses: []
            });

            //update the users teammates 
            for (let k = 1; k < newTeam.length; k++) {
              Users.update({pid: newTeam[k]}, {
                $set: {
                  teammates: newTeam.filter(teammate => teammate != newTeam[k])
                }
              });
            }

            // save this added team
            teams.push(team_id);

            // keep track of older teams just in case
            olderTeam = oldTeam
            oldTeam = newTeam;
            newTeam = [participants[i]];
          }
          
          // add new member to team
          else {
            newTeam.push(participants[i]);
          }
        }

        // only 1 participant left, create team of MAX_TEAM_SIZE + 1
        if (newTeam.length === 1) {
          Teams.update(team_id, {
            $push: {
              members: {pid: newTeam[0], confirmed: false}
            }
          });

          //update the users teammates 
          Users.update({pid: newTeam[0]}, {
            $set: {
              teammates: oldTeam
            }
          });

        }

        // only 2 participants left, create 2 teams of MAX_TEAM_SIZE + 1
        else if (newTeam.length === 2 && teams.length > 1) {
          // add the first user
          Teams.update(team_id, {
            $push: {
              members: {pid: newTeam[0], confirmed: false}
            }
          });
          //update the users teammates 
          Users.update({pid: newTeam[0]}, {
            $set: {
              teammates: oldTeam
            }
          });

          // add the second user
          Teams.update(older_team_id, {
            $push: {
              members: {pid: newTeam[1], confirmed: false}
            }
          });
          //update the users teammates 
          Users.update({pid: newTeam[0]}, {
            $set: {
              teammates: olderTeam
            }
          });
        }

        // last team is of MAX_TEAM_SIZE or less
        else if (newTeam.length <= MAX_TEAM_SIZE) {
          team_id = Teams.insert({
            activity_id: _id,
            timestamp: new Date().getTime(),
            members: newTeam.map(pid => ({pid, confirmed: false})),
            color: colors[teams.length],
            shape: colored_shapes[teams.length].shape,
            shapeColor: colored_shapes[teams.length].color,
            responses: []
          });

          //update the users teammates 
          for (let k = 1; k < newTeam.length; k++) {
            Users.update({pid: newTeam[k]}, {
              $set: {
                teammates: newTeam.filter(teammate => teammate != newTeam[k])
              }
            });
          }

          teams.push(team_id);
        }


        // start and update activity on database
        Activities.update(_id, {
          $set: {
            teams
          }
        }, (error) => {
          if (!error) {
            console.log('Teams created!');
          } else {
            console.log(error);
          }
        });
      }

      // discussion time!
      if (update.status === 3) {
        console.log('[DISCUSSION TIME]');
        clearTimeout(this.timer1);
        this.timer2 = setTimeout(
          () => endPhase(_id, 4),
          duration * 1000
        );
      }

      // activity just ended
      if (update.status === 5) {

         // get session in context
         const session = Sessions.findOne({activities: _id});

         // get next activity
         const nextActivity = Activities.findOne({session_id: session._id, status: 0}, {sort: {timestamp: 1}});
 
         // no activities left!! end session...
         if (!nextActivity) {
           Sessions.update(session._id, {
             $set: {
               status: 2,
               endTime: new Date().getTime()
             }
           });
         }
         
         // start next activity!
         else {
           Activities.update(nextActivity._id, {
             $set: {
               status: 1,
               startTime: new Date().getTime(),
               statusStartTime: new Date().getTime()
             }
           });
         }
      }

    } 
  });

  // called to end an activity phase
  const endPhase = Meteor.bindEnvironment((activity_id, status) => {
    console.log('Starting status ' + status)
    Activities.update(activity_id, {
      $set: {
        status,
        statusStartTime: new Date().getTime()
      }
    });
  });

});

// function insertLink(title, url) {
//   Links.insert({ title, url, createdAt: new Date() });
// }
  // if (Links.find().count() === 0) {
  //   insertLink(
  //     'Do the Tutorial',
  //     'https://www.meteor.com/tutorials/react/creating-an-app'
  //   );

  //   insertLink(
  //     'Follow the Guide',
  //     'http://guide.meteor.com'
  //   );

  //   insertLink(
  //     'Read the Docs',
  //     'https://docs.meteor.com'
  //   );

  //   insertLink(
  //     'Discussions',
  //     'https://forums.meteor.com'
  //   );
  // }
