import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';

import { buildNewTeams, firstRoundTeams } from './grouping-helper.js';

// Some constants
MAX_TEAM_SIZE = 3;

// helper function to shuffle array
// reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// set up the colors that the teams will use
function buildColoredShapes(colored_shapes) {
  const shapes = shuffle(['circle', 'plus', 'moon', 'square', 'star', 'heart', 'triangle']);
  const shapeColors = shuffle(['blue', 'purple', 'green', 'yellow', 'red']);

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapeColors.length; j++) {
      colored_shapes.push({ shape: shapes[i], color: shapeColors[j] });
    }
  }

  shuffle(colored_shapes);
}

export function formTeams(participants, prevActIndex, teamHistory) {
  
  return firstRoundTeams(participants);

  /* In progress */
  // if we're on the first activity, call first teams. Otherwise, build based on teamHistory 
  if (prevActIndex < 0) return firstRoundTeams(participants);
  return buildNewTeams(participants, teamHistory)
}