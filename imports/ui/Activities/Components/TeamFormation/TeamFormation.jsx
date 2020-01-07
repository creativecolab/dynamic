import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import Button from '../../../Components/Button/Button';
import Loading from '../../../Components/Loading/Loading';
import './TeamFormation.scss';
import PictureContent from '../../../Components/PictureContent/PictureContent';
import TextInput from '../../../Components/TextInput/TextInput';
import { Textfit } from 'react-textfit';
import QuestionCarousel from '../QuestionCarousel/QuestionCarousel';

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
      ready: false
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
    const { _id, members } = this.props;

    console.log('submitted sum' + sum);

    if (sum == members.map(m => m.fruitNumber).reduce((res, m) => res + m)) {
      Teams.update(_id, {
        $set: {
          confirmed: true
        }
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

  render() {
    const { pid, confirmed, _id, members, shape, color, currentQuestions, questions } = this.props;

    const { sum, invalid } = this.state;

    if (!_id) {
      return <Loading />;
    }

    const myNum = members.filter(m => m.pid === pid)[0].fruitNumber;

    // if team is confirmed
    if (confirmed) {
      return (
        <QuestionCarousel
          pid={pid}
          _id={_id}
          questions={questions}
          currentQuestions={currentQuestions}
          title={"Looks like everyone in your group has found each other! Choose questions to discuss as a group"}
        />
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
