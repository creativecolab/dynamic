import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../../api/teams';
import Activities from '../../../../api/activities';
import Responses from '../../../../api/responses';
import Users from '../../../../api/users';
import { withTracker } from 'meteor/react-meteor-data';

class ResponsesVote extends Component {
  static propTypes = {
    team_id: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired,
  }

  handleVote(evt, lie) {

    if (this.props.pid === this.props.hotseat) {
      console.log('You can\'t vote on your own!');
      return;
    }

    // get all responses
    const responses = Teams.findOne({_id: this.props.team_id}).responses;
    console.log(responses);

    // get only responses by this pid to current pid being voted on
    const voted = responses.filter(vote => vote.hotseat === this.props.hotseat)
                           .filter(vote => vote.voter === this.props.pid);

    if (voted == false) {

      // change color!
      if (lie) {
        console.log('yaya!!');
        evt.target.style.color = 'green';
      } else {
        evt.target.style.color = 'red';
      }

      Teams.update(this.props.team_id, {
        $push: {
          responses: {
            hotseat: this.props.hotseat,
            voter: this.props.pid
          }
        }
      }, () => {
        console.log('Vote submitted!');
      });
    } else {
      console.log('You already voted!');
    }

    

  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.hotseat || !this.props.options) return "Loading...";
    return (
      <div>
        {(this.props.pid === this.props.hotseat) && <div>Wait for your teammates to vote.</div>}
        {(this.props.pid !== this.props.hotseat) && <div>{Users.findOne({pid: this.props.hotseat}).firstname} says...</div>}
        {this.props.options.map((opt, index) => {
          return <button className="button" key={index} onClick={(evt) => this.handleVote(evt, opt.lie)}>{opt.text}</button>;
        })}
        {(this.props.pid !== this.props.hotseat) && <div>Click on the option you think is a lie.</div>}
      </div>
    )
  }
}

export default withTracker(props => {

  // only get responses of the same type of activity
  const activity_type = Activities.findOne(props.activity_id).name;

  // get team object
  const team = Teams.findOne(props.team_id);

  // get current votes
  const hotseatPids = team.responses.map(resp => resp.hotseat);
  console.log('hotseat pids: ' + hotseatPids);
  const teammatePids = team.members.map(m => m.pid).filter(pid => pid !== props.pid);
  console.log('teammate pids: ' + teammatePids);

  let hotseat;
  if (teammatePids.length > 0) {
    hotseat = teammatePids[0];
  } else {
    hotseat = props.pid;
  }

/*
  // iterate through teammates
  let hotseat = null;
  let i = 0;
  for (i = 0; i < team.members.length; i++) {

    console.log('Checking...' + team.members[i].pid)
    
    // teammate hasn't been in hotseat...
    if (!hotseatPids.includes(team.members[i].pid)) {
      hotseat = team.members[i].pid;
      console.log(team.members[i].pid + " hasnt been in hotseat yet!");
      break;
    }

    // has been in hotseat, but has everyone voted already?
    else {

      // get current voters
      const voters = team.responses.filter(resp => resp.hotseat === team.members[i].pid).map(resp => resp.voter);
      console.log('voters: ' + voters);

      // check if every teammate has voted
      for (var j = 0; j < teammatePids.length; j++) {
        if (!voters.includes(teammatePids[j])) {
          console.log(teammatePids[j] + 'has not voted for ' + h)
          hotseat = team.members[i].pid;
          console.log("not everyone has voted for " + team.members[i].pid);
          break;
        }
      }

      // found hotseat above
      if (hotseat != null) break;
      
    }
     
  }

  if (i === team.members.length) {
    console.log('everyone voted and has been in hotseat!');
    // return {done: true}
  }

  console.log('Hotseat pid is ' + hotseat);
*/

  // helper function to shuffle array
  // reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  const shuffle = (a) => {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // get this person responses and shuffle into options
  let responses = Responses.findOne({pid: hotseat, session_id: props.session_id, activity_type}, {sort: {timestamp: -1}});
  console.log(responses);

  if (!responses) {
    // console.log(hotseat + ' did not submit a response!');
    responses = {truth1: '', truth2: '', lie: ''};
  }


  let options = shuffle([{text: responses.truth1, lie: false}, {text: responses.truth2, lie: false}, {text: responses.lie, lie: true}]);
  console.log(options);

  options = options.map(o => (o.text === '')? {text: 'NO RESPONSE', lie: o.lie} : {text: o.text, lie: o.lie});

  return {options, hotseat};

})(ResponsesVote);
