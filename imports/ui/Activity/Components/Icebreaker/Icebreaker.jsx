import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TeamBox from '../TeamBox/TeamBox';

export default class Icebreaker extends Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    team: PropTypes.objectOf({
      confirmed: PropTypes.bool.isRequired,
      members: PropTypes.array.isRequired
    }).isRequired,
    endActivity: PropTypes.func.isRequired
  }

  render() {
    return (
      <TeamBox team={this.props.team}/>
    )
  }
}
