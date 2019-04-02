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

  constructor(props) {
    super(props);

    this.state = {
      hotseat_index: 0,
    };
  }

  // helper function to shuffle array
  // reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // retrieveOptions(hotseat) {

  //   // get this person responses and shuffle into options
  //   // let responses = Responses.findOne({pid: hotseat,session_id: this.props.session_id, activity_id: this.props.activity_id},
  //   //                                   {sort: {timestamp: -1}});
  //   let response = 
  //   console.log(response);

  //   if (!response) {
  //     // console.log(hotseat + ' did not submit a response!');
  //     return [];
  //   }

  //   // let options = shuffle([{text: responses.truth1, lie: false}, {text: responses.truth2, lie: false}, {text: responses.lie, lie: true}]);

  //   // options = options.map(o => (o.text === '')? {text: 'NO RESPONSE', lie: o.lie} : {text: o.text, lie: o.lie});
  //   // console.log(options);

  //   return response.options;
  // }

  handleVote(evt, lie, index) {

    if (this.props.pid === this.props.team.members[this.state.hotseat_index].pid) {
      console.log('You can\'t vote on your own!');
      return;
    }

    // // get all responses
    // const responses = Teams.findOne({_id: this.props.team_id}).responses;
    // console.log(responses);
    const response = this.props.responses[this.state.hotseat_index];
    const options = response.options;

    const voted = options.filter(opt => opt.votes.includes(this.props.pid)).length > 0;

    if (!voted) {

      // change color!
      if (lie) {
        console.log('yaya!! You guessed right!');
        evt.target.style.color = 'green';
      } else {
        console.log('noooo!! You guessed wrong! :(');
        evt.target.style.color = 'red';
      }

      options[index].votes.push(this.props.pid);

      // save this response 
      // TODO track the amount of time it took
      Responses.update(response._id, {
        $set: {
          options,
        }
      }, () => {
        console.log('Vote submitted!');
      });

      // update the number of people voted 
      // this.setState({
      //   numVoted: this.state.numVoted + 1
      // });

      // get responses from database rather than state
      // filter by hotseat
      // const numVoted = this.props.team.responses.filter(resp => resp.hotseat === this.state.hotseat).length;

      // // see if we should move on
      // console.log(numVoted + ' people voted!!!');
      // if (numVoted + 1 === this.props.team.members.length - 1) {
      //   // everyone who could vote has voted, set a timer then move on to next person
      //   console.log("Wait 10 seconds.");
      //   // TODO change this from hardcoding??
      //   this.timer = setTimeout(this.getNextHotseat(), 10 * 1000);
      // }

    } else {
      console.log('You already voted!');
    }
      
  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  // choose the next hotseat
  getNextHotseat() {
    if (this.state.hotseatCount === this.props.team.members.length) {
      // everyone has been in the hotseat, we're done
    } else {
      //get the next team member up for being in the hotseat and their options
      const next_hotseat = this.props.team.members[this.state.hotseatCount].pid;
      const next_options = this.retrieveOptions(next_hotseat);

      //update the states
      this.setState({
        hotseat: next_hotseat,
        options: next_options,
        hotseatCount: this.state.hotseatCount + 1,
        numVoted: 0
      });
    }
  }

  // depending on who is in the hotseat, render either votable responses or trackable responses
  // also keep track of how many people have voted for this user. i.e., keep rendering if not everyone has voted, 
  // and if everyone has, wait a bit before changing the hotseat
  renderTeammatesResponses() {
    const response = this.props.responses[this.state.hotseat_index];
    const options = response.options;

    if (!options) return <div>No response recorded!</div>;
    if (!this.match()) {
      return <div>{this.shuffle(options.map((opt, index) => {
        return <button className="button" key={index} onClick={(evt) => this.handleVote(evt, opt.lie, index)}>{opt.text}</button>;
      }))}</div>
    } else {
      // TODO: display the people who voted for an option
      return <div>{options.map((opt, index) => {
        return <button className="button" key={index}>{opt.text}<span> +{opt.votes.length}</span></button>
      })}</div>
    }
    
  }

  handleNext() {
    this.setState({
      hotseat_index: (this.state.hotseat_index + 1) % this.props.team.members.length
    });
  }

  handlePrev() {
    const hotseat_index = this.state.hotseat_index === 0? this.props.team.members.length - 1 : this.state.hotseat_index - 1;
    this.setState({
      hotseat_index
    });
  }

  match() {
    return this.props.pid === this.props.team.members[this.state.hotseat_index].pid
  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.team) return "Loading...";
    if (!this.props.responses) return "No response recorded.";
    return (
      <div>
        <div>
          <button onClick={() => this.handleNext()}>next</button>
          <button onClick={() => this.handlePrev()}>prev</button>
        </div>
        {this.match() && <div>You said...</div>}
        {!this.match() && <div>{Users.findOne({pid: this.props.team.members[this.state.hotseat_index].pid}).name} says...</div>}
        {this.renderTeammatesResponses()}
        {!this.match() && <div>Click on the option you think is a lie.</div>}
      </div>
    )
  }
}

export default withTracker(props => {

  // get team object
  const team = Teams.findOne(props.team_id);

  // get responses from all team members
  // const responses = team.members.map(m => ({pid: m.pid, response: Responses.findOne({pid: m.pid, session_id: this.props.session_id},
  //   {sort: {timestamp: -1}})}));

  const responses = team.members.map(m => Responses.findOne({pid: m.pid, session_id: props.session_id}, {sort: {timestamp: -1}}));

  // get current votes
  // const hotseatPids = team.responses.map(resp => resp.hotseat);
  // console.log('hotseat pids: ' + hotseatPids);
  // const teammatePids = team.members.map(m => m.pid).filter(pid => pid !== props.pid);
  // console.log('teammate pids: ' + teammatePids);

  /*let hotseat;
  if (teammatePids.length > 0) {
    hotseat = teammatePids[0];
  } else {
    hotseat = props.pid;
  }


  //hotseat = team.members[0].pid;

  //if (hotseatPids.includes(team.members[0].pid))


  //console.log('Currently in the hotseat: ' + hotseat);

  // iterate through teammates
  let hotseat;
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
          console.log(teammatePids[j] + 'has not voted for ' + hotseat);
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
  //return {options, hotseat};

  return {team, responses};

})(ResponsesVote);
