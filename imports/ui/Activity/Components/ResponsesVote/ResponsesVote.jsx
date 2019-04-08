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
    this.state = {
      hotseat_index: 0,
      voted: false,
      shuffled: false,
      chosen: -1
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
    console.log("The shuffled results are: " + a)
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
    clearTimeout(this.timer);
  }

  // returns black if not voted yet, green for the lie once voted, red for the incorrectly chosen truth
  getStyle(lie, index) {
    if (this.state.voted) {
      if (lie) return {backgroundColor: '#00DD90'};
      if (this.state.chosen === index) return {backgroundColor: '#FF6347'};
      else return {color: 'black'}
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
          { // shuffle if we haven't and we're not the hotseat client
            !this.state.shuffled && !this.match() &&
            this.shuffle(options).map((opt, index) => {
              if (!opt.text) return;
              // this is confusing, sorry!
              return (<button className="button2" style={this.getStyle(opt.lie, index)} key={index+this.props.pid} onClick={(evt) => this.handleVote(evt, opt.lie, opt.text)}>
                {this.state.voted? opt.lie? "LIE:  " + opt.text : "TRUTH:  " + opt.text : opt.text }
              </button>);
            })
          }
          { // don't shuffle if we already have or if it's the hotseat client
            (this.state.shuffled || this.match()) &&
            options.map((opt, index) => {
              if (!opt.text) return;
              // this is confusing, sorry!
              return (<button className="button2" style={this.getStyle(opt.lie, index)} key={index+this.props.pid} onClick={(evt) => this.handleVote(evt, opt.lie, index)}>
                {this.state.voted? opt.lie? "LIE:  " + opt.text : "TRUTH:  " + opt.text : opt.text }
              </button>);
            })
          }
        </div>);
    } else {
      return (<div>
        <big>{this.getHotseatName()}</big>
        <h5>is in the hotseat</h5>
        <div id="padding_down">Waiting for other guesses</div>
        {options.map((opt, index) => {
          if (!opt.text) return;
          return (<button className="button" key={index}>{opt.text}{''}{' '}
          <span className="votes">{opt.votes.length > 0? '+' + opt.votes.length : ''}</span>
        </button>);
        })}
      </div>)
    }
    
  }

  handleNext() {
    this.setState({
      hotseat_index: (this.state.hotseat_index + 1) % this.props.team.members.length,
      shuffled: false,
      chosen: -1
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

  getHotseatName() {
    return Users.findOne({pid: this.props.team.members[this.state.hotseat_index].pid}).name;
  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.team) return "Loading...";
    if (!this.props.responses) return "No response recorded.";
    //if (! (this.props.team.members.map(m => Responses.findOne({pid: m.pid, session_id: this.props.session_id}, {sort: {timestamp: -1}}) || [])) ) return "No response recorded.";

    const { hotseat_index } = this.state;
    return (
      <div>
        {/* <Clock end_time={(new Date().getTime() + 120*1000)} /> */}
        <h3 id="navbar">Icebreaker</h3>
        <div>
          {/* {hotseat_index > 0 && <button id="prev" onClick={() => this.handlePrev()}>prev</button>} */}
          {hotseat_index < this.props.responses.length - 1 && 
           //hotseat_index < ( this.props.team.members.map( m => Responses.findOne({pid: m.pid, session_id: this.props.session_id}, {sort: {timestamp: -1}}) ) ) .length - 1 && 
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
