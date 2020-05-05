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

    // this.state = {
    //   userEmail: "",
    //   invalidEmail: this.props.invalidEmail
    // }
  }

  // reset state values if they used SummaryHandler's button instead 
  // componentWillReceiveProps(nextProps) {
  //   if (nextProps.invalidEmail !== this.props.invalidEmail) {
  //     this.setState({ invalidEmail: nextProps.invalidEmail })
  //   }
  // }

  /* Event Handlers */

  // track the user's entered email here and in parent prop
  updateEmail = evt => {
    // use this to update the value of TextInput
    // this.setState({
    //   userEmail: evt.target.value,
    //   invalidEmail: false
    // });
    // use this to match SummaryHandler's state, so it's button can work
    this.props.trackEmail(evt.target.value);

    // TODO: update email in db 
  }

  confirmEmail = () => {

    const { userEmail } = this.state;

    // check for invalid email
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(userEmail))) {
      this.setState({
        invalidEmail: true,
      });
    } else {
      // tell Summary Handler that the email address was confirmed
      this.props.onSubmit();
    }
  }

  /* Component Selection */

  // make recipient list
  makeRecipientList(recipients) {
    if (recipients === undefined || recipients.length == 0) {
      return (
        <h3>You have elected to not invite anyone to connect. Please enter your email to continue.</h3>
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
        <h3>You are about to invite {recipients_map} to connect. Please enter your email to continue.</h3>
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
