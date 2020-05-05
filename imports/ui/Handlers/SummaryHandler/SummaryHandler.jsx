import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Activities from '../../../api/activities';
import Teams from '../../../api/teams';

import Mobile from '../../Layouts/Mobile/Mobile';

import ActivityCompletion from '../../Summary/ActivityCompletion';
import TableSummary from '../../Summary/TableSummary';
import EmailConfirmation from '../../Summary/EmailConfirmation';
import Loading from '../../Components/Loading/Loading';
import Survey from '../../Components/Survey/Survey';

class SummaryHandler extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    session_id: PropTypes.string.isRequired
  };

  constructor(props) {
    super(props);
    const { viewedSummary, selectedEmails, sentEmails, sendEmailsTo } = this.props;

    this.state = {
      viewedSummary: viewedSummary ? viewedSummary : false,
      selectedEmails: selectedEmails ? selectedEmails : false,
      sentEmails: sentEmails ? sentEmails : false,
      recipients: sendEmailsTo ? sendEmailsTo.map(pid => Users.findOne({ pid: pid }).name) : [],
      userEmail: "",
      invalidEmail: false
    }
  }

  /* Functions for child components to use to update the states here */

  // for table summary
  trackRecipients = (recipient, add) => {
    // add or remove recipients
    if (add) {
      // only add a recipient once
      // if (this.state.recipients) {
      //   this.setState({
      //     recipients: [recipient]
      //   });
      // } else 
      if (this.state.recipients.indexOf(recipient) == -1) {
        this.setState({
          recipients: [...this.state.recipients, recipient]
        });
      }
    } else {
      // remove this recipient
      this.setState({
        recipients: this.state.recipients.filter(pot_rec => (pot_rec != recipient))
      });
    }

  }

  // for email confirmation page
  checkEmailToConfirm = () => {
    const { pid, session_id } = this.props;
    const { userEmail } = this.state;

    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,4})+$/.test(userEmail)) {
      // valid email
      this.setState({
        invalidEmail: false,
        sentEmails: true
      });
      Meteor.call('users.saveEmail', pid, session_id, userEmail, () => {
        console.log("Accepted email address.");
      });
    } else {
      this.setState({
        invalidEmail: true,
      });

    }
  }

  /* Component Selection */

  renderBody() {
    // determine with component to load based on state
    const { viewedSummary, selectedEmails, sentEmails, userEmail, invalidEmail, recipients } = this.state;

    const { pid, session_id } = this.props;


    // haven't looked at the summary yet
    if (!viewedSummary)
      return (<ActivityCompletion />);

    // haven't finished selecting emails
    if (!selectedEmails)
      return (<TableSummary pid={pid} session_id={session_id} trackRecipients={this.trackRecipients.bind(this)} />);

    if (!sentEmails)
      return (
        <EmailConfirmation
          recipients={recipients}
          trackEmail={(email) => { this.setState({ userEmail: email, invalidEmail: false }); }}
          onSubmit={this.checkEmailToConfirm}
          invalidEmail={invalidEmail}
          userEmail={userEmail}
        />);
  }

  render() {
    // get props from parent
    const { pid, session_id } = this.props;

    const { viewedSummary, selectedEmails, sentEmails } = this.state;

    // pid is required from parent
    if (!pid) return <Loading />;

    if (viewedSummary && selectedEmails && sentEmails) {
      return <Survey />;
    }

    let buttonAct, backBtnAct;
    if (!viewedSummary) {
      buttonAct = () => {
        let recipients = this.props.sendEmailsTo.map(pid => Users.findOne({ pid: pid }).name)
        this.setState({
          viewedSummary: true,
          recipients: recipients
        });
        Meteor.call('users.toggleViewedSummary', pid, session_id, true, () => {
          console.log("set viewSummary to ", true);
        });
      }
    }
    else if (!selectedEmails) {
      buttonAct = () => {
        this.setState({ selectedEmails: true });
        Meteor.call('users.toggleSelectedEmails', pid, session_id, true, () => {
          console.log("set selectedEmails to ", true);
        });
      }
    }
    else {
      buttonAct = this.checkEmailToConfirm.bind(this);
      backBtnAct = () => {
        this.setState({ selectedEmails: false });
        Meteor.call('users.toggleSelectedEmails', pid, session_id, false, () => {
          console.log("set selectedEmails to ", false);
        });
      }
    }

    return (
      <Mobile
        activityName={'Summary'}
        title={'Summary'}
        hasFooter={true}
        hasNavbar={true}
        hasTimer={false}
        displayTeam={false}
        buttonAction={buttonAct}
        buttonSize={'medium'}
        buttonTxt={'Send Emails'}
        hasBackBtn={this.state.selectedEmails ? true : false}
        backBtnAction={backBtnAct}
      >
        {this.renderBody()}
      </Mobile>
    );
  }
}

// updates component when activity changes
export default withTracker(props => {

  var viewedSummary, selectedEmails, sentEmails, sendEmailsTo;
  const user = Users.findOne({ pid: props.pid });

  if (user) {
    // get viewSummary, selectedEmails, sentEmails
    for (let i = 0; i < user.sessionHistory.length; i++) {
      if (user.sessionHistory[i].session_id === props.session_id) {
        console.log(user.sessionHistory[i]);
        viewedSummary = user.sessionHistory[i].viewedSummary;
        selectedEmails = user.sessionHistory[i].selectedEmails;
        sentEmails = user.sessionHistory[i].sentEmails;
        sendEmailsTo = user.sessionHistory[i].sendEmailsTo;
      }
    }
  }

  return { user, viewedSummary, selectedEmails, sentEmails, sendEmailsTo };
})(SummaryHandler);
