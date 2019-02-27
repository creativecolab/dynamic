import React from 'react';
import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import Landing from '../../ui/Landing/Landing.jsx';
import ChooseUsername from '../../ui/Username/ChooseUsername.jsx';
import { renderRoutes } from './routes.js'; //importing specific renderRoutes function by its name

Meteor.startup(() => {
  console.log("Hello from client!");
  render(renderRoutes(), document.getElementById('react-target'));
});