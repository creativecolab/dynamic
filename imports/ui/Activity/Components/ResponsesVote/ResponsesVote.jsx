import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Clock from '../../../Clock/Clock';

import Teams from '../../../../api/teams';
import Activities from '../../../../api/activities';
import Responses from '../../../../api/responses';
import Users from '../../../../api/users';

import './ResponsesVote.scss';

class ResponsesVote extends Component {
  static propTypes = {
    team_id: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired,
    pid: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    // TODO: Make options a state
    // If hotseat index, then options are not shuffled
    // If not hotseat index, then options are shuffled
    // save options as state (deep copy), just pull those for component layout
    // only update db in handleVote, make sure it stays in order
    this.state = {
      hotseat_index: 0,
      voted: false,
      shuffled: false,
      chosen: -1,
      all_voted: false,
      time_left: 5,
    };
  }

  // helper function to shuffle array
  // reference: https://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array
  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    // this.setState({
    //   shuffled: true,
    // });
    console.log("Shuffling");
    return a;
  }

  handleVote(evt, lie, text) {

    if (this.props.pid === this.props.team.members[this.state.hotseat_index].pid) {
      console.log('You can\'t vote on your own!');
      return;
    }

    // get the options of the hotseat 
    const response = this.props.responses[this.state.hotseat_index];
    const options = response.options;

    // see if they've been voted on
    const voted = options.filter(opt => opt.votes.includes(this.props.pid)).length > 0;

    if (!voted) {

      // change color!
      if (lie) {
        console.log('yaya!! You guessed right!');
        //evt.target.style.color = 'green';
      } else {
        console.log('noooo!! You guessed wrong! :(');
        //evt.target.style.color = 'red';
      }
      
      let index = -1;
      options.map((curr_option, curr_index) => {
        console.log("Response text: " + curr_option.text);
        if (curr_option.text === text) {
          console.log("Response text match!");
          index = curr_index; 
        }
      });
      console.log("index is " + index);
      options[index].votes.push(this.props.pid);
      options[index].count += 1; 

      // save this response 
      // TODO track the amount of time it took
      Responses.update(response._id, {
        $set: {
          options,
          num_voted: response.num_voted + 1
        }
      }, () => {
        console.log('Vote submitted!');
        this.setState({
          voted: true,
          shuffled: true,
          chosen: index
        });
      });
    } else {
      console.log('You already voted!');
    }
      
  }

  // set voted when props available
  componentDidUpdate(prevProps, prevState) {
    if (prevState.hotseat_index !== this.state.hotseat_index) {
      const response = this.props.responses[this.state.hotseat_index];
      const options = response.options;
      if (!options) return;
      const voted = options.filter(opt => opt.votes.includes(this.props.pid)).length > 0;
      this.setState({
        voted
      });
    }

  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearTimeout(this.timerID2);
  }

  // returns black if not voted yet, green for the lie once voted, red for the incorrectly chosen truth
  getStyle(lie, index) {
    if (this.state.voted) {
      // if everyone has voted, do a full reveal. Red for Truths, Green for Lie
      if (this.state.all_voted) {
          if (lie) return {backgroundColor: '#00DD90'};
          else return {backgroundColor: '#FF6347'};
      }
      //if (lie) return {backgroundColor: '#00DD90'};
      if (this.state.chosen === index) return {backgroundColor: '#dddf38'};
      else return {color: 'black'};
    }
    return {}
  }

  // depending on who is in the hotseat, render either votable responses or trackable responses
  // also keep track of how many people have voted for this user. i.e., keep rendering if not everyone has voted, 
  // and if everyone has, wait a bit before changing the hotseat
  renderTeammatesResponses() {

    const response = this.props.responses[this.state.hotseat_index];
    if (!response) return <div>No response recorded!</div>;
    // Deep copy the options to not affect the db yet
    var options = JSON.parse(JSON.stringify(response.options));
    if (!options) return <div>{this.getHotseatName()} did not submit a complete response.</div>;

    console.log(options)

    if (!this.match()) {
      return (<div>
          <div>
          <big>{this.getHotseatName()}</big>
          <h5>is in the hotseat</h5>
          </div>
          {!this.state.voted && <div id="padding_down">Which one is the lie?</div>}
          {this.state.voted && !this.allVoted() && <div id="padding_down">Waiting for other guesses</div>}
          {this.state.voted && this.allVoted() && <div id="padding_down">All Votes in. Revealing in {this.state.time_left}</div>}
          { // shuffle if we haven't and we're not the hotseat client
            !this.state.shuffled &&
            this.shuffle(options).map((opt, index) => {
              if (!opt.text) return;
              // this is confusing, sorry!
              return (<button className="button2" style={this.getStyle(opt.lie, index)} key={index+this.props.pid} onClick={(evt) => this.handleVote(evt, opt.lie, opt.text)}>
                {this.state.voted? opt.lie? "LIE:  " + opt.text : "TRUTH:  " + opt.text : opt.text }
              </button>);
            })
          }
          { // don't shuffle if we already have
            this.state.shuffled &&
            options.map((opt, index) => {
              if (!opt.text) return;
              // this is confusing, sorry!
              return (<button className="button2" style={this.getStyle(opt.lie, index)} key={index+this.props.pid} onClick={(evt) => this.handleVote(evt, opt.lie, index)}>
                {this.state.all_voted? opt.lie? "LIE:  " + opt.text : "TRUTH:  " + opt.text : opt.text }
              </button>);
            })
          }
        </div>);
    } else {
      return (<div>
        <big>{this.getHotseatName()}</big>
        <h5>is in the hotseat</h5>
        {!this.allVoted() && <div id="padding_down">Waiting for other guesses</div>}
        {this.allVoted() && <div id="padding_down">Everyone has guessed</div>}
        {options.map((opt, index) => {
          if (!opt.text) return;
          return (<button className="button" key={index}>{opt.text}{''}{' '}
          <span className="votes">{opt.votes.length > 0? '+' + opt.votes.length : ''}</span>
        </button>);
        })}
      </div>)
    }
    
  }

  // handler for the next button. Updates who's in the hotseat
  handleNext() {
    this.setState({
      hotseat_index: (this.state.hotseat_index + 1) % this.props.team.members.length,
      shuffled: false,
      chosen: -1,
      time_left: 5,
      all_voted: false,
    });
  }

  // checks if the current user is in the hotseat
  match() {
    return this.props.pid === this.props.team.members[this.state.hotseat_index].pid
  }

  // used to check if everyone has voted. Will start a countdown once everyone has voted
  allVoted() {
    if (this.state.all_voted) return true;
    console.log("Checking if everyone has voted...");
    if (this.props.responses[this.state.hotseat_index].num_voted === this.props.team.members.length - 1) {
      console.log("Everyone has voted!!");
      this.beginReveal();
      return true;
    }
    return false;  
  }

  // starts a countdown from 5 to reveal the results
  beginReveal() {
    if (this.state.all_voted) return;
    this.timerID1 = setInterval(() => {
      if (this.state.time_left <= 0) return;
      this.setState({
        time_left: this.state.time_left - 1
      });
    }, 1000);
    this.timerID2 = setTimeout(() => {
      clearInterval(this.timerID1);
      this.timerID1 = 0;
      this.setState({
        all_voted: true,
        time_left: 5
      })
    }, 
    5000);
  }

  getHotseatName() {
    return Users.findOne({pid: this.props.team.members[this.state.hotseat_index].pid}).name;
  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.team) return "Loading...";
    if (!this.props.responses) return "No response recorded.";

    const { hotseat_index } = this.state;
    return (
      <div>
        {/* <Clock end_time={(new Date().getTime() + 120*1000)} /> */}
        <h3 id="navbar">Icebreaker</h3>
        <div>
          {hotseat_index < this.props.responses.length - 1 && 
          <button id="next_but" onClick={() => this.handleNext()}>Next</button>}
        </div>
        {this.renderTeammatesResponses()}
      </div>
    )
  }
}

export default withTracker(props => {

  // get team object
  const team = Teams.findOne(props.team_id);

  // get all responses from the team
  const responses = team.members.map(m => Responses.findOne({pid: m.pid, session_id: props.session_id}, {sort: {timestamp: -1}}) || []);

  return {team, responses};

})(ResponsesVote);
