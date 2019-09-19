/* This File contains multiple functions that various apis use to get certain data in csv format */
import Sessions from '../../api/sessions';
import Users from '../../api/users';

import { getAverageRating } from './helper-funcs';
import { strict } from 'assert';

const blacklisted = ['3291', '6734', '5072', '1161', '8035'];

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
    const  participant_interactions = teamHistory[participant];
    const { preferences } = Users.findOne({pid: participant});
    let i_actions = ',{';
    let uniq_i_actions = '[';
    let total_interactions = 0;
    let unique_interactions = 0;
    if (!blacklisted.includes(participant)) {
      for (var person in participant_interactions) {
        if (participant_interactions.hasOwnProperty(person)) {
          if (!blacklisted.includes(person)) {
            if (participant_interactions[person] !== 0) {
              // change num to avg rating between each dude
              let avg_rating = getAverageRating(participant, preferences, person, Users.findOne({pid: person}).preferences, activities);
              i_actions += person + ': ' + avg_rating + '; ';
              uniq_i_actions += person + '; ';
              total_interactions = total_interactions + participant_interactions[person];
              unique_interactions = unique_interactions + 1;

            }
          }
        }
      }
    }
    if (!blacklisted.includes(participant)) {
      i_actions = i_actions.slice(0, -2);
      uniq_i_actions = uniq_i_actions.slice(0, -2);
    } else {
      i_actions += 'blacklisted'
      uniq_i_actions += 'blacklisted';
      total_interactions = 'blacklisted';
      unique_interactions = 'blacklisted';
    }
    i_actions += '},'; 
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

    // check for blacklistees
    if (blacklisted.includes(participant)) {
      num_teams = 'blacklisted';
      num_teams_confirmed = 'blacklisted';
      avg_team_formation_time = 'blacklisted';
      num_ratings_given = 'blacklisted';
      avg_rating_given = 'blacklisted';
      avg_assessement_time = 'blacklisted';
      num_ratings_received = 'blacklisted';
      avg_rating_received = 'blacklisted';
    } 
    
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

  let ret = "Team,Activity,Time\n";
  let total_confirmation_time = 0;
  let num_confirmations = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids, index } = curr_act;

    total_confirmation_time = 0;
    num_confirmations = 0;

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      if (team.confirmed) {
        // update the count and running total of confirmation times
        num_confirmations = num_confirmations + 1;
        total_confirmation_time = total_confirmation_time + (team.teamFormationTime / 1000);
        ret = ret + "Team " + team.color + "_" + team.shape + ",Round " + (index+1) + "," + (team.teamFormationTime / 1000) + "\n";
      }
    });

    ret = ret + "Average,Round " + (index+1) + "," + (total_confirmation_time / num_confirmations).toFixed(3) + "\n";

  });

  // calculate average
  //ret = ret + "Average Team Confirmation Time this session: " + (total_confirmation_time / num_confirmations);
  
 return ret;

}

export function getUserConfirmationTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Confirmation_Time,Round\n";

  participants = {}

  session.participants.forEach(participant => {
    participants[participant] = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    };
  });

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids, index } = curr_act;

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      if (team.confirmed) {
        // update the count and running total of confirmation times
        team.members.forEach((member) => {
          participants[member.pid][String(index+1)] = (team.teamFormationTime / 1000);
        });
      }
    });


  });

  for (var participant in participants) {
    if (participants.hasOwnProperty(participant)) {
        ret = ret + (participants[participant]["1"] > 0 ? participants[participant]["1"] + ",1\n" : "")
        + (participants[participant]["2"] > 0 ? participants[participant]["2"] + ",2\n" : "")
        + (participants[participant]["3"] > 0 ? participants[participant]["3"] + ",3\n" : "")
        + (participants[participant]["4"] > 0 ? participants[participant]["4"] + ",4\n" : "")
        + (participants[participant]["5"] > 0 ? participants[participant]["5"] + ",5\n" : "")
        + (participants[participant]["6"] > 0 ? participants[participant]["6"] + ",6\n" : "")
    }
}

  
 return ret;

}

export function getLastTeams(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Participant,Last Team\n";

  const { participants, activities } = session;

  const lastAct = Activities.findOne({session_id: session._id, index: activities.length-1})
  console.log(lastAct);

  const { team_ids } = lastAct

  const lastTeams = Teams.find({_id: { $in: team_ids}}).fetch()

  lastTeams.forEach(team => { 
    const toAdd = team.members.map((mate) => {
      return mate.pid + ';' + team.members.filter((other_mate) => other_mate != mate).map((other_mate) => other_mate.pid)
    });
    toAdd.forEach((last_team) => {
      ret += last_team.substr(0, last_team.indexOf(';')) + ',' 
              + last_team.substr(last_team.indexOf(';') + 1).replace(/,/g, ';') + '\n';      
    })
  });

  participants.forEach((participant) => {

  });


  return ret
}

export function getUserAssessmentTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "User-Assessment-Times\n";
  let total_assessment_time = 0;
  let total_num_assessments = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids } = curr_act;

    ret = ret + "Activity " + activity_id + "\n";

    // get the average for this round
    let num_assessments = 0
    let round_assessment_time = 0

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
          round_assessment_time = round_assessment_time + (assessment_time / 1000);
          ret = ret + "User " + user.pid +  " took " + (assessment_time / 1000) + " seconds to submit preferences\n";
        }    
      });
    });

    ret = ret + "Average Assessment Time this round is " + (round_assessment_time / num_assessments) + "\n";

    // keep running total going
    total_num_assessments = total_num_assessments + num_assessments;
    total_assessment_time = total_assessment_time + round_assessment_time

  });

  // calculate average
  ret = ret + "Average User Assessment Time this session: " + (total_assessment_time / total_num_assessments);
  
 return ret;

}
 