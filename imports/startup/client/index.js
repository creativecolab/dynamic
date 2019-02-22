import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Landing from '../../ui/Landing/Landing'

Meteor.startup(() => {
  render(<Landing />, document.getElementById('react-target'));
});
