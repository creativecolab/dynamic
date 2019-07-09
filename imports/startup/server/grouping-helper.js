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
export function buildInitialTeams(act_id, participants) {

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
        responses: []
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
          teamHistory: { team: team_id, activity: act_id }
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
          teamHistory: { team: older_team_id, activity: act_id }
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
            teamHistory: { team: team_id, activity: act_id }
          }
        }
      );
    }

    teams.push(team_id);
  }

  // return properly produced teams
  return teams;

  // // start and update activity on database
  // Activities.update(
  //   _id,
  //   {
  //     $set: {
  //       teams,
  //       allTeamsFound: false
  //     }
  //   },
  //   error => {
  //     if (!error) {
  //       console.log('Teams created!');
  //     } else {
  //       console.log(error);
  //     }
  //   }
  // );
}