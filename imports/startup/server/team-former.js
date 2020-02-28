/* This File contains all the code necessary to build teams for a round in an activity */
import Sessions from '../../api/sessions'
import { shuffle } from './helper-funcs';

/*
  Produce the teams for the first round. Should be random, with a goal of teams of 3.
  Will return an array of arrays, with each internal array have pids representing a team
 */
function firstRoundTeams(participants, max_team_size) {

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  ungrouped = participants.slice(0);

  // build floor(num_participants / max_team_size) teams
  while (teams.length != Math.floor(participants.length / max_team_size)) {
    
    // teams of max_team_size
    let nextTeam = [];
    while (nextTeam.length != max_team_size) {
      nextTeam[nextTeam.length] = ungrouped.shift();
    }
    teams.push(nextTeam);
  }

  teams.push(ungrouped);

  console.log(teams);
  // return our completed teams
  return teams;

}

// builds teams for subsequent rounds of team formation (where duplicates are avoided)
function buildNewTeams(participants, teamHistory, max_team_size) {
  const first = participants.shift();
  participants.push(first);
 
  return firstRoundTeams(participants, max_team_size)
}

export function formTeams(session_id, prevActIndex, max_team_size) {

  const { participants, teamHistory} = Sessions.findOne(session_id);
  
  // if we're on the first activity, call first teams. Otherwise, build based on teamHistory 
  if (prevActIndex < 0) return firstRoundTeams(participants, max_team_size);
  return buildNewTeams(participants, teamHistory, max_team_size)
}