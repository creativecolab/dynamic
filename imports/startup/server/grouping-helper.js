/* File is meant to build the teams for team formation given the participants and team history */
import Sessions from '../../api/sessions'
// Some constants
const MAX_TEAM_SIZE = 3;

// helper function to shuffle array
// reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
}

/*
  Produce the teams for the first round. Should be random, with a goal of teams of 3.
  Will return an array of arrays, with each internal array have pids representing a team
 */
export function firstRoundTeams(participants) {

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
      nextTeam.push(ungrouped.pop());
    }
    teams.push(nextTeam);
  }

  // handles uneven groups
  let addIndex = 0;
  while (ungrouped.length > 0) {
    teams[addIndex].push(ungrouped.pop());
    addIndex++;
  } 

  console.log(teams);
  // return our completed teams
  return teams;

}

// builds teams for subsequent rounds of team formation (where duplicates are avoided)
export function buildNewTeams(participants, session_id) {

  // edge case, when num_participants < 6, can't guarantee uniqueness so just make random
  if (participants.length < 6) return buildInitialTeams(participants);

  // shake 'em up
  shuffle(participants);

  // list to hold all of our teams and one to keep track of grouped people
  let teams = [];
  var ungrouped = participants.slice(0);

  // obtain the teamHistory of this session
  var teamHistory = Sessions.findOne(session_id).teamHistory;


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
      }
      // add the best person that we found
      nextTeam.push(best_wup["person"]);
    }
    teams.push(nextTeam);
  }

  // handles uneven groups
  while (ungrouped.length > 0) {
    let leftover_person = ungrouped.pop();
    // we want to join the team where the ungrouped addition would affect the weight of the team the least 
    best_team_match = {
      "team_idx": -1,
      "weight": Number.MAX_SAFE_INTEGER
    };
    // check each team
    for (let i = 0; i < teams.length; i++) {
      team_match = {
        "team_idx": i,
        "weight": teamHistory[leftover_person][teams[i][0]]
      };
      for (let j = 1; j < teams[i].length; j++) {
        team_match["weight"] = team_match["weight"] + teamHistory[leftover_person][teams[i][j]];
      }
      if (team_match["weight"] < best_team_match["weight"]) {
        best_team_match = team_match;
      }
    }
    // add the ungrouped user to the best-matching team that we found
    teams[best_team_match["team_idx"]].push(leftover_person);
  } 

  console.log(teams);
  // return our completed teams
  return teams;
}
