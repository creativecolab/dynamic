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
              teamHistory: { team: team_id, activity_id: act_id }
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
  if (newTeam.length === 1 && teams.length > 0 && oldTeam.length < MAX_TEAM_SIZE - 1) {
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
          teamHistory: { team: team_id, activity_id: act_id }
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
          teamHistory: { team: team_id, activity_id: act_id }
        }
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
          teamHistory: { team: older_team_id, activity_id: act_id }
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
            teamHistory: { team: team_id, activity_id: act_id }
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
export function buildNewTeams(act_id, participants) {

  // get the random colored shapes
  colored_shapes = [];
  buildColoredShapes(colored_shapes);

  //random teams (might not be needed)
  shuffle(participants);

  //array to hold the team_ids of all the created teams
  const teams = [];

  //arrays and saved team_ids to saved previously built teams in the case of uneven sizings
  let oldTeam = [];
  let olderTeam = [];
  let team_id = '';
  let older_team_id = '';

  let ungrouped = participants.slice(0);
  while (ungrouped.length > 0) {
    let ungrouped_user = ungrouped[0];

    // case where they are the last user

    // case where they are one of the last two users

    //normal case
    let ungrouped_user_data = Users.findOne({ pid: ungrouped_user});

    // edge case, user joined late
    if (ungrouped_user_data.teamHistory.length === 0) {
      // add to back of ungrouped
      ungrouped = ungrouped.slice(1);
      ungrouped.push(ungrouped_user);
      //continue;
    }

    // array to hold the people who this user has already teamed with
    let unavailable = [];

    // go through the user's team history
    ungrouped_user_data.teamHistory.map((past_team) => {
      // get the teammembers that the user has worked with in the past
      let teammembers = Teams.findOne({_id: past_team.team}).members
      teammembers = teammembers.map((member) => member.pid).filter((member) => (member != ungrouped_user));
      console.log(teammembers);
      // mark these teammembers as unavailable
      unavailable.push(teammembers);
    })

    // find the available people
    let available = ungrouped.filter(person => !unavailable.includes(person));
    console.log(available);

    // build the new team
    newTeam = [ungrouped_user];

    // build a team of size MAX_TEAM_SIZE if possible, and mark them as grouped
    for (let i = 0; i < available.length && i < MAX_TEAM_SIZE-1; i++) {
      newTeam.push(available[i]);
      ungrouped = ungrouped.filter((person) => person != available[i])
    }

    // if we can't make a full team
    if (newTeam.length < MAX_TEAM_SIZE) {
      // if there are two people left, add them to the 2 most recently created teams
      if (newTeam.length === MAX_TEAM_SIZE - 1 && teams.length > 1 && 
        oldTeam.length < MAX_TEAM_SIZE + 1 && olderTeam.length < MAX_TEAM_SIZE + 1) {
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
                teamHistory: { team: team_id, activity_id: act_id }
              }
            }
          );
          // keep track of this now team of 4 (MAX_TEAM_SIZE+1)
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
                teamHistory: { team: older_team_id, activity_id: act_id }
              }
            }
          );
          // also keep track of this now team of 4 (MAX_TEAM_SIZE+1)
          olderTeam.push(newTeam[1]);
      } 
      // only 1 participant left, create team of MAX_TEAM_SIZE + 1 because there is already a team of 3
      else if (newTeam.length === 1 && teams.length > 0 && oldTeam.length < MAX_TEAM_SIZE - 1) {
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
              teamHistory: { team: team_id, activity_id: act_id }
            }
          }
        );

        oldTeam.push(newTeam[0]);
      }
      // last team is of MAX_TEAM_SIZE or less and there aren't enough other teams to build proper teams of MAX_SIZE+1
      else if (newTeam.length <= MAX_TEAM_SIZE) {
        team_id = Teams.insert({
          activity_id: act_id,
          teamCreated: new Date().getTime(),
          members: newTeam.map(pid => ({ pid, confirmed: false })),
          color: colored_shapes[teams.length].color,
          shape: colored_shapes[teams.length].shape,
          responses: []
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
                teamHistory: { team: team_id, activity_id: act_id }
              }
            }
          );
        }

        teams.push(team_id);
      }
    } else {
      // we have a full team

      //database entry

      teams.push(newTeam);

      olderTeam = oldTeam.splice(0);
      oldTeam = newTeam.splice(0);
    }

  
    //   -for each team that they’ve previously been in
      //     -for each teammates
        //       -add to list of previous teammates
  }


  // -for each person:
  // -make array of previous partners:
  //   -check previous teams (based on team_history and team_ids)
  //   -for each team that they’ve previously been in
  //     -for each teammates
  //       -add to list of previous teammates
  // var valid_participants = [1,2,3,4],
  //     res = arr.filter(person => !brr.includes(person));
  // console.log(res);

  // return properly produced teams
  return teams;
}