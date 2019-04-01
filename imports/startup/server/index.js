import { Meteor } from 'meteor/meteor';
import SimpleSchema from 'simpl-schema';

import Links from '../../api/links';
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';

import './register-api'

function insertLink(title, url) {
  Links.insert({ title, url, createdAt: new Date() });
}

//use when local collections get a bit cluttered
function clearCollections() {
  Activities.find({}).forEach(activitiy => {
    Activities.remove(activitiy._id)
  })
  Sessions.find({}).forEach(session => {
    Sessions.remove(session._id)
  })
  Users.find({}).forEach(user => {
    Users.remove(user._id)
  })
}

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

  }
});

function updateRoster() {

  // hard-coded roster for testing
  const roster = [{
    name: 'Gustavo Umbelino',
    firstname: 'Gustavo',
    lastname: 'Umbelino',
    pid: 'gus'
  },
  {
    name: 'Vivian Ta',
    firstname: 'Vivian',
    lastname: 'Ta',
    pid: 'viv'
  },
  {
    name: 'Eric Truong',
    firstname: 'Eric',
    lastname: 'Truong',
    pid: 'eric'
  },
  {
    name: 'Steven Dow',
    firstname: 'Steven',
    lastname: 'Dow',
    pid: 'steven'
  },
  {
    name: 'Samuel Blake',
    firstname: 'Samuel',
    lastname: 'Blake',
    pid: 'sam'
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

Meteor.startup(() => {

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
            startTime: new Date().getTime()
          }
        });
      }

    } 
  });

  // speeds up activity based on teams ready
  Teams.find({}).observeChanges({
    changed(_id, update) {

      // get current activity in context
      const activity_id = Teams.findOne(_id).activity_id;

      // get number of teams that have not confirmed yet
      const num_not_confirmed = Teams.find({activity_id, 'members.confirmed': false}).count();
      console.log(num_not_confirmed + ' teams haven\'t confirmed yet.');

      // everyone confirmed, no need to wait
      if (num_not_confirmed === 0 && Activities.findOne(activity_id).status === 2) {
        Activities.update(activity_id, {
          $set: {
            status: 3
          }
        });
      }
    }
  }); 

  // called to end an activity phase
  const endPhase = Meteor.bindEnvironment((activity_id, status) => {
    console.log('Starting status ' + status)
    Activities.update(activity_id, {
      $set: {
        status,
        startTime: new Date().getTime()
      }
    });
    clearInterval(this.timerID);
  });

  // handles team formation
  const activitiesCursor = Activities.find({});
  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + " updated. [Activity]");
      console.log(update);

      // let input phase last for 10 seconds
      if (update.status === 1) {
        console.log('[ACTIVITY STARTED]')
        this.timerID = setInterval(
          () => endPhase(_id, 2),
          60 * 1000
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
        shuffle(participants);
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

        //--- FORM TEAMS ---//

        let teams = [];
        let team_id = "";

        // form teams, teams of 3
        let newTeam =[participants[0]];
        for (let i = 1; i < participants.length; i++) {

          // completed a new team
          // TODO: get MAX_TEAM_SIZE from instructor!
          if (i % MAX_TEAM_SIZE == 0) {
            team_id = Teams.insert({
              activity_id: _id,
              timestamp: new Date().getTime(),
              members: newTeam.map(pid => ({pid, confirmed: false})),
              color: colors[teams.length],
              responses: []
            });

            teams.push(team_id);

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
        }

        // last team is of MAX_TEAM_SIZE or less
        else if (newTeam.length <= MAX_TEAM_SIZE) {
          team_id = Teams.insert({
            activity_id: _id,
            timestamp: new Date().getTime(),
            members: newTeam.map(pid => ({pid, confirmed: false})),
            color: colors[teams.length],
            responses: []
          });

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
        console.log('[DISCUSSION TIME]')
        this.timerID = setInterval(
          () => endPhase(_id, 4),
          60 * 1000
        );
      }

      // activity just ended
      if (update.status === 4) {

         // get session in context
         const session = Sessions.findOne({activities: _id});

         // get next activity
         const nextActivity = Activities.findOne({session_id: session._id, status: 0}, {sort: {timestamp: 1}});
 
         // no activities left!! end session...
         if (!nextActivity) {
           Sessions.update(session._id, {
             $set: {
               status: 2
             }
           });
         }
         
         // start next activity!
         else {
           Activities.update(nextActivity._id, {
             $set: {
               status: 1
             }
           });
         }
      }

    } 
  });


  if (Links.find().count() === 0) {
    insertLink(
      'Do the Tutorial',
      'https://www.meteor.com/tutorials/react/creating-an-app'
    );

    insertLink(
      'Follow the Guide',
      'http://guide.meteor.com'
    );

    insertLink(
      'Read the Docs',
      'https://docs.meteor.com'
    );

    insertLink(
      'Discussions',
      'https://forums.meteor.com'
    );
  }
});
