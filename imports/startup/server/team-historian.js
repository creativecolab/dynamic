/* File that contains some functions to help keep the teamHistory matrix for a session up-to-date */

import Sessions from '../../api/sessions';

export function updateTeamHistory_LateJoinees(session_id) {

  // get a snapshot of the participants and the teamHistory matrix for this session
  const { participants, teamHistory } = Sessions.findOne(session_id);

  // find the late joinees so far
  late_joinees = participants.filter(participant => !(participant in teamHistory));

  // build a new row for each late joinee
  late_joinees.forEach(late_joinee => {
    teamHistory[late_joinee] = {}
    participants.forEach(participant => {
      if (participant !== late_joinee) {
        teamHistory[late_joinee][participant] = 0;
      } 
    });
  });

  // build a new column for each late joinee
  participants.filter(participant => !(participant in late_joinees)).forEach(participant => {
    late_joinees.forEach(late_joinee => {
      if (participant != late_joinee) teamHistory[participant][late_joinee] = 0;
    });
  });

  // save the updated teamHistory matrix
  Sessions.update(session_id, {
    $set: {
      teamHistory
    }
  });
  console.log(teamHistory);
}

export function updateTeamHistory_TeamFormation(session_id, teams) {
  // get a snapshot of the teamHistory matrix of this session
  const { teamHistory } = Sessions.findOne(session_id);

  // check for new connections being made
  teams.forEach(team => {
    team.forEach(member => {
      team.forEach(other_member => {
        if (member != other_member) teamHistory[member][other_member] = teamHistory[member][other_member] + 1;
      });
    });
  });

  // update the teamHistory matrix of this session
  Sessions.update(session_id, {
    $set: {
      teamHistory
    }
  });
}