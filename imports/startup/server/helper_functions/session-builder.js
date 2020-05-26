/**
 * This file contains helper functions relating to creating a session.
 */
import Activities from '../../../api/activities';
import Users from '../../../api/users';

import ActivityEnums from '../../../enums/activities';

import { createCustomQuestions, createDefaultQuestions } from './question-maker';

/* User creation */

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

/* Preference handling */

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
          buildTeams: 0,
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
        buildTeams: 0,
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
