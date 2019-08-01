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
  Goal: Obtain the interactions of each participant in a session.
  Does so from the information saved by the "teamHistory" matrix in the queried session.
*/
export function getInteractions(session_code) {

  const session = Sessions.findOne({ code: session_code });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, teamHistory } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,interacted_with\n';

  participants.forEach((participant) => {
    participant_interactions = teamHistory[participant];
    ret += participant + ',{';
    for (var person in participant_interactions) {
      if (participant_interactions.hasOwnProperty(person)) {
          ret += person + ': ' + participant_interactions[person] + '; ';
      }
    }
    ret = ret.slice(0, -2);
    ret += '}\n';
  });

  return ret;

}

// TODO:
export function getPeerAssessments(session_code) {
  return '';
}
 