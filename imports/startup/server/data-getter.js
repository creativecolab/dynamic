/* This File contains multiple functions that various apis use to get certain data in csv format */
import { getAverageRating } from './helper-funcs';

export function getPreference() {
  const session = Sessions.findOne({ code: 'quiz2' });

  // TODO: currently assumes there is only one session, need to make more general in the future

  if (!session) {
    return 'No session named quiz2 yet!';
  }

  const { participants } = session;

  if (!participants) {
    return 'No particpants for this session yet';
  }

  // csv format
  let ret = 'pid,pref_0,rating_0,pref_1,rating_1,pref_2,rating_2\n';

  // get the data on the preferences of each participant
  participants.map(user_pid => {
    ret += `"${user_pid.toUpperCase()}",`;
    const user = Users.findOne({ pid: user_pid });

    if (user) {
      user.preference.map(activity_pref => {
        activity_pref.values.map((pref, index) => {
          ret += pref.pid + ',' + pref.value;

          // add a comma when not on preference 3
          if (index != 2) ret += ',';
        });

        // handles ratings from only 2 people
        if (activity_pref.values.length < 3) ret += ',\n';
        else ret += '\n';
      });

      // when user exists but has no preference data (happens sometimes)
      if (user.preference.length == 0) ret += ',,,,,\n';
    } else {
      // no preference info on this user for some reason
      ret += ',,,,,\n';
    }
    // ret += '\n';
  });

  return ret;
}


/* 
  Goal: Obtain details of the interactions of each participant in a session.
  Does so from the information saved by the "teamHistory" matrix in the queried session.
*/
export function getInteractions(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, teamHistory, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,all_interactions,people_interacted_with,num_interactions,num_unique_interactions\n';

  participants.forEach((participant) => {
    participant_interactions = teamHistory[participant];
    participant_ratings = Users.findOne({pid: participant}).preferences
    let i_actions = ',{';
    let uniq_i_actions = '[';
    let total_interactions = 0;
    let unique_interactions = 0;
    for (var person in participant_interactions) {
      if (participant_interactions.hasOwnProperty(person)) {
          if (participant_interactions[person] !== 0) {
            // change num to avg rating between each dude
            let avg_rating = getAverageRating(participant, participant_ratings, person, Users.findOne({pid: person}).preferences, activities);
            i_actions += person + ': ' + avg_rating + '; ';
            uniq_i_actions += person + '; ';
            total_interactions = total_interactions + participant_interactions[person];
            unique_interactions = unique_interactions + 1;

          }
      }
    }
    i_actions = i_actions.slice(0, -2);
    i_actions += '},';
    uniq_i_actions = uniq_i_actions.slice(0, -2);
    uniq_i_actions += '],';
    ret += participant + i_actions + uniq_i_actions + total_interactions + ',' + unique_interactions + '\n';
  });

  return ret;

}

/* 
  Goal: Obtain information on each participants teams and ratings of their teams.
  Does so through looking through a User's team history, preference, and session history. 
*/
export function getUserHistory(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,join_time,elapsed_joined_time,num_teams,num_teams_confirmed,avg_team_formation_time,' + 
            'num_ratings_given,avg_rating_given,avg_assessement_time,num_ratings_received,avg_rating_received\n';


  // used to get elapsed time
  const first_person = Users.findOne({pid: participants[0]});
  let first_joined_time = first_person.sessionHistory.filter((sesh) => sesh.session_id === session._id)[0].sessionJoinTime;

  // get the data for each participant in this sessiom
  participants.forEach((participant) => {

    let user = Users.findOne({pid: participant});

    // get the user's join time
    let join_time = user.sessionHistory.filter((past_session) => past_session.session_id === session._id)[0].sessionJoinTime;
    let elapsed_join_time = ((join_time - first_joined_time) / 1000).toFixed(3);

    // get information on user's team contributions
    let user_teams = user.teamHistory.filter((team) => (activities.includes(team.activity_id)));
    let num_teams = user_teams.length;
    let num_teams_confirmed = 0;
    let avg_team_formation_time = 0;
    user_teams.forEach((user_team) => {
      const actual_team = Teams.findOne(user_team.team);
      if (actual_team.confirmed) {
        avg_team_formation_time = avg_team_formation_time + actual_team.teamFormationTime;
        num_teams_confirmed = num_teams_confirmed + 1;
      }
    });
    avg_team_formation_time = ((avg_team_formation_time / num_teams) / 1000).toFixed(3);

    // get rating information on a user
    let user_preferences = user.preferences.filter((preference) => (activities.includes(preference.activity_id)));
    let num_ratings_given = 0;
    let avg_rating_given = 0;
    let total_assessment_time = 0;
    let avg_assessement_time = 0;
    let num_ratings_received = 0;
    let avg_rating_received = 0;
    let other_ratings_checked = {};
    user_preferences.forEach((user_preference) => {
      // get the time it took for this assessment and how many ratings were made, and the ratings themselves
      let curr_act = Activities.findOne(user_preference.activity_id);
      total_assessment_time = total_assessment_time + ((user_preference.timestamp - curr_act.statusStartTimes.peerAssessment) / 1000);
      num_ratings_given = num_ratings_given + user_preference.values.length;
      user_preference.values.forEach((rating) => {
        avg_rating_given = avg_rating_given + rating.value;
        // now get the ratings attributed to them
        if (!(other_ratings_checked[rating.pid])) {
          other_ratings_checked[rating.pid] = true;
          let other_user = Users.findOne({pid: rating.pid});
          let other_user_prefs = other_user.preferences.filter((preference) => (activities.includes(preference.activity_id)));
          // check the other user's ratings
          other_user_prefs.forEach((other_user_pref) => {
            other_user_pref.values.forEach((other_rating) => {
              if (other_rating.pid === participant) {
                num_ratings_received = num_ratings_received + 1;
                avg_rating_received = avg_rating_received + other_rating.value; 
              }
            });
          });
        }
      });
    });
    // calculate the averages 
    avg_rating_given = (avg_rating_given / num_ratings_given).toFixed(3);
    avg_assessement_time = (total_assessment_time / user_preferences.length).toFixed(3);
    avg_rating_received = (avg_rating_received / num_ratings_received).toFixed(3);

    
    // put it all together for this user
    ret += participant + ',' + join_time + ',' + elapsed_join_time + ',' + 
            num_teams + ',' + num_teams_confirmed + ',' + avg_team_formation_time + ',' +
            num_ratings_given + ',' + avg_rating_given + ',' + avg_assessement_time + ',' +
            num_ratings_received + ',' + avg_rating_received + '\n';
  });

  return ret;
}

export function getUserJoinTimes(session_code) {
  const curr_session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!curr_session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants } = curr_session;

  let ret = "Users-Joined-Time\n";

  participants.forEach((participant) => {
    let user = Users.findOne({pid: participant})
    user.sessionHistory.forEach((session) => {
      if (session.session_id === curr_session._id) {
        ret = ret + "User " + participant + " Joined the Session: timestamp " + session.sessionJoinTime + ", " 
        + new Date().toISOString(session.sessionJoinTime) + "\n";
      }
    });
  });
  return ret;

}

export function getTeamConfirmationTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Team-Confirmation-Times\n";
  let total_confirmation_time = 0;
  let num_confirmations = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids } = curr_act;

    ret = ret + "Activity " + activity_id + "\n";

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      if (team.confirmed) {
        // update the count and running total of confirmation times
        num_confirmations = num_confirmations + 1;
        total_confirmation_time = total_confirmation_time + (team.teamFormationTime / 1000);
        ret = ret + "Team " + team.color + " " + team.shape + " took " + (team.teamFormationTime / 1000)
              + " seconds to confirm\n";
      }
    });
  });

  // calculate average
  ret = ret + "Average Team Confirmation Time this session: " + (total_confirmation_time / num_confirmations);
  
 return ret;

}

export function getUserAssessmentTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "User-Assessment-Times\n";
  let total_assessment_time = 0;
  let num_assessments = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids } = curr_act;

    ret = ret + "Activity " + activity_id + "\n";

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      team.members.forEach((member) => {
        let user = Users.findOne({"pid": member.pid, 'sessionHistory.session_id': session._id });
        let assessment = user.preferences.filter((pref) => pref.activity_id === activity_id);
        // should be 1 assessment
        if (assessment.length === 1) {
          // time is the elapsed time, update count and running total
          let assessment_time = assessment[0].timestamp - curr_act.statusStartTimes.peerAssessment;
          num_assessments = num_assessments + 1;
          total_assessment_time = total_assessment_time + (assessment_time / 1000);
          ret = ret + "User " + user.pid +  " took " + (assessment_time / 1000) + " seconds to submit preferences\n";
        }    
      });
    });
  });

  // calculate average
  ret = ret + "Average User Assessment Time this session: " + (total_assessment_time / num_assessments);
  
 return ret;

}
 