import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import { renderRoutes } from './routes'; //importing specific renderRoutes function by its name

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('react-target'));
});
