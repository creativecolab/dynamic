import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import TableHeader from './TableHeader';
import TableRow from './TableRow';

import { withTracker } from 'meteor/react-meteor-data';

import './TableSummary.scss';

class TableSummary extends Component {

  static propTypes = {
    preferences: PropTypes.array
  };

  constructor(props) {
    super(props)

    const { pid, session_id } = props;
    this.getSummary(pid, session_id);
  }

  getSummary(pid, session_id) {
    Meteor.call('users.getSummary', pid, session_id, (error, result) => {
      this.setState({
        data: result
      });
    })
  }

  toggleChecked(teammate_id, prevChecked) {
    //previously checked, need to uncheck
    if (prevChecked) {
      Meteor.call('users.removeFromEmailList', this.props.pid, this.props.session_id, teammate_id);
    }
    else {
      Meteor.call('users.addToEmailList', this.props.pid, this.props.session_id, teammate_id);
    }
  }

  render() {
    var rows = [];
    if (this.state && this.state.data) {
      for (var i = 0; i < this.state.data.length; i++) {
        rows.push(<TableRow key={i} data={this.state.data[i]} selectedToEmail={this.props.selectedToEmail} toggleCallback={this.toggleChecked.bind(this)} />);
      }
    }

    return (
      <div className="table-summary" id="center-container">
        <div>
          <TableHeader />
          {rows}
        </div>
      </div>
    );
  }
}

export default withTracker(({ pid, session_id }) => {
  // get the team that this user is in for this activity
  const sessionHistory = Users.findOne({ pid: pid }).sessionHistory;
  var selectedToEmail = [];
  for (var i = 0; i < sessionHistory.length; i++) {
    if (sessionHistory[i].session_id == session_id) {
      selectedToEmail = sessionHistory[i].sendEmailsTo;
      break;
    }
  }
  return { selectedToEmail };
})(TableSummary);