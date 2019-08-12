/* This File contains some helper functions for various server actions */
import ActivityEnums from '../../enums/activities';

export function shuffle(a) {
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
  if (status === ActivityEnums.status.INPUT_INDV)
    return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

  // team input phase
  if (status === ActivityEnums.status.INPUT_TEAM)
    return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

  return -1;
}

// parse the preferences of a user to get the average rating for a person
export function getAverageRating(participant, participant_preferences, other_participant, other_participant_preferences, activities) {

  // worst javascript in the world to get the ratings that pertain to the person of interest
  let ratings_for_person = participant_preferences.filter((preference) => activities.includes(preference.activity_id))
                                      .map((rating) => rating.values.filter((value) => value.pid === other_participant))
                                      .map((person_rating) => person_rating[0].value);
  let participant_avg = parseFloat((ratings_for_person.reduce((total, value) => total + value, 0) / ratings_for_person.length).toFixed(3));

  // more terrible javascript to get ratings from the person of interest of the participant
  let ratings_for_participant = other_participant_preferences.filter((preference) => activities.includes(preference.activity_id))
                                      .map((rating) => rating.values.filter((value) => value.pid === participant))
                                      .map((person_rating) => person_rating[0].value);
  let other_participant_avg = parseFloat((ratings_for_participant.reduce((total, value) => total + value, 0) / ratings_for_participant.length).toFixed(3));

  return ((participant_avg + other_participant_avg) / 2).toFixed(3); 
}