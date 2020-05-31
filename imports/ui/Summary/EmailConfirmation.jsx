import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Mobile from '../Layouts/Mobile/Mobile';

import TextInput from '../Components/TextInput/TextInput';

import './EmailConfirmation.scss';
import { resetWarningCache } from 'prop-types';

export default class EmailConfirmation extends Component {

  static propTypes = {
    trackEmail: PropTypes.func.isRequired,
    onSubmit: PropTypes.func.isRequired,
    recipients: PropTypes.array.isRequired,
    invalidEmail: PropTypes.bool.isRequired,
    userEmail: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
  }

  /* Event Handlers */

  // track the user's entered email using parent prop
  updateEmail = evt => {
    this.props.trackEmail(evt.target.value);
  }

  /* Component Selection */

  // make recipient list
  makeRecipientList(recipients) {
    if (recipients === undefined || recipients.length == 0) {
      return (
        <div>
          <h3>You have decided to not invite anyone to connect.</h3>
          <h3>Please enter your email to so others can contact you to connect.</h3>
        </div>
      )
    } else {
      // format the recipient list
      let recipients_map = recipients.map((curr_rec, idx) => {
        if (idx == 0) return (<strong key={idx}>{curr_rec}</strong>);
        else if (idx > 0 && idx < recipients.length - 1) return (<strong key={idx}>, {curr_rec}</strong>);
        else {
          return (<t key={idx}><t>{recipients.length == 2 ? <strong> </strong> : <strong>, </strong>}</t>and <strong>{curr_rec}</strong></t>);
        }
      });

      return (
        <div>
          <h3>You are about to invite {recipients_map} to connect.</h3>
          <h3>Please enter your email to so others can contact you to connect.</h3>
        </div>
      )
    }
  }


  render() {

    // get details, and states passed down from SummaryHandler
    const { onSubmit, recipients, userEmail, invalidEmail } = this.props;
    //const { userEmail, invalidEmail } = this.state;

    return (
      <div id="center-container">
        <div id="instructions">
          {this.makeRecipientList(recipients)}
        </div>
        <h2>[insert graphic here]</h2>
        <TextInput
          name="email"
          onSubmit={onSubmit}
          onChange={this.updateEmail.bind(this)}
          value={userEmail}
          invalid={invalidEmail}
          invalidMsg="Please enter a valid email address."
          label="Enter your email address:"
          labelPos="left"
          placeholder="abcde@ucsd.edu"
        />
      </div>
    );
  }
}
