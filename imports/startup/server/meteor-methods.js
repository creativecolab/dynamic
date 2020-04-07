import { Meteor } from 'meteor/meteor';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';
import Questions from '../../api/questions';

/* Meteor methods (server-side functions, mostly database work) */
Meteor.methods({
  'users.addUser': function(pid, name) {
    if (!(Users.findOne({pid: pid}))) {
      Users.insert({
        name: name,
        pid,
        joinTime: new Date().getTime(),
        teamHistory: [],
        sessionHistory: [],
        preferences: [],
        browserInfo: []
      });
      console.log("New user " + pid + " added!");
    } else {
      console.log("Did not add user " + pid + " since they are already in the database.");
    }
  },

  'users.addBrowserInfo': function(pid, browserInfo) {
    const user = Users.findOne({pid: pid});

    Users.update(user._id, {
      $push: {
        browserInfo: {
          browser: browserInfo.browser,
          browserVersion: browserInfo.browserVersion,
          os: browserInfo.os,
          osVersion: browserInfo.osVersion,
          time: Date.now()
        }
      }
    });
  },

  'sessions.addUser': function(pid, session_id) {

    // get the current session and the relevant user
    const session = Sessions.findOne(session_id);
    const user = Users.findOne({pid: pid});

    // verify that this user exists
    if (!user) {
      console.log("User with pid " + pid + " does not exist, will not add to participants.")
        throw new Meteor.Error("nonexistant-pid",
        "A dynamic-user with this PID does not exist.");
    }

    // note the session join time
    Users.update(user._id, {
      $push: {
        sessionHistory: {
          session_id: session_id,
          sessionJoinTime: new Date().getTime(),
          viewedSummary: false,
          selectedEmails: false,
          sentEmails: false
        }
      }
    });

    // verify that this user it not in participants already
    for (let i = 0; i < session.participants.length; i++) {
      if (session.participants[i] === pid) {
        console.log("Duplicate User, will ignore.")
        throw new Meteor.Error("duplicate-pid",
        "PID already present in participants for this session.");      
      }
    }

    // add user to session
    Sessions.update(session_id, {
        $push: {
          participants: pid
        }
      }
    );
  },

  'sessions.buildTeamHistory': function(participants, session_id) {
    teamHistory = {};
    participants.forEach(participant => {
      teamHistory[participant] = {};
      participants.forEach(other_participants => {
        if (other_participants != participant) teamHistory[participant][other_participants] = 0;
      });
    });
    Sessions.update(session_id, {
      $set: {
        teamHistory
      }
    });
  },

  'sessions.finishSession': function(session_id) {
    Sessions.update(session_id, {
      $set: {
        endTime : new Date().getTime(),
        status: 3
      }  
    });
  },

  'activities.updateStatus': function(activity_id) {
    try {
      const activity = Activities.findOne(activity_id);

      const currentStatus = activity.status;

      // increment the status, get the appropriate timestamp, and prepare for next status
      switch (currentStatus) {
        case 0:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1, 
              'statusStartTimes.buildTeams': new Date().getTime()
            }
          });

          return currentStatus + 1;
        case 1:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.teamForm': new Date().getTime(),
              allTeamsFound: false
            }
          });

          return currentStatus + 1;
        case 2:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.teamPhase': new Date().getTime()
            }
          });

          return currentStatus + 1;
        case 3:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              'statusStartTimes.peerAssessment': new Date().getTime()
            }
          });

          return currentStatus + 1;
        case 4:
          Activities.update(activity_id, {
            $set: {
              status: currentStatus + 1,
              endTime: new Date().getTime()
            }
          });

          return currentStatus + 1;
        default:
          console.log('No longer incrementing');

          return -1;
      }
    } catch (error) {
      console.log(error);
    }
  },

  // write the the database for tracking question time
  'questions.updateTimers': function(past_question, next_question, startTime, endTime) {
    // save the time spent on the last question
    Questions.update(
      past_question,
      {
        $inc: {
          viewTimer: endTime - startTime
        }
      },
      error => {
        if (!error) {
          //console.log('Saved past question');
        } else {
          console.log(error);
        }
      }
    );

    // update how many times the next question has been viewed
    if (next_question != '') {
      Questions.update(
        next_question,
        {
          $inc: {
            timesViewed: 1
          }
        },
        error => {
          if (!error) {
            //console.log('Saved next question');
          } else {
            console.log(error);
          }
        }
      );
    }
  },

  'questions.setCurrent': function(team_id, member_pid, question_ind){
    // update the team of interest with the new members
    console.log(team_id);
    console.log(member_pid);
    console.log(question_ind);
    Teams.update({
      _id: team_id,
      "currentQuestions.pid": member_pid
    },
    { 
      $set: { "currentQuestions.$.question_ind" : question_ind } 
    },
    (error) => {
      if (error) {
        throw new Meteor.Error("failed-to-set-current-question",
        "Unable to set current question for member");
      } 
    });
  },

  'users.addPoints': function({ user_id, session_id, points }) {
    Users.update(
      {
        _id: user_id,
        sessionHistory: {
          $elemMatch: {
            session: session_id
          }
        }
      },
      {
        $set: {
          'sessionHistory.$.points': points
        }
      },
      () => {
        //track the session that was created
        Logs.insert({
          log_type: 'Points Added',
          code: session_id,
          user: Users.findOne(user_id).pid,
          timestamp: new Date().getTime()
        });
      }
    );
  },

  'users.toggleViewedSummary': function(pid, session_id, summaryViewToggle) {
    Users.update(
      {
        pid: pid,
        sessionHistory: {
          $elemMatch: {
            session_id: session_id
          }
        }
      },
      {
        $set: {
          'sessionHistory.$.viewedSummary': summaryViewToggle
        }
      }
    );
  },

  'users.toggleSelectedEmails': function(pid, session_id, selectEmailsToggle) {
    Users.update(
      {
        pid: pid,
        sessionHistory: {
          $elemMatch: {
            session_id: session_id
          }
        }
      },
      {
        $set: {
          'sessionHistory.$.selectedEmails': selectEmailsToggle
        }
      }
    );
  },

  'users.toggleSentEmails': function(pid, session_id, sendEmailsToggle) {
    Users.update(
      {
        pid: pid,
        sessionHistory: {
          $elemMatch: {
            session_id: session_id
          }
        }
      },
      {
        $set: {
          'sessionHistory.$.sentEmails': sendEmailsToggle
        }
      }
    );
  },

  'teams.removeMember': function(team_id, removee) {
    // update the team of interest with the new members
    console.log(team_id);
    console.log(removee);
    Teams.update({
      _id: team_id,
    },
    {
      $pull: {
        members: {
          pid: removee
        }
      },
      $set: {
        remove: true
      }
    }, 
    (error) => {
      if (error) {
        throw new Meteor.Error("failed-to-remove",
        "Unable to remove that person from this team.");
      } 
    });
  },

  'sessions.removeMember': function(activity_id, pid) {
    // find the current session
    const session = Sessions.findOne({
      activities: activity_id
    });

    if (!session) {
      throw new Meteor.Error("no-such-session",
        "Can't remove participants from a non-existant session.");
    }

    // check if there's enough participants to remove
    const { participants } = session;
    if (participants.length - 1 < 2) {
      throw new Meteor.Error("not-enough-participants",
        "Not enough participants to remove this person from the session.");
    }

    // build the new participants for this session
    let new_participants = [participants.length -1 ];
    for (let i = 0, j = 0; i < participants.length; i++) {
      if (participants[i] != pid) {
        new_participants[j] = participants[i];
        j++;
      }
    }

    // update the session's participants
    Sessions.update({
      _id: session._id
    }, {
      $set: {
        participants: new_participants
      }
    }, 
    (error) => {
      if (error) {
        throw new Meteor.Error("failed-to-remove",
        "Unable to remove this person from this session.");
      } 
    });
  }
});