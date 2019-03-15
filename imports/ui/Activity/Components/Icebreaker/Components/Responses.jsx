import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../../../../Wrapper/Wrapper';

export default class Responses extends Component {
  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state = {
      idea: '',
    };
  }

  handleChange(evt) {
    this.setState({
      idea: evt.target.value
    });
  }

  enterIdea(evt) {
    evt.preventDefault();
  }

  render() {
    return (
      <Wrapper>
        Share with your team something about yourself that they would not be able to find online
      </Wrapper>
    )
  }
}
