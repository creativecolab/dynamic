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
  'team.updateConfirmed'({ team_id, username }) {
    // new SimpleSchema({
    //   team_id: { type: String },
    //   username: { type: String }
    // }).validate({ team_id, username });

    console.log(Teams.findOne(team_id));
    Teams.rawCollection().update(team_id,
      { $set: { "members.$[elem].confirmed": true } },
      {
        arrayFilters: [ { "elem.username": username } ]
      }
    );
    console.log(Teams.findOne(team_id));

  }
});

Meteor.startup(() => {
  //clearCollections();
  // If the Links collection is empty, add some data.

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
