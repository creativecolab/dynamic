/* This File contains some helper functions for various server actions */
import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Users from '../../api/users';
import Questions from '../../api/questions';

// shuffling function
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
  if (status === ActivityEnums.status.INPUT_INDV) return index === 0 ? durationIndv : durationIndv - durationOffsetIndv;

  // team input phase
  if (status === ActivityEnums.status.INPUT_TEAM) return index === 0 ? durationTeam : durationTeam - durationOffsetTeam;

  return -1;
}

// parse the preferences of a user to get the average rating for a person
export function getAverageRating(
  participant,
  participant_preferences,
  other_participant,
  other_participant_preferences,
  activities
) {
  // worst javascript in the world to get the ratings that pertain to the person of interest
  const ratings_for_person = participant_preferences
    .filter(preference => activities.includes(preference.activity_id))
    .map(rating => rating.values.filter(value => value.pid === other_participant))
    .filter(person_rating => person_rating.length > 0)
    .map(person_rating => person_rating[0].value);
  let participant_avg = parseFloat(
    (ratings_for_person.reduce((total, value) => total + value, 0) / ratings_for_person.length).toFixed(3)
  );

  if (isNaN(participant_avg)) {
    console.log('no rating given for ' + other_participant + ' by ' + participant);
    participant_avg = 0;
  }

  // more terrible javascript to get ratings from the person of interest of the participant
  const ratings_for_participant = other_participant_preferences
    .filter(preference => activities.includes(preference.activity_id))
    .map(rating => rating.values.filter(value => value.pid === participant))
    .filter(person_rating => person_rating.length > 0)
    .map(person_rating => person_rating[0].value);
  let other_participant_avg = parseFloat(
    (ratings_for_participant.reduce((total, value) => total + value, 0) / ratings_for_participant.length).toFixed(3)
  );

  if (isNaN(other_participant_avg)) {
    console.log('no rating given for ' + participant + ' by ' + other_participant);
    other_participant_avg = 0;
  }

  return ((participant_avg + other_participant_avg) / 2).toFixed(3);
}

// make some users based on a roster
export function createUsers(instructor) {
  const students = JSON.parse(Assets.getText('rosters/' + instructor + '_students.json'));

  students.forEach(student => {
    //insert each user into the databse
    if (Users.findOne({ pid: student.pid.toString() }) === undefined) {
      Users.insert({
        name: student.name,
        pid: student.pid.toString(),
        joinTime: new Date().getTime(),
        teamHistory: [],
        sessionHistory: [],
        preferences: []
      });
    }
  });
}

/* builds a complex object that can be used to determine who should be emailed. Async to make sure everything exists when called upon. */
export async function produceEmailMastersheet(session_id, doneParticipants) {

  // build up the pid map
  let pidMap = {};
  for (let i = 0; i < doneParticipants.length; i++) {
    let currPid = doneParticipants[i];

    // get this user from the db
    let user = await Users.findOne(
      {
        pid: currPid,
        sessionHistory: {
          $elemMatch: {
            session_id: session_id
          }
        }
      });

    // get the user's email and their preferences
    let currUserObj = {
      'name': user.name,
    }
    for (let j = 0; j < user.sessionHistory.length; j++) {
      if (user.sessionHistory[j].session_id === session_id) {
        currUserObj['email'] = user.sessionHistory[j].emailAddress;
        currUserObj['interestedIn'] = user.sessionHistory[j].sendEmailsTo;
        currUserObj['prospectives'] = [];
        break;
      }
    }

    // save this user's information in the master map
    pidMap[currPid] = currUserObj;
    
  }
  // console.log(pidMap);

  // iterate over the pid keys and add a prospectives field for the corresponding pids
  for (var pid of Object.keys(pidMap)) {
    for (let i = 0; i < pidMap[pid].interestedIn.length; i++) {
      let recipientPID = pidMap[pid].interestedIn[i];
      let prospectiveObj = { 'name': pidMap[pid].name, 'email': pidMap[pid].email };

      // add these details to the recipient's prospective connection array, they saved their email
      if (recipientPID in pidMap)
        pidMap[recipientPID].prospectives.push(prospectiveObj);

    }
  }
  // console.log(pidMap);

  // send this email map back
  return pidMap;

}
