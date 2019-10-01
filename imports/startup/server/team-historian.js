/* File that contains some functions to help keep the teamHistory matrix for a session up-to-date */

import Sessions from '../../api/sessions';

export function updateTeamHistory_LateJoinees(session_id) {

  // get a snapshot of the participants and the teamHistory matrix for this session
  const { participants, teamHistory } = Sessions.findOne(session_id);

  // build a new row for each late joinee
  // find the late joinees so far. add them to the matrix
  // dude wtf for loops are faster than forEach/filter/reduce/map 
  // late_joinees = participants.filter(participant => !(participant in teamHistory));
  late_joinees = []
  for (let i = 0; i < participants.length; i++) {
    if (!(participants[i] in teamHistory)) {
      late_joinees[late_joinees.length] = participants[i]; //faster than push
      teamHistory[participants[i]] = {};
    }
  }

  // build a new row and a new column for each late joinee
  for (let i = 0; i < late_joinees.length; i++) {
    for (let j = 0; j < participants.length; j++) {
      // new column for the late_joinee
      teamHistory[participants[j]][late_joinees[i]] = 0;
      if (participants[j] != late_joinees[i]) {
        // new row for the late_joinee
        teamHistory[late_joinees[i]][participants[j]] = 0;
      }
    }
  }

  // save the updated teamHistory matrix
  Sessions.update(session_id, {
    $set: {
      teamHistory
    }
  });
  console.log("teamHistory matrix updated with Late Joinees.");
}

export function updateTeamHistory_TeamFormation(session_id, teams) {
  // get a snapshot of the teamHistory matrix of this session
  const { teamHistory } = Sessions.findOne(session_id);

   // teams.forEach(team => {
  //   team.forEach(member => {
  //     team.forEach(other_member => {
  //       if (member != other_member) teamHistory[member][other_member] = teamHistory[member][other_member] + 1;
  //     });
  //   });
  // });

  // update the matrix based on the new teams
  for (let i = 0; i < teams.length; i++) {
    for (let j = 0; j < teams[i].length; j++) {
      for (let k = 0; k < teams[i].length; k++) {
        if (teams[i][j] != teams[i][k]) {
          teamHistory[teams[i][j]][teams[i][k]] = teamHistory[teams[i][j]][teams[i][k]] + 1;
        }
      }
    }
  }

  // update the teamHistory matrix of this session
  Sessions.update(session_id, {
    $set: {
      teamHistory
    }
  });
  console.log("teamHistory matrix updated with Teams that were formed.");

}