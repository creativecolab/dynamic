import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Mobile from '../Layouts/Mobile/Mobile';

import TextInput from '../Components/TextInput/TextInput';

import './EmailConfirmation.scss';

export default class EmailConfirmation extends Component {

  static propTypes = {
    onSubmit: PropTypes.func.isRequired,
    preferences: PropTypes.array
  };


  constructor(props) {
    super(props);

    this.state = {
      userEmail: "",
      invalidEmail: false
    }
  }

  updateEmail = (email) => {
    this.setState({
      userEmail: email
    });

    // TODO: update email in db
  }


  render() {
    return (
      <div id="center-container">
        <div id="instructions">
          <h2>You are about to send an email inviting {"Person"} to connect.</h2>
        </div>
        <h2>[insert graphic here]</h2>
        <TextInput
          name="email"
          onSubmit={this.props.onSubmit}
          onChange={this.updateEmail}
          value={this.state.userEmail}
          invalid={this.state.invalidEmail}
          invalidMsg="Please enter an email address with extension @ucsd.edu"
          label="Enter your email address:"
          labelPos="left"
          placeholder="abcde@ucsd.edu"
        />
      </div>
    );
  }
}
