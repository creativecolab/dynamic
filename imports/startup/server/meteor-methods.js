import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';

import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Logs from '../../api/logs';
import Questions from '../../api/questions';

import { produceEmailMastersheet } from './helper-funcs';
import { buildEmailPrompt, emailHeader, emailSender } from './email-prompts';

/* Meteor methods (server-side functions, mostly database work) */
Meteor.methods({

  /* Users Collection Methods */
  
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

  'users.addToEmailList': function(pid, session_id, teammember_pid) {
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
        $addToSet: {
          'sessionHistory.$.sendEmailsTo': teammember_pid
        }
      }
    );
  },

  'users.removeFromEmailList': function(pid, session_id, teammember_pid) {
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
        $pull: {
          'sessionHistory.$.sendEmailsTo': teammember_pid
        }
      }
    );
  },

  'users.saveEmail': function(pid, session_id, email_address) {
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
          'sessionHistory.$.emailAddress': email_address,
          'sessionHistory.$.sentEmails': true
        }
      },
    );

    // since this user has completed the session, mark them as completed for this session
    Sessions.update(session_id, {
      $push: {
        doneParticipants: pid
      }
    }
    );
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

  'users.getSummary': function(pid, session_id){
    const user = Users.findOne({ pid });
    const session = Sessions.findOne({ _id: session_id });

    var relevant_prefs = [];

    console.log(user.preferences);

    //get all preferences of the users for this session
    for (var i = 0; i < user.preferences.length; i++) {
      const pref = user.preferences[i];
      if (pref.session == session_id) {
        relevant_prefs.push(pref);
      }
    }

    //sort preferences by increasing round
    relevant_prefs.sort((a, b) => (a.round > b.round) ? 1 : -1)

    var data = [];

    for (var i = 0; i < relevant_prefs.length; i++) {
      var obj = {};
      var members = [];
      var pids = [];
      var rankings = [];
      const pref = relevant_prefs[i];

      if(pref.noSubmit)
        obj.noSubmit = true;

      obj.team = Teams.findOne(pref.team);
      

      //get rankings/names of each teammate for this round
      for (var j = 0; j < pref.values.length; j++) {
        const teammate_pid = pref.values[j].pid;
        pids.push(teammate_pid);

        const teammate = Users.findOne({ pid: teammate_pid });

        members.push(teammate.name);
        rankings.push(pref.values[j].value);
      }

      obj.members = members;
      obj.rankings = rankings;
      obj.round = pref.round;
      obj.pids = pids;

      // get the top questions for this round
      if (!session.instructor || session.instructor === "default") {
        questions = Questions.find({ round: pref.round, onwer: "none" }).fetch();
      } else {
        questions = Questions.find({ round: pref.round, owner: session.instructor }).fetch();
      }

      var questionTimes = [];

      for(var k = 0; k < questions.length; k++){
        var question = questions[k];
        var qdata = {};
        var viewTimers = question.teamViewTimer;

        for(var j = 0; j < viewTimers.length; j++){
          var entry = viewTimers[j];
          if(entry.id == pref.team){
            qdata["time"] = entry.time;
            qdata["question"] = question;
            break;
          }
        }
        if(qdata.time && qdata.question)
          questionTimes.push(qdata);
      }
      obj.questions = questionTimes;
      data.push(obj);
    }

    return data;
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

  /* Sessions Collection Methods */

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
          sentEmails: false,
          sendEmailsTo: [],
          emailAddress: ""
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
  },

  // Server: Define a method that the client can call.
  'sessions.sendEmails': async function(session_id) {

    // get the session and the participants who saved their emails
    const session = await Sessions.findOne(session_id);
    const { doneParticipants } = session;

    // async to make sure the email is populated
    const emailMap = await produceEmailMastersheet(session_id, doneParticipants); 
    console.log(emailMap);

    // now, for send an email with the information from each of the participants
    for (var pid of Object.keys(emailMap)) {
      let recipientEmail = emailMap[pid].email;
      let recipientName = emailMap[pid].name;
      let emailBody = buildEmailPrompt(recipientName, emailMap[pid].prospectives);
      let header = emailHeader;
      let sender = emailSender;
      console.log("to: " + recipientEmail + "\nfrom: " + sender + "\ntext: " + emailBody + "\nsubject: " + header);

      //Email.send({to: 'samuelblake97@gmail.com', from: sender, text: emailBody, subject: header})
    }

    // Make sure that all arguments are strings.
    // check([to, from, subject, text], [String]);

    // // Let other method calls from the same client start running, without
    // // waiting for the email sending to complete.
    // this.unblock();

    // Email.send({ to, from, subject, text });
    // Server: Define a method that the client can call.
    // Meteor.methods({
    //   sendEmail(to, from, subject, text) {
    //     // Make sure that all arguments are strings.
    //     check([to, from, subject, text], [String]);

    //     // Let other method calls from the same client start running, without
    //     // waiting for the email sending to complete.
    //     this.unblock();

    //     Email.send({ to, from, subject, text });
    //   }
    // });

    // // Client: Asynchronously send an email.
    // Meteor.call(
    //   'sendEmail',
    //   'Alice <alice@example.com>',
    //   'bob@example.com',
    //   'Hello from Meteor!',
    //   'This is a test of Email.send.'
    // );
 },

  /* Activities Collection Methods */

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

  /* Questions Collection Methods */

  // write to the database for tracking question time (OLD VERSION)
  'questions.updateTimers': function(past_question, next_question, startTime, endTime, team_id) {
    console.log("update timers called with params", past_question, next_question, startTime, endTime, team_id);
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


    const question = Questions.findOne(past_question);

    //if teamViewTimer field not present
    if(!question.teamViewTimer){
      Questions.update(
        past_question,
        {
          $set: {
            teamViewTimer: []
          }
        }
      );

      Questions.update(past_question, {
        $push: {
          teamViewTimer: {
            "id": team_id,
            "time": endTime-startTime
          }
        }
      });
    }
    else{
      const timers = question.teamViewTimer;

      var index = -1;
      for(var i = 0; i < timers.length; i++){
          if(timers[i].id == team_id){
            index = i;
            break;
          }
      }

      // If team has already viewed this question
      if(index >= 0){
        Questions.update(
          { _id: past_question, "teamViewTimer.id": team_id },
          { $inc: { "teamViewTimer.$.time" : endTime-startTime } }
        );
      }
      else{
        Questions.update(past_question, {
          $push: {
            teamViewTimer: {
              "id": team_id,
              "time": endTime-startTime
            }
          }
        });
      }
    }

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

  /* Teams Collection Methods */

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

});