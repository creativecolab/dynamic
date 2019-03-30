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
    pid: 'gus'
  },
  {
    name: 'Vivian Ta',
    pid: 'viv'
  },
  {
    name: 'Samuel Blake',
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
      name: user.name,
      pid: user.pid,
      teammates: []
    }, () => {
      console.log(user.name + ' inserted to mongo!')
    })
  });

}

Meteor.startup(() => {

  // update roster on startup
  updateRoster();

  //clearCollections();
  // If the Links collection is empty, add some data.

  // const bound = Meteor.bindEnvironment((setTimeout) => {set});

  const sessionCursor = Sessions.find({});
  const handle = sessionCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + " updated.");
      console.log(update);

      // start session!
      if (update.status === 1) {

        // start first activity
        const session = Sessions.findOne(_id);
        Activities.update(session.activities[0], {
          $set: {
            status: 1
          }
        });
      }

    } 
  });

  const activitiesCursor = Activities.find({});
  activitiesCursor.observeChanges({
    changed(_id, update) {
      console.log(_id + " updated. [Activity]");
      console.log(update);

      // start activity!
      if (update.status === 1) {

        // do team formation...
        console.log('Form teams!');
      }

    } 
  });

  // After five seconds, stop keeping the count.
  


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
