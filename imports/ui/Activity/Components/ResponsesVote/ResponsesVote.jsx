import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../../api/teams';
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
      voted: false,
      all_voted: false,
      chosen: -1,
      time_left: 5,
      revealed: false
    };
  }

  handleVote(evt, lie, text, votedIndex) {

    if (this.props.pid === this.props.team.members[this.props.hotseat_index].pid) {
      console.log('You can\'t vote on your own!');
      return;
    }

    // get the options of the hotseat 
    const response = this.props.responses[this.props.hotseat_index];
    const options = response.options;

    // see if they've been voted on
    const voted = options.filter(opt => opt.votes.includes(this.props.pid)).length > 0;

    if (!voted) {

      // change color!
      if (lie) {
        console.log('yaya!! You guessed right!');
      } else {
        console.log('noooo!! You guessed wrong! :(');
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
      // TODO: track the amount of time it took
      Responses.update(response._id, {
        $set: {
          options,
          num_voted: response.num_voted + 1,
          lastVote: new Date().getTime()
        }
      }, () => {
        console.log('Vote submitted!');
        this.setState({
          voted: true,
          chosen: votedIndex
        });
      });
    } else {
      console.log('You already voted!');
    }
      
  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearTimeout(this.timerID2);
  }

  // returns black if not voted yet, green for the lie once voted, red for the incorrectly chosen truth
  getStyle(lie, index) {

    // if everyone has voted, do a full reveal. Red for Truths, Green for Lie
    if (this.state.revealed) {
        if (lie) return {backgroundColor: '#00DD90'};
        else return {backgroundColor: '#FF6347'};
    }

    if (this.state.chosen === index) return {backgroundColor: '#dddf38'};
    // else return {color: 'black'};
    
    return {}
  }

  // depending on who is in the hotseat, render either votable responses or trackable responses
  // also keep track of how many people have voted for this user. i.e., keep rendering if not everyone has voted, 
  // and if everyone has, wait a bit before changing the hotseat
  renderTeammatesResponses() {
    const response = this.props.responses[this.props.hotseat_index];
    if (!response) return <div>No response recorded!</div>;
    const { options, shuffled_options } = response;
    if (!options) return <div>{this.getHotseatName()} did not submit a complete response.</div>;

    if (!this.match()) {
      return (<div>
          <div>
          <big>{this.getHotseatName()}</big>
          <h5>is in the hotseat</h5>
          </div>
          {!this.state.voted && <div id="padding_down">Which one is the lie?</div>}
          {this.state.voted && !this.allVoted() && <div id="padding_down">Waiting for other guesses</div>}
          {this.state.voted && this.allVoted() && <div id="padding_down">All Votes in. Revealing in {this.state.time_left}</div>}
          {
            shuffled_options.map((opt, index) => {
              if (!opt.text) return;
              return (<button className="button2" style={this.getStyle(opt.lie, index)} key={index} onClick={(evt) => this.handleVote(evt, opt.lie, opt.text, index)}>
                {opt.text}
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
          return (<button className="button" key={index}>{opt.text}{' '}
          <span className="votes">{opt.votes.length > 0? '+' + opt.votes.length : ''}</span>
        </button>);
        })}
      </div>)
    }
    
  }

  handleReveal() {
    // this.beginReveal();
    this.setState({
      revealed: true,
      correct: false,
      voted: false,
      chosen: -1
    });
  }

  // handler for the next button. Updates who's in the hotseat
  handleNext() {
    const { responses, hotseat_index } = this.props;
    Responses.update(responses[hotseat_index]._id, {
      $set: {
        hotseat: true,
      }
    });

    this.setState({
      chosen: -1,
      time_left: 5,
      all_voted: false,
      revealed: false
    });
  }

  // checks if the current user is in the hotseat
  match() {
    return this.props.pid === this.props.team.members[this.props.hotseat_index].pid
  }

  // used to check if everyone has voted. Will start a countdown once everyone has voted
  allVoted() {
    if (this.props.all_voted) return true;
    console.log("Checking if everyone has voted...");
    if (this.props.responses[this.props.hotseat_index].num_voted === this.props.team.members.length - 1) {
      console.log("Everyone has voted!!");
      // this.beginReveal();
      return true;
    }
    return false;  
  }

  // starts a countdown from 5 to reveal the results
  beginReveal() {
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
        revealed: true,
        time_left: 5
      })
    }, 
    5000);
  }

  getHotseatName() {
    return Users.findOne({pid: this.props.team.members[this.props.hotseat_index].pid}).name;
  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.team) return "Loading...";
    if (!this.props.responses) return "No responses recorded.";

    // get hotseat from props
    const { hotseat_index } = this.props;
    if (hotseat_index === -1) return "Done! Wait for other teams.";

    return (
      <div>
        <h3 id="navbar">Icebreaker</h3>
        <div>
          
        {this.props.all_voted && !this.state.revealed && <button id="next_but" onClick={() => this.handleReveal()}>Reveal Answers</button>}
        {this.state.revealed && <button id="next_but" onClick={() => this.handleNext()}>Next Hotseat</button>}

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

  // hotseat index, -1 = everyone voted
  let hotseat_index = -1;
  for (var i = 0; i < responses.length; i++) {

    // no response recorded
    if (!responses[i]) continue;

    // person hasn't been in hotseat yet
    if (!responses[i].hotseat) {
      hotseat_index = i;
      break;
    }

    // person has been in the hotseat, but not everyone has voted
    else if (responses[i].num_voted < responses.length - 1) {
      hotseat_index = i;
      break;
    }

  }

  // return all_voted as props too (will always be up-to-date)
  let all_voted = false;
  try {
    all_voted = responses[hotseat_index].num_voted === responses.length - 1;
  } catch (error) {
    console.log('Nope.');
  }

  return {team, responses, hotseat_index, all_voted};

})(ResponsesVote);
