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

class TeamFormation extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    team: PropTypes.object,
    team_id: PropTypes.string.isRequired,
    confirmed: PropTypes.bool.isRequired,
    allConfirmed: PropTypes.bool.isRequired,
  };

  static defaultProps = {
    team: {}
  };

  constructor(props) {
    super(props);

    // find team in context
    //const team = Teams.findOne(props.team_id);
    const { pid, members } = props;

    // state always starts as false
    this.state = {
      teammates: members
        .filter(member => member.pid !== pid)
        .map(member => ({ pid: member.pid, confirmed: false })),
      sum: '',
      invalidSum: false,
      ready: false,
      sumSubmitted: false
    };
  }

  // check if confirmed
  componentDidUpdate() {
    let confirmedAll = true;

    this.state.teammates.forEach(member => {
      if (!member.confirmed) confirmedAll = false;
    });

    if (confirmedAll) {
      // get index of this user
      let pidIndex = -1;

      this.props.members.map((m, index) => {
        if (m.pid === this.props.pid) {
          pidIndex = index;
        }
      });

      // update that index on db
      Teams.update(
        this.props._id,
        {
          $set: {
            [`members.${pidIndex}.confirmed`]: true
          }
        },
        error => {
          if (error) console.log(error);
          else console.log('All confirmed!');
        }
      );
    }
  }

  getNameFromPid(pid) {
    return Users.findOne({ pid }).name;
  }

  // sets team member's state confirmed to true
  handleConfirmed(pid) {
    //console.log(`Found ${pid}`);
    this.setState(state => {
      // look for teammate and update state
      state.teammates.forEach(member => {
        if (member.pid === pid) {
          member.confirmed = true;
        }
      });

      return state;
    });
  }

  renderTeammates() {
    if (this.props.confirmed) return 'Confirmed. Waiting for other groupmates.';

    return this.state.teammates.map(m => (
      <Button key={m.pid} active={m.confirmed} onClick={() => this.handleConfirmed(m.pid)}>
        {this.getNameFromPid(m.pid)}
      </Button>
    ));
  }

  render() {
    const { handleSum, handleSubmit, sum, invalid } = this.props;
    const { team, confirmed, allConfirmed } = this.props;

    if (!members) return <Loading />;

    //const { shape, color } = team;

    if (allConfirmed) {
      return (
        <PictureContent
          title="Introduce yourself!"
          imageSrc="/intro.jpg"
          subtitle="Looks like you found everyone. While waiting for other groups to form, introduce yourself to your teammates."
        />
      );
    }

    return (
      <PictureContent
        fitTitle
        title="Find others with this shape and color"
        imageSrc={`/shapes/${shape}-solid-${color}.jpg`}
      //lowSubtitle="How many oranges does your team have in total?"
      >
        <div>You have <b>3</b> oranges </div>
        <div className="team-instruct">How many oranges total in your team?</div>
        {/*<div className="sum-input-flex">*/}
        <TextInput className="text-sum"
          name="enter-team-number"
          onSubmit={handleSubmit}
          onChange={handleSum}
          value={sum}
          invalid={invalid}
          label=''
          invalidMsg="Incorrect sum. Try again!"
          placeholder=" # oranges"
        />
        <Button size="small">Enter</Button>
        {/*</div>*/}
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

export default withTracker(props => {
  //const team = Teams.findOne({ _id: props.team_id });
  const { members } = props
  let confirmed = false;
  let allConfirmed = false;

  try {
    confirmed = members.filter(m => m.pid === props.pid)[0].confirmed;
    allConfirmed = true;
    members.forEach(member => {
      if (!member.confirmed) allConfirmed = false;
    });
  } catch (error) {
    console.log(error);
  }

  return { confirmed, allConfirmed };
})(TeamFormation);
