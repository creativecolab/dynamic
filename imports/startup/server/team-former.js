/* This File contains all the code necessary to build teams for a round in an activity */
import Sessions from '../../api/sessions'
import { shuffle } from './helper-funcs';

/*
  Produce the teams for the first round. Should be random, with a goal of teams of 3.
  Will return an array of arrays, with each internal array have pids representing a team
 */
function firstRoundTeams(participants, max_team_size) {

  // edge case, <= max_team_size+1 people, just return them in an array of arrays
  if (participants.length <= max_team_size + 1) {
    return [participants];
  }

  // edge case when max_team_size is 3, uneven teams
  if (max_team_size === 3 && participants.length === 5) {
    return [participants.slice(0,3), participants.slice(3)];
  }

  // TODO: check if this is good enough
  // edge case when max_team_size is 5, uneven teams
  if (max_team_size === 5 && participants.length === 7) {
    return [participants.slice(0,3), participants.slice(3)];
  }

  // edge case, not enough teams to make full size teams
  if (participants.length % max_team_size > Math.floor(participants.length / max_team_size) ) {
    max_team_size = max_team_size - 1;
  }

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  ungrouped = participants.slice(0);

  // build floor(num_participants / max_team_size) teams
  while (teams.length != Math.floor(participants.length / max_team_size)) {
    
    // teams of max_team_size
    let nextTeam = [];
    while (nextTeam.length != max_team_size) {
      nextTeam[nextTeam.length] = ungrouped.pop();
    }
    teams.push(nextTeam);
  }

  // handles uneven groups
  let addIndex = 0;
  while (ungrouped.length > 0) {
    teams[addIndex][teams[addIndex].length] = ungrouped.pop();
    addIndex++;
  } 

  console.log(teams);
  // return our completed teams
  return teams;

}

// builds teams for subsequent rounds of team formation (where duplicates are avoided)
function buildNewTeams(participants, teamHistory, max_team_size) {
  const first = participants.shift();
  participants.push(first);

  // edge case, <= max_team_size+1 people, just return them in an array of arrays
  if (participants.length <= max_team_size + 1) {
    return [participants];
  }

  // edge case when max_team_size is 3, uneven teams
  if (max_team_size === 3 && participants.length === 5) {
    return [participants.slice(0,3), participants.slice(3)];
  }

  // TODO: check if this is good enough
  // edge case when max_team_size is 5, uneven teams
  if (max_team_size === 5 && participants.length === 7) {
    return [participants.slice(0,3), participants.slice(3)];
  }

  // edge case, not enough teams to make full size teams
  if (participants.length % max_team_size > Math.floor(participants.length / max_team_size) ) {
    max_team_size = max_team_size - 1;
  }

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  ungrouped = participants.slice(0);

  // build floor(num_participants / max_team_size) teams
  while (teams.length != Math.floor(participants.length / max_team_size)) {
    
    // teams of max_team_size
    let nextTeam = [];
    while (nextTeam.length != max_team_size) {
      nextTeam[nextTeam.length] = ungrouped.pop();
    }
    teams.push(nextTeam);
  }

  // handles uneven groups
  let addIndex = 0;
  while (ungrouped.length > 0) {
    teams[addIndex][teams[addIndex].length] = ungrouped.pop();
    addIndex++;
  } 

  console.log(teams);
  // return our completed teams
  return teams;
}

export function formTeams(session_id, prevActIndex, max_team_size) {

  const { participants, teamHistory} = Sessions.findOne(session_id);
  
  // if we're on the first activity, call first teams. Otherwise, build based on teamHistory 
  if (prevActIndex < 0) return firstRoundTeams(participants, max_team_size);
  return buildNewTeams(participants, teamHistory, max_team_size)
}