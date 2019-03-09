import { Meteor } from 'meteor/meteor';
import Links from '../../api/links';
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';


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

Meteor.startup(() => {
  clearCollections();
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
