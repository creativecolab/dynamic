import { Meteor } from 'meteor/meteor';
import { render } from 'react-dom';
import renderRoutes from './routes'; //importing specific renderRoutes function by its name
import { Activities } from '../../api/activities';
import { Users } from '../../api/users';
import { Sessions } from '../../api/sessions';

Meteor.startup(() => {
  render(renderRoutes(), document.getElementById('react-target'));
});
