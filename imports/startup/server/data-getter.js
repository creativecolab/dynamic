/* This File contains multiple functions that various apis use to get certain data in csv format */
import Sessions from '../../api/sessions';
import Users from '../../api/users';

import { getAverageRating } from './helper-funcs';
import { strict } from 'assert';

/* 
  Goal: Obtain information on each participants pid, name, and joining time. 
*/
export function getUserInfo(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'pid,name,join_time,elapsed_joined_time\n';


  // used to get elapsed time
  const first_person = Users.findOne({pid: participants[0]});
  let first_joined_time = first_person.sessionHistory.filter((sesh) => sesh.session_id === session._id)[0].sessionJoinTime;

  console.log(participants)
  // get the data for each participant in this session
  participants.forEach((participant) => {

    let user = Users.findOne({pid: participant});

    // get user's name
    let name = user.name;

    // get the user's join time
    let seshHistory = user.sessionHistory.filter((past_session) => past_session.session_id === session._id);
    // handles confusing bug where user is in participants list but does not have the session in their history
    // only occurs in dow2
    if (seshHistory.length == 1) {
      let join_time = seshHistory[0].sessionJoinTime;
      let elapsed_join_time = ((join_time - first_joined_time) / 1000).toFixed(3);
      let join_time_string = new Date(join_time).toString().substr(15, 9);
      
      // put it all together for this user
      ret += participant + ',' + name + ',' + join_time_string + ',' + elapsed_join_time + '\n';
    }
    else {
      console.log(user.pid);
      console.log(user);
    }
  });

  return ret;
}

/* 
  Row: unique user
  Column: pid, assessments_given_per_round, assessment_time_per_round 
  assessments_given_per_round format: "pid1:xx;pid2:yy;...$pid5:zz$pid6:aa;..."
  assessment_time_per_round format:  "xx;yy;..."
*/
export function getUserAssessment(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  if (!activities) {
    return 'No activities for the session ' + session_code + ' yet';
  }

  let header = 'pid,assessments_given_per_round,assessment_time_per_round\n';

  let body = ""

  // get the assessment data for each participant in this sessiom
  participants.forEach((participant) => {

    let user = Users.findOne({pid: participant});
    let preferences = ""
    let assessment_times = ""

    // separate by activity with a '$'
    activities.forEach( activity_id => {
      let user_preferences = user.preferences.filter( preference => preference.activity_id === activity_id);
      user_preferences.forEach((user_preference) => {
        // get the time it took for this assessment
        let curr_act = Activities.findOne(user_preference.activity_id);
        assessment_times += ((user_preference.timestamp - curr_act.statusStartTimes.peerAssessment) / 1000) + ";";
        // get the ratings
        user_preference.values.forEach((rating) => {
          preferences += rating.pid + ":" + rating.value + ";"
        });
        preferences = preferences.slice(0, -1) + '$';
      });
    });

    //replace last '$' with ,
    preferences = preferences.slice(0, -1) + ',';
    //replace last ';' with \n
    assessment_times = assessment_times.slice(0, -1) + '\n';
    
    // put it all together for this user
    body += participant + ',' + preferences + assessment_times;
  });

  return header + body;
}

/*
Row: group per round
Column: group_name, round, group_members, confirmed?, confirmation_time
Round - which round the group was formed.
Group_members - pid1;pid2;...
Confirmation_time - if not confirmed, NAN or -1
*/
export function getGroupsInfo(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { activities } = session;

  if (!activities) {
    return 'No activities for the session ' + session_code + ' yet';
  }

  let header = 'group_name,round,group_members,confirmed,confirmation_time\n'
  
  let body = ''

  // get the groups of each activity
  activities.forEach( (activity_id, round) => {

    const { team_ids } = Activities.findOne(activity_id);

    // get name, round, members, and if confirmed for each group
    team_ids.forEach( team_id => {

      let group = Teams.findOne(team_id);

      // build the row
      let group_name = group.color + " " + group.shape + ",";
      let curr_round = (round + 1) + ",";
      let group_members = "";
      group.members.forEach((member) => group_members += member.pid + ";");
      group_members = group_members.slice(0, -1) + ",";
      let confirmed = group.confirmed ? "Yes," : "No,";
      let confirmation_time = "-1"
      if (group.confirmed) confirmation_time = group.teamFormationTime / 1000;

      body += group_name + curr_round + group_members + confirmed + confirmation_time + "\n";

    })

  });

  return header + body;

}

/**
 * Produce a csv with the number of late participants.
 * This gets data for all sessions in the db.
 * Row: Session
 * Col: Num participants, Num Late
 */
export function getLateCount(session_code) {
  // get the session with the specified session code
  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, instructor, startTime } = session;

  // set up csv output
  let csv_deets = session_code + ',' + instructor + ',' + participants.length;
  let num_late = 0;

  // check all participants, see if any of them were late
  let no_more_late = false
  // check latest first
  for (let i = participants.length - 1; i > -1; i--) {
    let currUser = Users.findOne({pid: participants[i]}); 

    // as long as this participant exists, find sessionHistory for this session
    if (currUser) {
      for (let j = 0; j < currUser.sessionHistory.length; j++) {
        if (currUser.sessionHistory[j].session_id == session._id) {
          // check if the user joined session after it had started
          if (currUser.sessionHistory[j].sessionJoinTime > startTime) {
            num_late++;
          } else {
            // don't keep searching, no one who joined earlier will be late
            no_more_late = true;
          }
          // don't need to check other sessionHistories, we found what we need
          break;
        }
      }
    }
    // due to order of iteration, if someone wasn't late, no else will be
    if (no_more_late) break;
  }

  // return the results
  return csv_deets + "," + num_late + "\n";
}

/*
Row: session
Column: formation_time_per_round, discussion_time_per_round, assessment_time_per_round
formation_time_per_round - length of teamForm phase, sep. w/ $
discussion_time_per_round - length of teamPhase phase, sep. w/ $
assessment_time_per_round - length of peerAssessment phase, sep. w/ $
*/
export function getPhaseTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { activities } = session;

  if (!activities) {
    return 'No activities for the session ' + session_code + ' yet';
  }

  let header = 'session_id,formation_time_per_round,discussion_time_per_round,assessment_time_per_round\n'
  
  let formation_time_per_round = discussion_time_per_round = assessment_time_per_round = '';

  // get the phase times for each activity
  activities.forEach( (activity_id) => {

    const {statusStartTimes, endTime} = Activities.findOne(activity_id);

    formation_time_per_round = formation_time_per_round + ((statusStartTimes.teamPhase - statusStartTimes.teamForm) / 1000) + '$'; 
    discussion_time_per_round = discussion_time_per_round + ((statusStartTimes.peerAssessment - statusStartTimes.teamPhase) / 1000) + '$'; 
    assessment_time_per_round = assessment_time_per_round + ((endTime - statusStartTimes.peerAssessment) / 1000) + '$'; 

  });

  // format the body
  formation_time_per_round = formation_time_per_round.slice(0, -1) + ',';
  discussion_time_per_round = discussion_time_per_round.slice(0, -1) + ',';
  assessment_time_per_round = assessment_time_per_round.slice(0, -1) + '\n';

  return header + session_code + "," + formation_time_per_round + discussion_time_per_round + assessment_time_per_round;

}

/* 
Row: unique question
Column: question, category, round, time_spent
*/
export function getQuestionsInfo(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { instructor } = session;

  if (!instructor) {
    return 'Session ' + session_code + ' in not owned by any instructor, and does not have special questions!';
  }

  const questions = Questions.find({owner: instructor}).fetch();
  
  if (!questions) {
    return 'Session ' + session_code + ' with instructor ' + instructor + ' does not have special questions!';
  }

  let header = 'question,category,round,time_spent\n';
  let body = '';

  // go through all of the questions
  questions.forEach(question => {
    // build the body
    let prompt = question.prompt.replace(/\(e.g.*/g, "?").replace(/,/, "") + ","; //remove commas for csv formatting
    let category = 'Uncategorized,';
    switch (question.label) {
      case "TEAM QUESTION":
        category = 'TEAM QUESTION,';
        break;
      case "IDEATION":
        category = "IDEATION,";
        break;    
      case "ICEBREAKER":
        category = "ICEBREAKER,";
        break; 
      default:
    }
    let round = question.round + ",";
    let date = new Date(1000*Math.round(question.viewTimer/1000));
    let time_spent = date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds());

    body += prompt + category + round + time_spent + "\n";
  });

  return header + body;

}

/* 
Row: unique question
Column: question, category, round, time_spent
*/
export function getDefaultQuestions(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { instructor } = session;

  // if (instructor) {
  //   return 'Use the /api/questions/:code endpoint instead!'
  // }

  const questions = Questions.find({default: true}).fetch();
  
  if (!questions) {
    return 'Session ' + session_code + ' does not have default questions!';
  }

  let header = 'question,category,round,time_spent\n';
  let body = '';

  // go through all of the questions
  questions.forEach(question => {
    // build the body
    let prompt = question.prompt.replace(/\(e.g.*/g, "?").replace(/,/, "") + ","; //remove commas
    console.log(question);
    let category = 'Uncategorized,';
    switch (question.label) {
      case "TEAM QUESTION":
        category = 'TEAM QUESTION,';
        break;
      case "IDEATION":
        category = "IDEATION,";
        break;    
      case "ICEBREAKER":
        category = "ICEBREAKER,";
        break; 
      default:
        category = question.label + ",";
        break;
    }
    let round = question.round + ",";
    let date = new Date(1000*Math.round(question.viewTimer/1000));
    let time_spent = date.getUTCMinutes() + ':' + (date.getUTCSeconds() < 10 ? '0' + date.getUTCSeconds() : date.getUTCSeconds());

    body += prompt + category + round + time_spent + "\n";
  });

  return header + body;

}

/* 
Row: unique session
Column: session_id, session_owner, number_of_rounds, time_per_round, number_of_questions_per_round
*/
export function getSessionInfo() {

  // successful sessions from the Fall 2019 quarter
  const sessions = ['84qls', 'hg9ts', 'r6e6s', '4qdqj', 'm66mh', 'd7b8z', 'e7tfd', '8yybn']

  let header = 'session_id,session_owner,number_of_rounds,time_per_round,number_of_questions_per_round\n';
  let body = "";

  sessions.forEach((curr_session) => {
    const session = Sessions.findOne({code: curr_session});

    if (!session) body += 'Could not find session with session code ' + curr_session + '!\n';

    let owner = session.instructor;
    //let num_rounds_
  });

  return header + body;
}

///**** Below are older apis, not garuanteed to work with the current database. ****///

/* 
  Goal: Obtain details of the interactions of each participant in a session.
  Does so from the information saved by the "teamHistory" matrix in the queried session.
*/
export function getInteractions(session_code) {

  const blacklisted = ['3291', '6734', '5072', '1161', '8035'];

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, teamHistory, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,all_interactions,people_interacted_with,num_interactions,num_unique_interactions\n';

  participants.forEach((participant) => {
    const  participant_interactions = teamHistory[participant];
    const { preferences } = Users.findOne({pid: participant});
    let i_actions = ',{';
    let uniq_i_actions = '[';
    let total_interactions = 0;
    let unique_interactions = 0;
    if (!blacklisted.includes(participant)) {
      for (var person in participant_interactions) {
        if (participant_interactions.hasOwnProperty(person)) {
          if (!blacklisted.includes(person)) {
            if (participant_interactions[person] !== 0) {
              // change num to avg rating between each dude
              let avg_rating = getAverageRating(participant, preferences, person, Users.findOne({pid: person}).preferences, activities);
              i_actions += person + ': ' + avg_rating + '; ';
              uniq_i_actions += person + '; ';
              total_interactions = total_interactions + participant_interactions[person];
              unique_interactions = unique_interactions + 1;

            }
          }
        }
      }
    }
    if (!blacklisted.includes(participant)) {
      i_actions = i_actions.slice(0, -2);
      uniq_i_actions = uniq_i_actions.slice(0, -2);
    } else {
      i_actions += 'blacklisted'
      uniq_i_actions += 'blacklisted';
      total_interactions = 'blacklisted';
      unique_interactions = 'blacklisted';
    }
    i_actions += '},'; 
    uniq_i_actions += '],';
    ret += participant + i_actions + uniq_i_actions + total_interactions + ',' + unique_interactions + '\n';
  });

  return ret;

}

/* 
  Goal: Obtain information on each participants teams and ratings of their teams.
  Does so through looking through a User's team history, preference, and session history. 
*/
export function getUserHistory(session_code) {

  const blacklisted = ['3291', '6734', '5072', '1161', '8035'];

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  const { participants, activities } = session;

  if (!participants) {
    return 'No particpants for the session ' + session_code + ' yet';
  }

  let ret = 'participant,join_time,elapsed_joined_time,num_teams,num_teams_confirmed,avg_team_formation_time,' + 
            'num_ratings_given,avg_rating_given,avg_assessement_time,num_ratings_received,avg_rating_received\n';


  // used to get elapsed time
  const first_person = Users.findOne({pid: participants[0]});
  let first_joined_time = first_person.sessionHistory.filter((sesh) => sesh.session_id === session._id)[0].sessionJoinTime;

  // get the data for each participant in this sessiom
  participants.forEach((participant) => {

    let user = Users.findOne({pid: participant});

    // get the user's join time
    let join_time = user.sessionHistory.filter((past_session) => past_session.session_id === session._id)[0].sessionJoinTime;
    let elapsed_join_time = ((join_time - first_joined_time) / 1000).toFixed(3);

    // get information on user's team contributions
    let user_teams = user.teamHistory.filter((team) => (activities.includes(team.activity_id)));
    let num_teams = user_teams.length;
    let num_teams_confirmed = 0;
    let avg_team_formation_time = 0;
    user_teams.forEach((user_team) => {
      const actual_team = Teams.findOne(user_team.team);
      if (actual_team.confirmed) {
        avg_team_formation_time = avg_team_formation_time + actual_team.teamFormationTime;
        num_teams_confirmed = num_teams_confirmed + 1;
      }
    });
    avg_team_formation_time = ((avg_team_formation_time / num_teams) / 1000).toFixed(3);

    // get rating information on a user
    let user_preferences = user.preferences.filter((preference) => (activities.includes(preference.activity_id)));
    let num_ratings_given = 0;
    let avg_rating_given = 0;
    let total_assessment_time = 0;
    let avg_assessement_time = 0;
    let num_ratings_received = 0;
    let avg_rating_received = 0;
    let other_ratings_checked = {};
    user_preferences.forEach((user_preference) => {
      // get the time it took for this assessment and how many ratings were made, and the ratings themselves
      let curr_act = Activities.findOne(user_preference.activity_id);
      total_assessment_time = total_assessment_time + ((user_preference.timestamp - curr_act.statusStartTimes.peerAssessment) / 1000);
      num_ratings_given = num_ratings_given + user_preference.values.length;
      user_preference.values.forEach((rating) => {
        avg_rating_given = avg_rating_given + rating.value;
        // now get the ratings attributed to them
        if (!(other_ratings_checked[rating.pid])) {
          other_ratings_checked[rating.pid] = true;
          let other_user = Users.findOne({pid: rating.pid});
          let other_user_prefs = other_user.preferences.filter((preference) => (activities.includes(preference.activity_id)));
          // check the other user's ratings
          other_user_prefs.forEach((other_user_pref) => {
            other_user_pref.values.forEach((other_rating) => {
              if (other_rating.pid === participant) {
                num_ratings_received = num_ratings_received + 1;
                avg_rating_received = avg_rating_received + other_rating.value; 
              }
            });
          });
        }
      });
    });
    // calculate the averages 
    avg_rating_given = (avg_rating_given / num_ratings_given).toFixed(3);
    avg_assessement_time = (total_assessment_time / user_preferences.length).toFixed(3);
    avg_rating_received = (avg_rating_received / num_ratings_received).toFixed(3);

    // check for blacklistees
    if (blacklisted.includes(participant)) {
      num_teams = 'blacklisted';
      num_teams_confirmed = 'blacklisted';
      avg_team_formation_time = 'blacklisted';
      num_ratings_given = 'blacklisted';
      avg_rating_given = 'blacklisted';
      avg_assessement_time = 'blacklisted';
      num_ratings_received = 'blacklisted';
      avg_rating_received = 'blacklisted';
    } 
    
    // put it all together for this user
    ret += participant + ',' + join_time + ',' + elapsed_join_time + ',' + 
            num_teams + ',' + num_teams_confirmed + ',' + avg_team_formation_time + ',' +
            num_ratings_given + ',' + avg_rating_given + ',' + avg_assessement_time + ',' +
            num_ratings_received + ',' + avg_rating_received + '\n';
  });

  return ret;
}

export function getTeamConfirmationTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Team,Activity,Time\n";
  let total_confirmation_time = 0;
  let num_confirmations = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids, index } = curr_act;

    total_confirmation_time = 0;
    num_confirmations = 0;

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      if (team.confirmed) {
        // update the count and running total of confirmation times
        num_confirmations = num_confirmations + 1;
        total_confirmation_time = total_confirmation_time + (team.teamFormationTime / 1000);
        ret = ret + "Team " + team.color + "_" + team.shape + ",Round " + (index+1) + "," + (team.teamFormationTime / 1000) + "\n";
      }
    });

    ret = ret + "Average,Round " + (index+1) + "," + (total_confirmation_time / num_confirmations).toFixed(3) + "\n";

  });

  // calculate average
  //ret = ret + "Average Team Confirmation Time this session: " + (total_confirmation_time / num_confirmations);
  
 return ret;

}

export function getUserConfirmationTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Confirmation_Time,Round\n";

  participants = {}

  session.participants.forEach(participant => {
    participants[participant] = {
      "1": 0,
      "2": 0,
      "3": 0,
      "4": 0,
      "5": 0,
      "6": 0
    };
  });

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids, index } = curr_act;

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      if (team.confirmed) {
        // update the count and running total of confirmation times
        team.members.forEach((member) => {
          participants[member.pid][String(index+1)] = (team.teamFormationTime / 1000);
        });
      }
    });


  });

  for (var participant in participants) {
    if (participants.hasOwnProperty(participant)) {
        ret = ret + (participants[participant]["1"] > 0 ? participants[participant]["1"] + ",1\n" : "")
        + (participants[participant]["2"] > 0 ? participants[participant]["2"] + ",2\n" : "")
        + (participants[participant]["3"] > 0 ? participants[participant]["3"] + ",3\n" : "")
        + (participants[participant]["4"] > 0 ? participants[participant]["4"] + ",4\n" : "")
        + (participants[participant]["5"] > 0 ? participants[participant]["5"] + ",5\n" : "")
        + (participants[participant]["6"] > 0 ? participants[participant]["6"] + ",6\n" : "")
    }
}

  
 return ret;

}

export function getLastTeams(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "Participant,Last Team\n";

  const { participants, activities } = session;

  const lastAct = Activities.findOne({session_id: session._id, index: activities.length-1})
  console.log(lastAct);

  const { team_ids } = lastAct

  const lastTeams = Teams.find({_id: { $in: team_ids}}).fetch()

  lastTeams.forEach(team => { 
    const toAdd = team.members.map((mate) => {
      return mate.pid + ';' + team.members.filter((other_mate) => other_mate != mate).map((other_mate) => other_mate.pid)
    });
    toAdd.forEach((last_team) => {
      ret += last_team.substr(0, last_team.indexOf(';')) + ',' 
              + last_team.substr(last_team.indexOf(';') + 1).replace(/,/g, ';') + '\n';      
    })
  });

  participants.forEach((participant) => {

  });


  return ret
}

export function getUserAssessmentTimes(session_code) {

  const session = Sessions.findOne({ code: session_code.toLowerCase() });

  if (!session) {
    return 'No session named ' + session_code + ' yet!';
  }

  let ret = "User-Assessment-Times\n";
  let total_assessment_time = 0;
  let total_num_assessments = 0;

  session.activities.forEach((activity_id) => {
    const curr_act = Activities.findOne(activity_id);

    if (!curr_act) {
      ret = ret + 'No activity with id ' + activity_id + ' yet!\n';
      return;
    }

    const { team_ids } = curr_act;

    ret = ret + "Activity " + activity_id + "\n";

    // get the average for this round
    let num_assessments = 0
    let round_assessment_time = 0

    team_ids.forEach((team_id) => {
      let team = Teams.findOne(team_id);
      team.members.forEach((member) => {
        let user = Users.findOne({"pid": member.pid, 'sessionHistory.session_id': session._id });
        let assessment = user.preferences.filter((pref) => pref.activity_id === activity_id);
        // should be 1 assessment
        if (assessment.length === 1) {
          // time is the elapsed time, update count and running total
          let assessment_time = assessment[0].timestamp - curr_act.statusStartTimes.peerAssessment;
          num_assessments = num_assessments + 1;
          round_assessment_time = round_assessment_time + (assessment_time / 1000);
          ret = ret + "User " + user.pid +  " took " + (assessment_time / 1000) + " seconds to submit preferences\n";
        }    
      });
    });

    ret = ret + "Average Assessment Time this round is " + (round_assessment_time / num_assessments) + "\n";

    // keep running total going
    total_num_assessments = total_num_assessments + num_assessments;
    total_assessment_time = total_assessment_time + round_assessment_time

  });

  // calculate average
  ret = ret + "Average User Assessment Time this session: " + (total_assessment_time / total_num_assessments);
  
 return ret;

}
 