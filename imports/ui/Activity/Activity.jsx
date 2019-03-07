import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';
import Wrapper from '..//Wrapper/Wrapper'
import TeamBox from "./Components/TeamBox/TeamBox";

class Activity extends Component {
  static propTypes = {
    session_code: PropTypes.string.isRequired,
    username:  PropTypes.string.isRequired,
  }

  // if necessary for the activity...
  // TODO: before this, pop an activity from the session!
  formTeams() {

    const { participants } = this.props.session;
    let teams = [];

    // form teams, teams of 3
    let newTeam = [participants[0]];
    for (let i = 1; i < participants.length; i++) {
      if (i % 3 == 0) {
        teams.push(newTeam);
        newTeam = [participants[i]];
      } else {
        newTeam.push(participants[i]);
      }
    }

    // last team
    if (newTeam.length < 3) {
      teams.push(newTeam);
    }

    console.log(teams);

    //TODO: fix this!!
    return teams.filter(team => team.includes(this.props.username));

  }

  renderTeammates() {
    // TODO: get first activity from props
    const team = this.formTeams();
    return <TeamBox team={team} />
  }

  render() {
    return (
      <Wrapper>
        Find your teammates, {this.props.username}:
        {this.renderTeammates()}
      </Wrapper>
    )
  }
}

export default withTracker((props) => {
  const { session_code } = props;
  const session = Sessions.findOne({code: session_code});
  return {session};
})(Activity);