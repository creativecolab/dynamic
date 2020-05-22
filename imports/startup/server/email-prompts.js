export function buildEmailPrompt(name, whosInterested) {

  var intro = "Hey " + name + "!\n\n";
  var body = "We hoped you enjoyed using ProtoTeams! The following people have invited to connect with you via email:\n\n";
  var peopleTable = "";
  for(let i = 0; i < whosInterested.length; i++) {
    peopleTable += whosInterested[i].name + ": " + whosInterested[i].email + "\n";
  }
  var conclusion = "\nFeel free to reach out to them if you are interested.\n\n";
  var signature = "-ProtoTeams\n\n";
  var disclaimer = "THIS IS AN AUTOMATED MESSAGE. PROTOTEAMS IS NOT RESPONSIBLE FOR THE NAMES AND EMAILS CHOSEN BY USERS."

  return intro + body + peopleTable + conclusion + signature + disclaimer;
}

export const emailHeader = "Participants from ProtoTeams want to connect with you!";
export const emailSender = "EmailTest@ProtoTeams.com";