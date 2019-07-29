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

class TeamFormation extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    _id: PropTypes.string.isRequired,
    confirmed: PropTypes.bool.isRequired
  };

  constructor(props) {
    super(props);

    // find team in context
    //const team = Teams.findOne(props.team_id);
    const { pid, members } = props;

    // state always starts as false
    this.state = {
      teammates: members.filter(member => member.pid !== pid).map(member => ({ pid: member.pid, confirmed: false })),
      sum: '',
      invalidSum: false,
      ready: false
    };
  }

  getNameFromPid(pid) {
    return Users.findOne({ pid }).name;
  }

  renderTeammates() {
    if (this.props.confirmed) return 'Confirmed. Waiting for other groupmates.';

    return this.state.teammates.map(m => (
      <Button key={m.pid} active={m.confirmed} onClick={() => this.handleConfirmed(m.pid)}>
        {this.getNameFromPid(m.pid)}
      </Button>
    ));
  }

  handleSubmit = sum => {
    const { _id, members } = this.props;

    console.log('submitted sum' + sum);

    if (sum == members.map(m => m.userNumber).reduce((res, m) => res + m)) {
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
    const { pid, confirmed, _id, members, shape, color } = this.props;

    const { sum, invalid } = this.state;

    if (!_id) return <Loading />;

    //const { shape, color } = team;

    const myNum = members.filter(m => m.pid === pid)[0].userNumber;

    if (confirmed) {
      return (
        <PictureContent
          title="Introduce yourself!"
          imageSpaced
          imageSrc="/intro.jpg"
          subtitle="Looks like you found everyone. While waiting for other groups to form, introduce yourself to your teammates."
        />
      );
    }

    return (
      <PictureContent
        fitTitle
        title="Find those with this shape and color"
        imageSrc={`/shapes/${shape}-solid-${color}.jpg`}
      >
        <div className="member-list">
          {this.state.teammates.map(m => (
            <div>{this.getNameFromPid(m.pid)}</div>
          ))}
        </div>
        <div>
          <div className="user-number">
            You have <b>{myNum}</b> orange{myNum === 1 ? '' : 's'}.
          </div>
          <Textfit mode="single">How many oranges does your team have?</Textfit>
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

    // return (
    //   <PictureContent
    //     title="Find others with this shape and color"
    //     hasImage
    //     imageSrc={`/shapes/${shape}-solid-${color}.jpg`}
    //     hasSubtitle
    //     subtitle="Select members found:"
    //   >
    //     {this.renderTeammates()}
    //   </PictureContent>
    // );

    // if (allConfirmed) {
    //   return (
    //     <div className="team-formation-main">
    //       <img className="intro-img" src="/intro.jpg" alt="..." />
    //       <p>
    //         <strong>Introduce yourself!</strong>
    //       </p>
    //       <div>
    //         Looks like you found everyone. While waiting for other groups to form, introduce yourself to your teammates.
    //         </div>
    //     </div>
    //   );
    // }

    // return (
    //   <div className="team-formation-main">
    //     <div className="shape-main">
    //       <div>Find others with this shape and color</div>
    //       <img className="shape-img" src={`/shapes/${shape}-solid-${color}.jpg`} alt={`${color} ${shape}`} />
    //       {!confirmed && <div>Select members found:</div>}
    //     </div>
    //     {this.renderTeammates()}
    //   </div>
    // );
  }
}

export default TeamFormation;
