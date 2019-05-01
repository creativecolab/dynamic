import { Meteor } from 'meteor/meteor';
import { Restivus } from 'meteor/nimble:restivus';

import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';

import './register-api';

function getPreference() {

  let ret = 'name,pid,pref_0,name_0,not_pref_0,pref_1,name_1,not_pref_1,pref_2,name_2,not_pref_2\n';

  const session = Sessions.findOne({code: "dsgn100"});
  const { participants, activities } = session;
  for (var i = 0; i < participants.length; i++) {

    // find current user
    const user = Users.findOne({pid: participants[i]});
    ret += `"${user.name}","${user.pid.toUpperCase()}",`;

    // iterate through activities
    for (var a = 0; a < activities.length; a++) {

      // append activity_id
      // ret += activities[a] + ",";

      // find team
      const team = Teams.findOne({activity_id: activities[a], "members.pid": user.pid});

      if (!team) {
        // ret += "no_team\n";
        continue;
      }

      // append team pids
      // ret += `"${team.members.map(m => m.pid.toUpperCase())}",`;

      let pref = "";
      for (var j = 0; j < user.preference.length; j++) {
        if (user.preference[j].activity_id === activities[a]) {
          pref = user.preference[j].pid
          break;
        }
      }

      ret += pref.toUpperCase() + ",";
      if (pref !== "" && pref !== "all")
        ret += `"${Users.findOne({pid: pref}).name}",`;
      else
        ret += ",";

      // not_pref
      if (team) {
        if (pref === 'all') ret += ",";
        else ret += `"${team.members.filter(m => m.pid !== pref && m.pid !== user.pid).map(m => m.pid.toUpperCase())}",`;
        // ret += `"${team.members.filter(m => m.pid !== pref && m.pid !== user.pid).map(m => Users.findOne({pid: m.pid}).name).toString()}"`;
      }
    }

    ret += '\n';

  }

  return ret;

}

if (Meteor.isServer) {

  // Global API configuration
  var Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  Api.addRoute('csv', {
    get() {
      return { 
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': "attachment; filename=preferences.csv"
        },
        body: getPreference()
       };
    }
  });

}

// hard-coded roster for testing
function updateRoster() {

  const roster = [{
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

  // update roster on startup
  // updateRoster();
  getPreference();

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
        // console.log("Participants: " + participants);

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

        const shapes = shuffle(['circle', 'cross', 'moon', 'square', 'star', 'sun', 'heart', 'car', 'triangle']);
        const shapeColors = shuffle(['blue', 'green', 'orange', 'red']);
        const colored_shapes = []
        for (let i = 0; i < shapes.length; i++) {
          for (let j = 0; j < shapeColors.length; j++) {
            colored_shapes.push({shape: shapes[i], color: shapeColors[j]});
          }
        }
        // shuffle(colored_shapes);

        //--- SEPARATE EVERYONE BY SECTION ---//
        var session_sections = {}

        for (let j = 0; j < participants.length; j++) {
          var participant_section = Users.findOne({pid: participants[j]}).section;
          if (!(session_sections.hasOwnProperty(participant_section.toLowerCase()))) {
            //first time seeing this section
            session_sections[participant_section.toLowerCase()] = [];
          }
          session_sections[participant_section.toLowerCase()].push(participants[j]);
        }
        // console.log(session_sections);

        // --- Order Object based on the size of sections (smaller sections last) --- //
        var sortable = [];
        for (var section in session_sections) {
            sortable.push([section, session_sections[section]]);
        }
        // console.log("Unsorted: " + sortable);
        
        sortable.sort(function(section1, section2) {
            return section1[1].length < section2[1].length;
        });
        // console.log("Sorted: " + sortable);

        //--- FORM TEAMS ---//
        let teams = [];
        let oldTeam = [];
        let olderTeam = [];
        let team_id = "";
        let older_team_id = "";
        for (var section in session_sections) {
          // make teams based on sections
          if (session_sections.hasOwnProperty(section)) {
            // console.log(section + " -> " + session_sections[section]);
            // used to keep track of current and older teams for database
            var section_members = session_sections[section];
            shuffle(section_members); // TODO -- maybe shuffle after grouping into sections

            //shuffle(section_members); // TODO -- maybe shuffle after grouping into sections
            //console.log("Participants: " + section_members);

            // form teams, teams of 3
            let newTeam =[section_members[0]];
            for (let i = 1; i < section_members.length; i++) {

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

                // keep track of older teams just in case
                olderTeam = oldTeam
                oldTeam = newTeam;

                // save this added team
                teams.push(team_id);

                //onto next member
                newTeam = [section_members[i]];

              }
              
              // add new member to team
              else {
                newTeam.push(section_members[i]);
              }
            }

            // only 1 participant left, create team of MAX_TEAM_SIZE + 1
            if (newTeam.length === 1 && teams.length > 0 && oldTeam.length < 4) {

              Teams.update(team_id, {
                $push: {
                  members: {pid: newTeam[0], confirmed: false}
                }
              });

              //update the users teammates 
              oldTeam.push(newTeam[0]);
              Users.update({pid: newTeam[0]}, {
                $push: {
                  teammates: oldTeam.filter(teammate => teammate != newTeam[0])
                }
              });

            }

            // only 2 participants left, create 2 teams of MAX_TEAM_SIZE + 1
            else if (newTeam.length === 2 && teams.length > 1 && oldTeam.length < 4 && olderTeam.length < 4) {

              // add the first user
              Teams.update(team_id, {
                $push: {
                  members: {pid: newTeam[0], confirmed: false}
                }
              });
              //update the users teammates 
              oldTeam.push(newTeam[0]);
              Users.update({pid: newTeam[0]}, {
                $push: {
                  teammates: oldTeam.filter(teammate => teammate != newTeam[0])
                }
              });

              // add the second user
              Teams.update(older_team_id, {
                $push: {
                  members: {pid: newTeam[1], confirmed: false}
                }
              });
              //update the users teammates 
              olderTeam.push(newTeam[1]);
              Users.update({pid: newTeam[1]}, {
                $push: {
                  teammates: olderTeam.filter(teammate => teammate != newTeam[1])
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

              // TODO make sure old team is tracked
              // keep track of older teams just in case
              olderTeam = oldTeam
              oldTeam = newTeam;

              //update the users teammates 
              for (let k = 1; k < newTeam.length; k++) {
                Users.update({pid: newTeam[k]}, {
                  $push: {
                    teammates: newTeam.filter(teammate => teammate != newTeam[k])
                  }
                });
              }

              teams.push(team_id);
            }
          }

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

  // debug flag, useful for styling
  const debug = false;

  // called to end an activity phase
  const endPhase = Meteor.bindEnvironment((activity_id, status) => {
    console.log('Starting status ' + status);
    if (debug) return;
    Activities.update(activity_id, {
      $set: {
        statusStartTime: new Date().getTime()
      }
    }, () => {
      Activities.update(activity_id, {
        $set: {
          status,
        }
      });
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
