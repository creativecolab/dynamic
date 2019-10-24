/* This File contains some helper functions for various server actions */
import ActivityEnums from '../../enums/activities';

import Activities from '../../api/activities';
import Users from '../../api/users';
import Questions from '../../api/questions';

import dbquestions from './dbquestions';

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

// make some default questions for TeamDiscussion
export function createDefaultQuestions() {
  if (Questions.find({onwer: 'none'}).count() !== 0) {
    return;
  }

  // for each group of questions
  dbquestions.map(group => {
    // icebreaker questions
    if (group.label === 'icebreaker') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 3 === 0) round += 1;

        Questions.insert({
          onwer: 'none',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          label: 'ICEBREAKER',
          color: group.color,
          round
        });
      });
    } else if (group.label === 'ideation') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 2 === 0) round += 1;


        Questions.insert({
          onwer: 'none',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          label: 'IDEATION',
          color: group.color,
          round: round
        });
      });
    } else if (group.label === 'team') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 3 === 0) round += 1;

        Questions.insert({
          onwer: 'none',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          timesViewed: 0,
          label: 'TEAM QUESTION',
          color: group.color,
          round: round
        });
      });
    }
  });
}

// make some default questions for TeamDiscussion
export function createCustomQuestions(instructor, questions) {
  if (Questions.find({owner: instructor}).count() !== 0) {
    return;
  }

  // for each group of questions
  questions.map(group => {
    // get the correct label
    let round = 0;

    group.prompts.map((q, index) => {
      if (index % group.numPerRound === 0) round += 1;

      Questions.insert({
        owner: instructor,
        prompt: q,
        default: true,
        createdTime: new Date().getTime(),
        viewTimer: 0,
        timesViewed: 0,
        label: group.label,
        color: group.color,
        round
      });
    });
  });
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

// create some basic activities with hard-coded values
export function defaultPreferences(session_id) {

  let activities = [];
  if (!(session.activities)) {
    for (let i = 0; i < 6; i++) {
      const activity_id = Activities.insert({
        name: ActivityEnums.name.TEAM_DISCUSSION,
        session_id,
        index: i,
        teamSize: 3, // TODO: default value?
        hasIndvPhase: false,
        durationIndv: 180,
        durationTeam: 180,
        durationOffsetIndv: 0,
        durationOffsetTeam: 0,
        status: ActivityEnums.status.READY,
        creationTime: new Date().getTime(),
        statusStartTimes: {
          indvPhase: 0,
          teamForm: 0,
          teamPhase: 0,
          peerAssessment: 0
        },
        team_ids: [],
        allTeamsFound: false,
        endTime: 0
      });

      activities.push(activity_id);
    }

    // add activities to the session
    Sessions.update(session_id, {
      $set: {
        activities
      }
    });
  }

}

// make activities based on the needs of the instructor
export function readPreferences(instructor, session_id) {
  // preferences specified by the instructor
  const preferences = JSON.parse(Assets.getText('instructorPreferences/' + instructor + '_preferences.json'));

  // create activities that the instructor prefers
  let activities = new Array(preferences.num_activities)
  for (let i = 0; i < preferences.num_activities; i++) {
    const activity_id = Activities.insert({
      name: ActivityEnums.name.TEAM_DISCUSSION,
      session_id,
      index: i,
      teamSize: preferences.group_size,
      hasIndvPhase: false,
      durationIndv: 180,
      durationTeam: preferences.duration,
      durationOffsetIndv: 0,
      durationOffsetTeam: 0,
      status: ActivityEnums.status.READY,
      creationTime: new Date().getTime(),
      statusStartTimes: {
        indvPhase: 0,
        teamForm: 0,
        teamPhase: 0,
        peerAssessment: 0
      },
      team_ids: [],
      allTeamsFound: false,
      endTime: 0
    });

    activities[i] = activity_id;
  }

  // add the newly created activities to the session
  Sessions.update(session_id, {
    $set: {
      activities
    }
  });

  // determine what kind of questions to make
  if (preferences.questionsType === "custom") {
    createCustomQuestions(instructor, preferences.questions);
  } else {
    createDefaultQuestions();
  }

  // determine whether or not to create users
  if (preferences.hasRoster) {
    createUsers(instructor);
  }
}
