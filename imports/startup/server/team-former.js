/* This File contains all the code necessary to build teams for a round in an activity */
import Sessions from '../../api/sessions'
import { shuffle } from './helper-funcs';

// Some constants
const MAX_TEAM_SIZE = 3;

/*
  Produce the teams for the first round. Should be random, with a goal of teams of 3.
  Will return an array of arrays, with each internal array have pids representing a team
 */
function firstRoundTeams(participants) {

  // shake them up
  shuffle(participants);

  // edge case, <= MAX_TEAM_SIZE+1 people, just return them in an array of arrays
  if (participants.length <= MAX_TEAM_SIZE + 1) {
    return [participants];
  }

  // edge case, 5 people is a weirdly balanced team
  if (participants.length == 5) {
    return [participants.slice(0,3), participants.slice(3)];
  }

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  ungrouped = participants.slice(0);

  // build floor(num_participants / MAX_TEAM_SIZE) teams
  while (teams.length != Math.floor(participants.length / MAX_TEAM_SIZE)) {
    
    // teams of 3
    let nextTeam = [];
    while (nextTeam.length != MAX_TEAM_SIZE) {
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
function buildNewTeams(participants, teamHistory) {

  // edge case, when num_participants < 6, can't guarantee uniqueness so just make random
  if (participants.length < 6) return firstRoundTeams(participants);

  // shake 'em up
  shuffle(participants);

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  var ungrouped = participants.slice(0);

  // build floor(num_participants / MAX_TEAM_SIZE) teams
  while (teams.length != Math.floor(participants.length / MAX_TEAM_SIZE)) {
    // teams of 3
    let nextTeam = [ungrouped.pop()];
    while (nextTeam.length != MAX_TEAM_SIZE) {
      // we want people that this team has least recently worked with
      let best_wup = {
        "person": "",
        "weight": Number.MAX_SAFE_INTEGER
      };
      // check ungrouped people
      for (let i = 0; i < ungrouped.length; i++) {
        // find weight of this ungrouped person in the adj lists of each of the members of the team
        let wup = {
          "person": ungrouped[i],
          "weight": teamHistory[nextTeam[0]][ungrouped[i]]
        };
        for (let j = 1; j < nextTeam.length; j++) {
          wup["weight"] = wup["weight"] + teamHistory[nextTeam[j]][ungrouped[i]]
        }
        // check if this is the best option that we have found so far
        if (wup["weight"] < best_wup["weight"]) {
          best_wup = wup;
        }
        // break when we find someone that we have't worked with
        if (best_wup["weight"] === 0) break;
      }
      // add the best person that we found
      nextTeam[nextTeam.length] = best_wup["person"];
      // remove them from the ungrouped list
      now_ungrouped = new Array(ungrouped.length - 1);
      for (let i = 0, j = 0; i < ungrouped.length; i++) {
        if (ungrouped[i] != best_wup["person"]) {
          now_ungrouped[j] = ungrouped[i];
          j++;
        }
      }
      ungrouped = now_ungrouped;
      //ungrouped = ungrouped.filter((person) => person != best_wup["person"]);
    }
    teams[teams.length] = nextTeam;
  }

  // handles uneven groups
  while (ungrouped.length > 0) {
    let leftover_person = ungrouped.pop()
    // we want to join the team where the ungrouped addition would affect the weight of the team the least 
    best_team_match = {
      "team_idx": -1,
      "weight": Number.MAX_SAFE_INTEGER
    };
    // check each team
    for (let i = 0; i < teams.length; i++) {
      // stop at teams of size 4
      if (teams[i].length > MAX_TEAM_SIZE) continue;
      // gather the weight of this team to see potential fit
      team_match = {
        "team_idx": i,
        "weight": teamHistory[leftover_person][teams[i][0]]
      }
      for (let j = 1; j < teams[i].length; j++) {
        team_match["weight"] = team_match["weight"] + teamHistory[leftover_person][teams[i][j]];
      }
      if (team_match["weight"] < best_team_match["weight"]) {
        best_team_match = team_match;
      }
      // if we found a perfect team, get out (save some iterations)
      if (best_team_match["weight"] === 0) {
        break;
      }
    }
    // add the ungrouped user to the best-matching team that we found
    teams[best_team_match["team_idx"]][(teams[best_team_match["team_idx"]]).length] = leftover_person;
  } 

  console.log(teams);
  // return our completed teams
  return teams;
}

export function formTeams(session_id, prevActIndex) {

  const { participants, teamHistory} = Sessions.findOne(session_id);
  
  // if we're on the first activity, call first teams. Otherwise, build based on teamHistory 
  if (prevActIndex < 0) return firstRoundTeams(participants);
  return buildNewTeams(participants, teamHistory)
}