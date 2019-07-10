import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';

// helper function to shuffle array
// reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));

    [a[i], a[j]] = [a[j], a[i]];
  }

  return a;
};

// TODO: get these from instructor
const MAX_TEAM_SIZE = 3;
const MAX_NUM_TEAMS = 50;

// set up the colors that the teams will use
function buildColoredShapes(colored_shapes) {

  const shapes = shuffle(['circle', 'cross', 'moon', 'square', 'star', 'sun', 'heart', 'car', 'triangle']);
  const shapeColors = shuffle(['blue', 'green', 'orange', 'red']);

  for (let i = 0; i < shapes.length; i++) {
    for (let j = 0; j < shapeColors.length; j++) {
      colored_shapes.push({ shape: shapes[i], color: shapeColors[j] });
    }
  }

  shuffle(colored_shapes);

}

// builds teams for the first round of team formation
export function buildInitialTeams(act_id, participants, questions) {

  // get the random colored shapes
  colored_shapes = [];
  buildColoredShapes(colored_shapes);

  //random teams (might not be needed)
  shuffle(participants);

  //array to hold the team_ids of all the created teams
  const teams = [];

  //array to hold the current team being built
  let newTeam = [participants[0]];

  //arrays and saved team_ids to saved previously built teams in the case of uneven sizings
  let oldTeam = [];
  let olderTeam = [];
  let team_id = '';
  let older_team_id = '';

  // team formation process
  for (let i = 1; i < participants.length; i++) {
    // completed a new team
    if (i % MAX_TEAM_SIZE == 0) {
      // second most-recent team created
      older_team_id = team_id;
      // most recent team created
      team_id = Teams.insert({
        activity_id: act_id,
        teamCreated: new Date().getTime(),
        members: newTeam.map(pid => ({ pid, confirmed: false })),
        color: colored_shapes[teams.length].color,
        shape: colored_shapes[teams.length].shape,
        teamNumber: teams.length,
        responses: [],
        questions: shuffle(questions),
        index: 0
      });

      //update the users teammates
      for (let k = 0; k < newTeam.length; k++) {
        Users.update(
          { pid: newTeam[k] },
          {
            $push: {
              teamHistory: { 
                team: team_id, 
                teamNumber: teams.length, 
                teamPosition: k,
                activity_id: act_id 
              }
            }
          }
        );
      }

      // keep track of older teams just in case
      olderTeam = oldTeam.slice(0);
      oldTeam = newTeam.slice(0);

      // save this added team
      teams.push(team_id);

      //onto next member
      newTeam = [participants[i]];
    }

    // add new member to team
    else {
      newTeam.push(participants[i]);
    }
  }

  // only 1 participant left, create team of MAX_TEAM_SIZE + 1 because there is already a team of 3
  if (newTeam.length === 1 && teams.length > 0 && oldTeam.length < MAX_TEAM_SIZE + 1) {
    // update the team in database
    Teams.update(team_id, {
      $set: {
        teamCreated: new Date().getTime(),
      }, 
      $push: {
        members: { pid: newTeam[0], confirmed: false }
      }
    });
    // update this odd-one out user's team history
    Users.update(
      { pid: newTeam[0] },
      {
        $push: {
          teamHistory: { 
            team: team_id, 
            teamNumber: teams.length-1, // previous team made had this number
            teamPosition: MAX_TEAM_SIZE,
            activity_id: act_id 
          }
        }
      }
    );

    oldTeam.push(newTeam[0]);
  }

  // only 2 participants left, create 2 teams of MAX_TEAM_SIZE + 1
  else if (
    newTeam.length === MAX_TEAM_SIZE - 1 && teams.length > 1 &&
    oldTeam.length < MAX_TEAM_SIZE + 1 && olderTeam.length < MAX_TEAM_SIZE + 1
  ) {
    // add the first user to an older team
    Teams.update(team_id, {
      $set: {
        teamCreated: new Date().getTime(),
      }, 
      $push: {
        members: { pid: newTeam[0], confirmed: false }
      }
    });
    // update the first odd-one-out user's team history
    Users.update(
      { pid: newTeam[0] },
      {
        $push: {
          teamHistory: { 
            team: team_id, 
            teamNumber: teams.length-1, 
            teamPosition: MAX_TEAM_SIZE,
            activity_id: act_id 
          }        }
      }
    );
    // keep track of this now team of 4
    oldTeam.push(newTeam[0]);

    // add the second user
    Teams.update(older_team_id, {
      $set: {
        teamCreated: new Date().getTime(),
      }, 
      $push: {
        members: { pid: newTeam[1], confirmed: false }
      }
    });
    // update the second odd-one-out user's team history
    Users.update(
      { pid: newTeam[1] },
      {
        $push: {
          teamHistory: { 
            team: team_id, 
            teamNumber: teams.length-2, // the oldest team saved is 2 teams ago
            teamPosition: MAX_TEAM_SIZE,
            activity_id: act_id 
          }        
        }
      }
    );
    //also keep track of this now team of 4
    olderTeam.push(newTeam[1]);
  }

  // last team is of MAX_TEAM_SIZE or less and there aren't enough other teams to build proper teams of MAX_SIZE+1
  else if (newTeam.length <= MAX_TEAM_SIZE) {
    team_id = Teams.insert({
      activity_id: act_id,
      teamCreated: new Date().getTime(),
      members: newTeam.map(pid => ({ pid, confirmed: false })),
      color: colored_shapes[teams.length].color,
      shape: colored_shapes[teams.length].shape,
      teamNumber: teams.length,
      responses: [],
      questions: shuffle(questions),
      index: 0
    });

    // keep track of older teams just in case
    olderTeam = oldTeam.slice(0);
    oldTeam = newTeam.slice(0);

    //update each of these left-out users' team histories
    for (let k = 0; k < newTeam.length; k++) {
      Users.update(
        { pid: newTeam[k] },
        {
          $push: {
            teamHistory: { 
              team: team_id, 
              teamNumber: teams.length, // the oldest team saved is 2 teams ago
              teamPosition: k,
              activity_id: act_id 
            }           
          }
        }
      );
    }

    teams.push(team_id);
  }

  // return properly produced teams
  return teams;
}

// builds teams for subsequent rounds of team formation (where duplicates are avoided)
export function buildNewTeams(act_id, participants, questions) {

  if (participants.length < 6) return buildInitialTeams(act_id, participants, questions);

  // get the random colored shapes
  colored_shapes = [];
  buildColoredShapes(colored_shapes);

  //array to hold the team_ids of all the created teams
  const teams = [];
  const maxNumTeams = Math.floor(participants.length / 3.0);

  // arrays to hold the new teams and those users who are new additions
  let ungrouped = [];
  let newTeams = [];
  let user_groups = [];

  for (let i = 0; i < participants.length; i++) {
    let user_example = Users.findOne({pid: participants[i]});
    let user_history = user_example.teamHistory;

    if (!user_history.length) {
      // user has no teamHistory, they are a new user for this round
      ungrouped.push(participants[i]);
    }
    else {
      let last_act_info = user_history.pop();
      // user 'shifts' teams based on their position on their last team
      switch(last_act_info.teamPosition) {
        case 0:
          user_groups.push({
            pid: participants[i],
            teamNumber: last_act_info.teamNumber,
            teamPosition: last_act_info.teamPosition
          });
          break;
        case 1:
          user_groups.push({
            pid: participants[i],
            teamNumber: (last_act_info.teamNumber + 1) % maxNumTeams,
            teamPosition: last_act_info.teamPosition
          });
          break;
        case 2:
          user_groups.push({
            pid: participants[i],
            teamNumber: (last_act_info.teamNumber + 2) % maxNumTeams,
            teamPosition: last_act_info.teamPosition
          });
          break;
        default:
          user_groups.push({
            pid: participants[i],
            teamNumber: (last_act_info.teamNumber + 3) % maxNumTeams,
            teamPosition: last_act_info.teamPosition
          });
          break;
      }
    }
  }

  // sort our groups based on teamNumber
  user_groups.sort((user1, user2) => {
    return user1.teamNumer < user2.teamNumber;
  });

  // build teams with the non-new people
  var num_teams = Math.floor((participants.length - ungrouped.length) / 3.0);
  for (let currTeamNum = 0; currTeamNum < num_teams; currTeamNum++) {
    let currTeam = user_groups.filter((user) => (user.teamNumber === currTeamNum));
    newTeams.push(currTeam);
  }

  // make some teams with the ungrouped users
  while (ungrouped.length >= MAX_TEAM_SIZE) {
    let currTeam = [];
    // build teams of MAX_TEAM_SIZE with a teamNumber that is the largest so far
    for (let j = 0; j < MAX_TEAM_SIZE; j++) {
      currTeam.push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: j
      });
    }
    newTeams.push(currTeam);
  }

  // make some unevenly sized teams with any remaining ungrouped users
  if (ungrouped.length === MAX_TEAM_SIZE - 1) {
    // find out how many teams there are of size < MAX_TEAM_SIZE + 1
    let count = 0;
    let less_indices = [];
    let more_indices = [];
    for (let i = 0; i < newTeams.length; i++) {
      if (newTeams[i].length < MAX_TEAM_SIZE + 1) {
        count = count + 1;
        less_indices.push(i);
      } else {
        more_indices.push(i);
      }
      if (count === 2) break;
    }

    //2 left: If at least two teams of size < MAX_TEAM_SIZE + 1 -> make another two teams of MAX_TEAM_SIZE + 1
    if (count >= 2) {
      newTeams[less_indices[0]].push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: MAX_TEAM_SIZE + 1
      }); 
      newTeams[less_indices[1]].push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: MAX_TEAM_SIZE
      }); 
    }
    //2 left: Only one team of size < MAX_TEAM_SIZE + 1 -> adjust a team of 4 to a NEW team of 3 
    else if (count === 1) {
      oneUser = newTeams[more_indices[0]].pop(); // adjust a team of 4
      currTeam.push({
        pid: oneUser.pid,
        teamNumber: newTeams.length,
        teamPosition: 0
      });
      currTeam.push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: 1
      });
      currTeam.push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: 2
      });
      //add this new team to our teams
      newTeams.push(currTeam);
    }
    //2 left: No teams of size < MAX_TEAM_SIZE + 1 -> adjust a two teams of 4 to make two teams of 3 and one NEW team of 4
    else {
      oneUser = newTeams[more_indices[0]].pop(); // adjust a team of 4
      anotherUser = newTeams[more_indices[1]].pop(); // adjust another team of 4
      currTeam.push({
        pid: oneUser.pid,
        teamNumber: newTeams.length,
        teamPosition: 0
      });
      currTeam.push({
        pid: anotherUser.pid,
        teamNumber: newTeams.length,
        teamPosition: 1
      });
      currTeam.push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: 2
      });
      currTeam.push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: MAX_TEAM_SIZE
      });
      //add this new team to all of our teams
      newTeams.push(currTeam);

    }
  }
  else if (ungrouped.length === 1) {
    // find out how many teams there are of size < MAX_TEAM_SIZE + 1
    let count = 0;
    let less_indices = [];
    let more_indices = [];
    for (let i = 0; i < newTeams.length; i++) {
      if (newTeams[i].length < MAX_TEAM_SIZE + 1) {
        count = count + 1;
        less_indices.push(i);
        break;
      } else {
        more_indices.push(i);
      }
    }
    //1 left: If at least one team of size < MAX_TEAM_SIZE + 1 -> make a team of 4
    if (count === 1) {
      newTeams[less_indices[0]].push({
        pid: ungrouped.pop(),
        teamNumber: newTeams.length,
        teamPosition: MAX_TEAM_SIZE + 1
      }); 
    } 
    //1 left: No teams of size < MAX_TEAM_SIZE + 1 -> adjust a team of 4 to make a team of 3 and a team of 2. TODO: ??
  }

  newTeams.map((currTeam) => {
    //add to Teams
    //update Users
    let team_id = Teams.insert({
      activity_id: act_id,
      teamCreated: new Date().getTime(),
      members: currTeam.map(user => ({ pid: user.pid, confirmed: false })),
      color: colored_shapes[teams.length].color,
      shape: colored_shapes[teams.length].shape,
      teamNumber: currTeam[0].teamNumber,
      responses: [],
      questions: shuffle(questions),
      index: 0
    });

    //update each of these left-out users' team histories
    for (let k = 0; k < currTeam.length; k++) {
      Users.update(
        { pid: currTeam[k].pid },
        {
          $push: {
            teamHistory: { 
              team: team_id, 
              teamNumber: currTeam[k].teamNumber, 
              teamPosition: currTeam[k].teamPosition,
              activity_id: act_id 
            }           
          }
        }
      );
    }
    // add the team to the list of teams
    teams.push(team_id);
  });

  // return properly produced teams
  console.log(teams);
  return teams;
}