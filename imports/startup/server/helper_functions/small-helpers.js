/**
 *  This File contains some helper functions for various server actions.
 */
import ActivityEnums from '../../../enums/activities';

/* Helper functions */

// shuffling function
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

// set up the colors that the teams will use
export function buildColoredShapes(colored_shapes) {
  const shapes = shuffle(['circle', 'plus', 'moon', 'square', 'star', 'heart', 'triangle']);
  const shapeColors = shuffle(['blue', 'purple', 'green', 'yellow', 'red']);

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapeColors.length; j++) {
      colored_shapes.push({ shape: shapes[i], color: shapeColors[j] });
    }
  }

  shuffle(colored_shapes);
}

// set duration based on activity status and session progress
export function calculateDuration(activity) {
  // get activity status
  const { status, index } = activity;

  // get durations
  const { durationIndv, durationOffsetIndv } = activity;
  const { durationTeam, durationOffsetTeam } = activity;

  // individual input phase
  if (status === ActivityEnums.status.BUILDING_TEAMS) return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

  // team input phase
  if (status === ActivityEnums.status.INPUT_TEAM) return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

  return -1;
}