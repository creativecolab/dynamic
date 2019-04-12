import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../../api/teams';
import Responses from '../../../../api/responses';
import Users from '../../../../api/users';
import Logs from '../../../../api/logs';

import './ResponsesVote.scss';
import '../../../assets/_main.scss';
import ChooseTeammate from './Components/ChooseTeammate';

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
      voted: false,
      chosen: -1,
      time_left: 5,
      revealed: false,
      correct: false
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
        // give user some points
        const { pid, session_id } = this.props;
        const user = Users.findOne({pid: pid});
        console.log(user);
        var new_points = 0;
        var points_index = 0;
        user.points_history.map((sess_point, index)  => {
          if (this.props.session_id === sess_point.session) {
            new_points = sess_point.points;
            points_index = index;
          }
        });
        new_points = new_points + 1;
        console.log("New points will be" + new_points);
        // call server method
        Meteor.call('users.addPoints', {
          user_id: user._id,
          session_id: session_id,
          points: new_points
        }, (err, res) => {
          if (err) {
            alert(err);
          } else {
            // success!
            console.log('Points added!');
          }
        });
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

      console.log("index receiving votes is " + index);
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
          chosen: votedIndex,
          correct: lie // for points
        });
      });
    } else {
      console.log('You already voted!');
    }
      
  }

  // handler for the reveal button. Allows the clients to see which options are truths and which is the lie
  handleReveal() {
    this.setState({
      revealed: true,
      voted: false,
      chosen: -1,
    });
  }

  // handler for the next button. Updates who's in the hotseat
  handleNext() {
    console.log('Calling next!');
    const { responses, hotseat_index } = this.props;
    Responses.update(responses[hotseat_index]._id, {
      $set: {
        hotseat: true,
      }
    }, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log('Hotseat set!');
        this.setState({
          voted: false,
          chosen: -1,
          time_left: 5,
          revealed: false,
          correct: false
        });
      }
    });
  }

  // returns black if not voted yet, green for the lie once voted, red for the incorrectly chosen truth
  getStyle(lie, index) {

    // if everyone has voted, do a full reveal. Red for Truths, Green for Lie
    if (this.state.revealed) {
        if (lie) return {backgroundColor: '#00DD90'};
        else return {backgroundColor: '#FF6347'};
    }

    if (this.state.chosen === index) return {backgroundColor: '#FBF2C0'};
    
    return {}
  }

  // returns the name of the user in the hotseat
  getHotseatName() {
    return Users.findOne({pid: this.props.team.members[this.props.hotseat_index].pid}).name;
  }

  // checks if the current user is in the hotseat
  match() {
    return this.props.pid === this.props.team.members[this.props.hotseat_index].pid
  }

  // helper to show the people who have voted
  getVotesString(pids) {
    return pids.map(pid => Users.findOne({pid}).name).join(', ');
  }

  // display the number of points someone has
  renderPoints() {
    const curr_user = Users.findOne({pid: this.props.pid});
    const curr_points_history = curr_user.points_history;
    var points = 0;
    curr_points_history.map(curr_point => {
      if (curr_point.session === this.props.session_id) {
        points = curr_point.points;
      }
    });
    if (this.state.correct) {
      if (points !== 1) return <div><h2>You guessed right! You earned 1 point.<br/>Now you have {points} points!</h2></div>;
      else return <div><h2>You guessed right! You earned 1 point.<br/>Now you have {points} point!</h2></div>;
    } else {
      if (points !== 1) return <div><h2>You guessed wrong!<br/>You still have {points} points.</h2></div>;
      else return <div><h2>You guessed wrong!<br/>You still have {points} point.</h2></div>;
    }
  }

  // depending on who is in the hotseat, render either votable responses or trackable responses
  // also keep track of how many people have voted for this user. i.e., keep rendering if not everyone has voted, 
  // and if everyone has, wait a bit before changing the hotseat
  renderTeammatesResponses() {
    const response = this.props.responses[this.props.hotseat_index];
    if (!response) return <div>No response recorded!</div>;
    const { options, shuffled_options } = response;
    if (!options) return <div>{this.getHotseatName()} did not submit a complete response.</div>;

    // not in hotseat
    if (!this.match()) {
      return (<div>
          {this.props.valid_ops === 0 && <div>No response recorded.</div>}
          {this.props.valid_ops > 0 && !this.state.voted && !this.state.revealed && <div><h2>Which one is the lie?</h2></div>}
          {this.props.valid_ops > 0 && this.state.voted && !this.props.all_voted && <div><h2>Waiting for other guesses...</h2></div>}
          {this.props.valid_ops > 0 && this.state.voted && this.props.all_voted && <div><h2>All Votes in. Click to Reveal!</h2></div>}
          {this.state.revealed && this.renderPoints()}
          {
            shuffled_options.map((opt, index) => {
              if (!opt.text) return;
              if (this.state.revealed) {
                return (<div className="text-box" style={this.getStyle(opt.lie, index)} key={index}>
                  {opt.text}
                </div>);
              }
              return (<button className="big-button" style={this.getStyle(opt.lie, index)} key={index} onClick={(evt) => this.handleVote(evt, opt.lie, opt.text, index)}>
                {opt.text}
              </button>);
            })
          }
        </div>);
    }
    
    // in the hotseat!
    else {
      return (<div>
        {!this.props.all_voted && <div>Waiting for other guesses...</div>}
        {this.props.all_voted && <div>Everyone has guessed!</div>}
        {options.map((opt, index) => {
          if (!opt.text) return;
          return (<div className="text-box" key={index}>{opt.text}{' '}
          {opt.votes.length > 0 && <div className="votes-box">{opt.votes.length > 0? this.getVotesString(opt.votes) : ''}</div>}
        </div>);
        })}
      </div>)
    }
    
  }

  // new hotseat, reset state
  componentDidUpdate(prevProps) {
    if (prevProps.hotseat_index !== this.props.hotseat_index) {
      this.setState({
        chosen: -1,
        revealed: false,
        correct: false,
        voted: false
      });
    }
  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearTimeout(this.timerID2);
  }

  render() {
    // if (this.props.done) return "Yay!!";
    if (!this.props.team) return "Loading...";
    if (!this.props.responses) return "No responses recorded.";

    // get hotseat from props
    const { hotseat_index } = this.props;
    if (hotseat_index === -1) return <ChooseTeammate team_id={this.props.team._id} pid={this.props.pid} />;

    const amHotseat = this.props.pid === this.props.team.members[this.props.hotseat_index].pid;
    const { correct } = this.state;

    return (
      <div>
        <div><h3>{this.getHotseatName()}</h3><h4>is in the hotseat</h4></div>
        {this.renderTeammatesResponses()}
        {!amHotseat && this.props.all_voted && !this.state.revealed && <button className="small-button-padding" onClick={() => this.handleReveal()}>Reveal Answers</button>}
        {this.state.revealed && <button className="small-button-padding" onClick={() => this.handleNext()}>Next Hotseat</button>}
        {!this.state.revealed && this.props.valid_ops === 0 && <button className="small-button-padding" onClick={() => this.handleNext()}>Next Hotseat</button>}
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

    // person hasn't been in hotseat yet
    if (!responses[i].hotseat) {
      hotseat_index = i;
      break;
    }

    // no response recorded
    var empty = true;
    responses[i].options.map((curr_option, curr_index) => {
      if (curr_option.text !== "") {
        console.log("Non-empty response");
        empty = false; 
      }
    });

    if (empty) {
      console.log("NO Response Options!");
      console.log("this person won't be hotseat anymore");
      console.log(responses[i]);
      continue;
    }

    // person has been in the hotseat, but not everyone has voted
    if (responses[i].num_voted < responses.length - 1) {
      hotseat_index = i;
      // here is issue. num_voted not increased
      console.log("Hotseat index remaining the same: " + hotseat_index);
      break;
    }

  }

  // return all_voted as props too (will always be up-to-date)
  let all_voted = false;
  try {
    all_voted = responses[hotseat_index].num_voted === responses.length - 1;
  } catch (error) {
    console.log('Nope.');
    console.log('Hotseat index is ' + hotseat_index);
  }

  let valid_ops = 0;
  try {
    valid_ops = responses[hotseat_index].options.filter(opt => opt.text != "").length;
  } catch (error) {
    console.log('Nope.');
    console.log('Hotseat index is ' + hotseat_index);
  }

  console.log("New responses, all_voted, and valid_ops props are as follows: ");
  console.log(responses[hotseat_index]);
  console.log(all_voted);
  console.log(valid_ops);
  return {team, responses, hotseat_index, all_voted, valid_ops};

})(ResponsesVote);
