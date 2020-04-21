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
    const { viewedSummary, selectedEmails, sentEmails } = this.props;

    this.state = {
      viewedSummary: viewedSummary,
      selectedEmails: selectedEmails,
      sentEmails: sentEmails
    }
  }

  renderBody() {
    // determine with component to load based on state
    const { viewedSummary, selectedEmails, sentEmails } = this.state;

    const { preferences, pid, session_id } = this.props;


    // haven't looked at the summary yet
    if (!viewedSummary)
      return (<ActivityCompletion />);

    // haven't finished selecting emails
    if (!selectedEmails)
      return (<TableSummary preferences={preferences} pid={pid} session_id={session_id} />);

    if (!sentEmails)
      return (<EmailConfirmation preferences={preferences} onSubmit={() => this.setState({ sentEmails: true })} />);
  }

  backButtonPressed() {
    console.log("back pressed", Date());
    console.log(this.state);
  }

  render() {
    // get props from parent
    const { pid, session_id, preferences } = this.props;

    // get 'viewSummary', preferences, 'selectedEmails', 'sentEmails' 
    const { viewedSummary, selectedEmails, sentEmails } = this.state;
    console.log(viewedSummary);
    console.log(preferences);
    console.log(selectedEmails);
    console.log(sentEmails);



    // pid is required from parent
    if (!pid) return <Loading />;

    if (viewedSummary && selectedEmails && sentEmails) {
      return <Survey />;
    }

    let buttonAct, backBtnAct;
    if (!viewedSummary) {
      buttonAct = () => {
        this.setState({ viewedSummary: true });
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
      buttonAct = () => {
        this.setState({ sentEmails: true });
        Meteor.call('users.toggleSentEmails', pid, session_id, true, () => {
          console.log("set sentEmails to ", true);
        });
      }
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
        hasBackBtn={this.state.selectedEmails ? true : false}
        buttonAction={buttonAct}
        buttonSize={'medium'}
        buttonTxt={'Send Emails'}
        backBtnAction={backBtnAct}
      >
        {this.renderBody()}
      </Mobile>
    );
  }
}

// updates component when activity changes
export default withTracker(props => {

  var viewedSummary, selectedEmails, sentEmails, preferences;
  const user = Users.findOne({ pid: props.pid });

  if (user) {
    // get viewSummary, selectedEmails, sentEmails
    for (let i = 0; i < user.sessionHistory.length; i++) {
      if (user.sessionHistory[i].session_id === props.session_id) {
        console.log(user.sessionHistory[i]);
        viewedSummary = user.sessionHistory[i].viewedSummary;
        selectedEmails = user.sessionHistory[i].selectedEmails;
        sentEmails = user.sessionHistory[i].sentEmails;
      }
    }
    preferences = user.preferences;
  }

  return { user, preferences, viewedSummary, selectedEmails, sentEmails };
})(SummaryHandler);
