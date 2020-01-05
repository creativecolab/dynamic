import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';
import ReactSwipe from 'react-swipe';

import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import Button from '../../../Components/Button/Button';
import Loading from '../../../Components/Loading/Loading';
import './TeamFormation.scss';
import PictureContent from '../../../Components/PictureContent/PictureContent';
import TextInput from '../../../Components/TextInput/TextInput';
import { Textfit } from 'react-textfit';

class TeamFormation extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    _id: PropTypes.string.isRequired,
    members: PropTypes.array.isRequired,
    confirmed: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    // find the team and its members
    const { pid, members } = props;

    // state always starts as false
    this.state = {
      // teammates: members.filter(member => member.pid !== pid).map(member => ({ pid: member.pid, confirmed: false })),
      sum: '',
      invalidSum: false,
      ready: false,

      prevQuestionIndex: 0,
      startTime: new Date().getTime(),
    };
  }

  getNameFromPid(pid) {
    return Users.findOne({ pid }).name;
  }

  renderTeammates() {

    const { confirmed, members, pid } = this.props;

    const teammates = members.filter(member => member.pid !== pid).map(member => ({ pid: member.pid, confirmed: false }))

    return (
      <div className="member-list">
        {teammates.map(m => (
          <div key={m.pid}>
            {this.getNameFromPid(m.pid)}
            {!confirmed &&
              <div className="remove-btn">
                {/* <Button size="input-text" onClick={() => this.removeTeammate(m.pid)}>Not here?</Button> */}
              </div>}
          </div>
        ))}
      </div>
    );


  }

  removeTeammate = removee => {

    console.log("Want to remove " + removee);
    const { _id, pid, members, activity_id } = this.props;

    // can't get teams of size less than two
    if (members.length - 1 < 2) {
      console.log("Can't remove this round.");
      return;
    }

    // build the new members
    let new_members = [members.length - 1]
    for (var i = 0, j = 0; i < members.length; i++) {
      if (members[i].pid != removee) {
        new_members[j] = { pid: members[i].pid, fruitNumber: members[i].fruitNumber };
        j++;
      }
    }
    console.log(new_members);

    // remove member from the team
    Meteor.call('teams.removeMember', _id, removee, error => {
      if (error) {
        console.log(error.error)
        console.log("Can't remove from the team this round.");
        return;
      } else {
        console.log('Removed ' + removee + ' from the team successfully.');
        // remove member from the session
        Meteor.call('sessions.removeMember', activity_id, removee, error => {
          if (error) {
            console.log(error.error);
            console.log("Can't remove from the session this round.");
            return;
          } else {
            console.log('Removed ' + removee + ' from the session successfully.');
            // make the database updates visible
            console.log("Updating state");
            // TODO: delete this
            // new teammates don't include themselves and the person they removed
            // this.setState({
            //   teammates: new_members.filter(member => member.pid !== pid).map(member => ({ pid: member.pid, confirmed: false }))
            // })
          }
        });
      }
    });

  }

  handleSubmit = sum => {
    const { pid, _id, members } = this.props;

    console.log('submitted sum' + sum);

    if (sum == members.map(m => m.fruitNumber).reduce((res, m) => res + m)) {
      console.log("trying to confirm", pid, "on team", _id);
      Meteor.call('teams.confirmMember', _id, pid, error => {
        if (!error) console.log('Confirmed member successfully');
        else console.log(error);
      });
    } else {
      this.setState({
        invalid: true
      });
    }
  };

  handleSumChange = evt => {
    this.setState({ sum: evt.target.value, invalid: false });
  };

  onSlideChange = () => {
    const endTime = new Date().getTime();
    const { startTime } = this.state;

    const { questions, _id, pid } = this.props;

    const past_question = questions[this.state.prevQuestionIndex]._id;
    const next_question = questions[this.reactSwipeEl.getPos()]._id;

    //update questions
    Meteor.call('questions.updateTimers', past_question, next_question, startTime, endTime, error => {
      if (!error) console.log('Tracked questions successfully');
      else console.log(error);
    });

    // keep track of this current question and when it began
    this.setState({
      prevQuestionIndex: this.reactSwipeEl.getPos(),
      startTime: new Date().getTime()
    });

    Meteor.call('questions.setCurrent', _id, pid, this.reactSwipeEl.getPos(), error => {
      if (!error) console.log('Set current question successfully');
      else console.log(error);
    });
  };

  getCurrentQuestion() {
    const { pid, currentQuestions } = this.props;
    for (var i = 0; i < currentQuestions.length; i++) {
      if (currentQuestions[i].pid == pid) {
        return currentQuestions[i].question_ind;
      }
    }
    return 0;
  }

  render() {
    const { pid, confirmed, _id, members, shape, color, confirmedMembers } = this.props;

    const { sum, invalid } = this.state;

    if (!_id) {
      return <Loading />;
    }

    const myNum = members.filter(m => m.pid === pid)[0].fruitNumber;

    // if team is confirmed
    if (confirmed) {
      return (
        <div>
          <div className="swipe-instr-top">
            <Textfit mode="multi" max={36}>
              Looks like everyone in your group has found each other!
              Choose questions to discuss as a group
            </Textfit>
          </div>
          <div className="swipe-subinstr-top">
            <strong>Swipe</strong> to see more questions
          </div>
          <div className="slider-main">
            <ReactSwipe
              className="carousel"
              swipeOptions={{ continuous: true, callback: this.onSlideChange, startSlide: this.getCurrentQuestion() }}
              ref={el => (this.reactSwipeEl = el)}
            >
              {this.props.questions.map((q, index) => {
                return (
                  <div className="question-card-wrapper" key={q._id}>
                    <div className="question-card">
                      <div className="label" style={{ background: q.color }}>
                        {q.label}
                      </div>
                      {index + 1}. {q.prompt}
                    </div>
                  </div>
                );
              })}
            </ReactSwipe>

            <button className="prev" type="button" onClick={() => this.reactSwipeEl.prev()}>
              &larr;
            </button>
            <button className="next" type="button" onClick={() => this.reactSwipeEl.next()}>
              &rarr;
            </button>
          </div>
        </div>
      );
    }

    // if user has confirmed they found everyone, but still waiting on rest of team to confirm
    if (confirmedMembers.includes(pid)) {
      return (
        <PictureContent title="Great job finding your team!" imageSpaced imageSrc={`/shapes/${shape}-solid-${color}.jpg`}>
          {this.renderTeammates()}
          <div>
            <div className="user-number">
              You have <b>{myNum}</b> orange{myNum === 1 ? '' : 's'}.
            </div>
          </div>
          <div className="team-instruct">
            Looks like you found everyone! Wait a bit for the rest of your team to be confirmed.
          </div>
        </PictureContent>
      );
    }

    return (
      <PictureContent
        fitTitle
        title="Find others with this shape and color"
        imageSrc={`/shapes/${shape}-solid-${color}.jpg`}
      >
        {this.renderTeammates()}
        <div>
          <div className="user-number">
            You have <b>{myNum}</b> orange{myNum === 1 ? '' : 's'}.
          </div>
          <Textfit mode="single">How many oranges does your group have?</Textfit>
          <TextInput
            className="text-sum"
            name="enter-team-number"
            onSubmit={() => this.handleSubmit(sum)}
            onChange={this.handleSumChange}
            value={sum}
            invalid={invalid}
            label=""
            invalidMsg="Incorrect sum. Try again!"
            placeholder="Sum of oranges"
            hasButton
          />
        </div>
      </PictureContent>
    );
  }
}

export default TeamFormation;
