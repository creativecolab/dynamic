import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputButtons from '../../../Components/InputButtons/InputButtons';

export default class IndividualQuestions extends Component {
  static propTypes = {
    // prop: PropTypes
  };

  state = {
    mc: null,
    free: ''
  };

  handleMC = selected => {
    this.setState({
      mc: selected
    });
  };

  render() {
    const { prompt, options } = this.props;
    const { mc } = this.state;

    return <InputButtons prompt={prompt} handleSelection={this.handleMC} list selected={mc} options={options} />;
  }
}
