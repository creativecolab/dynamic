/* This File contains multiple functions that various apis use to get certain data in csv format */

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

  const { participants, teamHistory } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,all_interactions,people_interacted_with,num_interactions,num_unique_interactions\n';

  participants.forEach((participant) => {
    participant_interactions = teamHistory[participant];
    let i_actions = ',{';
    let uniq_i_actions = '[';
    let total_interactions = 0;
    let unique_interactions = 0;
    for (var person in participant_interactions) {
      if (participant_interactions.hasOwnProperty(person)) {
          if (participant_interactions[person] !== 0) {
            i_actions += person + ': ' + participant_interactions[person] + '; ';
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

  //TODO: get data on avg_assessment_time

  let ret = 'participant,num_teams,num_teams_confirmed,avg_team_formation_time,' + 
            'num_ratings_given,avg_rating_given,num_ratings_received,avg_rating_received\n';

  // get the data for each participant in this sessiom
  participants.forEach((participant) => {

    let user = Users.findOne({pid: participant});

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
    avg_team_formation_time = avg_team_formation_time / num_teams;

    // get rating information on a user
    let user_preferences = user.preferences.filter((preference) => (activities.includes(preference.activity_id)));
    let num_ratings_given = 0;
    let avg_rating_given = 0;
    let num_ratings_received = 0;
    let avg_rating_received = 0;
    let other_ratings_checked = {};
    user_preferences.forEach((user_preference) => {
      user_preference.values.forEach((rating) => {
        num_ratings_given = num_ratings_given + 1;
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
    avg_rating_given = avg_rating_given / num_ratings_given;
    avg_rating_received = avg_rating_received / num_ratings_received;

    // put it all together for this user
    ret += participant + ',' + num_teams + ',' + num_teams_confirmed + ',' + avg_team_formation_time + ',' +
            num_ratings_given + ',' + avg_rating_given + ',' + num_ratings_received + ',' + avg_rating_received + '\n';

  
  });


  return ret;
}
 