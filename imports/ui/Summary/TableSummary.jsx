import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Meteor } from 'meteor/meteor';

import Button from '../Components/Button/Button';
import Users from '../../api/users';
import Questions from '../../api/questions';
import Activities from '../../api/activities';

import './TableSummary.scss';

export default class TableSummary extends Component {

  static propTypes = {
    preferences: PropTypes.array
  };

  constructor(props) {
    super(props)
    console.log("construct");
    const { pid, session_id } = props;
    this.getSummary(pid, session_id);

  }

  getSummary(pid, session_id) {
    Meteor.call('users.getSummary', pid, session_id, (error, result) => {
      console.log("summary info loaded", result);
      this.setState({
        data: result
      });
    })
  }

  render() {
    const memberData = [["Sam", "Justin"], ["Steven", "Matin"], ["Alison", "Amaya"], ["Billy", "Bob", "Joe"]];
    const rankingData = [["4", "2"], ["5", "3"], ["2", "5"], ["3", "1", "2"]];
    const questionData = [["Q1", "Q2", "Q3", "Q4"], ["Q3", "Q4"], ["Q5"], ["Q6", "Q7", "Q8"]];

    var rows = [];
    console.log(this.state);
    if (this.state && this.state.data) {
      for (var i = 0; i < this.state.data.length; i++) {
        rows.push(<TableRow key={i} data={this.state.data[i]} />);
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

class TableHeader extends Component {
  render() {
    return (
      <div className="table-header-container">
        <div className="round-cell">
          <h2>Round</h2>
        </div>
        <div className="members-cell">
          <h2>Members</h2>
        </div>
        <div className="ranking-cell">
          <h2>Ranking</h2>
        </div>
        <div className="share-cell">
          <h2>Share Email</h2>
        </div>
      </div>
    );
  }
}

class TableRow extends Component {
  render() {
    var memberComponents = [];
    console.log("DATA", this.props.data);
    const { members, rankings, questions, round } = this.props.data;
    for (var i = 0; i < members.length; i++) {
      memberComponents.push(
        <MemberRow member={members[i]} ranking={rankings[i]} key={i} />
      );
    }

    return (
      <div className="table-row-container">
        <div className="table-row">
          <div className="round-cell">
            <h5>{round}</h5>

          </div>
          <div className="members-cell">
            {memberComponents}
          </div>
        </div>
        <DetailsList questions={questions} />
      </div>
    );
  }
}

class DetailsList extends Component {
  constructor(props) {
    super(props);
    this.state = ({
      show: false
    });
  }

  showClicked() {
    this.setState({
      show: true
    });
  }

  hideClicked() {
    console.log("hide");
    this.setState({
      show: false
    });
  }

  render() {
    var questionComponents = [];
    for (var i = 0; i < this.props.questions.length; i++) {
      questionComponents.push(
        <div key={i}>
          <p>{this.props.questions[i].question}</p>
        </div>
      );
    }

    if (this.state.show) {
      return (
        <div className="question-summary">
          <div>
            <h4>Questions</h4>
            {questionComponents}
          </div>
          <div className="showhide-details" onClick={() => this.hideClicked()}>
            Close Details
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="question-summary">
          <div className="showhide-details" onClick={() => this.showClicked()}>
            Show Details
          </div>
        </div>
      );
    }

  }
}

class MemberRow extends Component {
  render() {
    var rankingComponents = [];
    for (var i = 0; i < 5; i++) {
      if (i < this.props.ranking) {
        rankingComponents.push(
          <span key={i} className="full-dot"></span>
        );
      }
      else {
        rankingComponents.push(
          <span key={i} className="empty-dot"></span>
        );
      }
    }
    return (
      <div className="member-row-container">
        <div className="member-cell">
          {this.props.member}
        </div>
        <div className="ranking-cell">
          {rankingComponents}
        </div>
        <div className="share-cell">
          ⯀
        </div>
      </div>
    );

  }
}