/**
 * File contains methods and constants that pertain to the email functionalities.
 */ 
import { Meteor } from 'meteor/meteor';
import { Email } from 'meteor/email';

import Sessions from '../../api/sessions';
import Users from '../../api/users';

/* constants */
export const emailHeader = "Your Peers from ProtoTeams want to connect with you!";
export const emailSender = "ProtoTeams@ProtoTeams.com";

/* Retrieves Mailgun account information from private assets */
export function getEmailCredentials() {
  const emailCreds = JSON.parse(Assets.getText('mailKeys/mail-creds.json'));
  return (
    emailCreds.mailgun_server + "://" + 
    emailCreds.mailgun_username +  ":" + 
    emailCreds.mailgun_password + "@" + 
    emailCreds.mailgun_hostname + ":" + emailCreds.mailgun_port + "/"
  );
}

/* Constructs the email message to be sent out at the end of a session. */
export function buildEmailPrompt(name, whosInterested) {

  var intro = "Hey " + name + "!\n\n";
  var body = "We hoped you enjoyed using ProtoTeams! The following people have invited to connect with you via email:\n\n";
  var peopleTable = "";
  for(let i = 0; i < whosInterested.length; i++) {
    peopleTable += whosInterested[i].name + ": " + whosInterested[i].email + "\n";
  }
  var conclusion = "\nFeel free to reach out to them if you are interested.\n\n";
  var signature = "-ProtoTeams\n\n";
  var disclaimer = "THIS IS AN AUTOMATED MESSAGE. PROTOTEAMS IS NOT RESPONSIBLE FOR THE NAMES AND EMAILS SUBMITTED BY USERS."

  return intro + body + peopleTable + conclusion + signature + disclaimer;
}

/* builds a complex object that can be used to determine who should be emailed. Async to make sure everything exists when called upon. */
export async function produceEmailMastersheet(session_id, doneParticipants) {

  // build up the pid map
  let pidMap = {};
  for (let i = 0; i < doneParticipants.length; i++) {
    let currPid = doneParticipants[i];

    // get this user from the db
    let user = await Users.findOne(
      {
        pid: currPid,
        sessionHistory: {
          $elemMatch: {
            session_id: session_id
          }
        }
      });

    // get the user's email and their preferences
    let currUserObj = {
      'name': user.name,
    }
    for (let j = 0; j < user.sessionHistory.length; j++) {
      if (user.sessionHistory[j].session_id === session_id) {
        currUserObj['email'] = user.sessionHistory[j].emailAddress;
        currUserObj['interestedIn'] = user.sessionHistory[j].sendEmailsTo;
        currUserObj['prospectives'] = [];
        break;
      }
    }

    // save this user's information in the master map
    pidMap[currPid] = currUserObj;
    
  }
  // console.log(pidMap);

  // iterate over the pid keys and add a prospectives field for the corresponding pids
  for (var pid of Object.keys(pidMap)) {
    for (let i = 0; i < pidMap[pid].interestedIn.length; i++) {
      let recipientPID = pidMap[pid].interestedIn[i];
      let prospectiveObj = { 'name': pidMap[pid].name, 'email': pidMap[pid].email };

      // add these details to the recipient's prospective connection array, they saved their email
      if (recipientPID in pidMap)
        pidMap[recipientPID].prospectives.push(prospectiveObj);

    }
  }
  // console.log(pidMap);

  // send this email map back
  return pidMap;

}

/* sends emails to participants from a completed session*/
export async function sendEmails(session_id) {

  // get the session and the participants who saved their emails
  const session = await Sessions.findOne(session_id);
  const { doneParticipants } = session;

  // async to make sure the email is populated
  const emailMap = await produceEmailMastersheet(session_id, doneParticipants); 
  //console.log(emailMap);

  // now, send an email with the information from each of the participants
  for (var pid of Object.keys(emailMap)) {
    let recipientEmail = emailMap[pid].email;
    let recipientName = emailMap[pid].name;
    let emailBody = buildEmailPrompt(recipientName, emailMap[pid].prospectives);
    let header = emailHeader;
    let sender = emailSender;
    //console.log("to: " + recipientEmail + "\nfrom: " + sender + "\ntext: " + emailBody + "\nsubject: " + header)

    try {
      console.log("Sending Email to [" + recipientEmail + ":" + pid + "]...");
      Email.send({to: recipientEmail, from: sender, text: emailBody, subject: header});
    }
    catch (failedEmail) {
      console.log("\nFailed to send an email to " + recipientEmail);
      console.log("This was likely due to an invalid email being entered.");
      console.log(failedEmail);
    }
  }
}