import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TeamBox from '../TeamBox/TeamBox';

export default class Icebreaker extends Component {
  static propTypes = {
    username: PropTypes.string.isRequired,
    team: PropTypes.array.isRequired,
    endActivity: PropTypes.func.isRequired
  }

  render() {
    return (
      <TeamBox team={this.props.team}/>
    )
  }
}
