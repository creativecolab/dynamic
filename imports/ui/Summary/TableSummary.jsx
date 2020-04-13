import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '../Components/Button/Button';

import './TableSummary.scss';

export default class TableSummary extends Component {

  static propTypes = {
    preferences: PropTypes.array
  };


  render() {
    const rankings = [1, 2];
    const memberData = [["Sam", "Justin"], ["Steven", "Matin"], ["Alison", "Amaya"], ["Billy", "Bob", "Joe"]];
    const rankingData = [["4", "2"], ["5", "3"], ["2", "5"], ["3", "1", "2"]];
    const questionData = [["Q1", "Q2", "Q3", "Q4"], ["Q3", "Q4"], ["Q5"], ["Q6", "Q7", "Q8"]];

    return (
      <div className="table-summary" id="center-container">
        <div>
          <TableHeader />
          <TableRow round={1} members={memberData[0]} rankings={rankingData[0]} questions={questionData[0]} />
          <TableRow round={2} members={memberData[1]} rankings={rankingData[1]} questions={questionData[1]} />
          <TableRow round={3} members={memberData[2]} rankings={rankingData[2]} questions={questionData[2]} />
          <TableRow round={4} members={memberData[3]} rankings={rankingData[3]} questions={questionData[3]} />
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
    for (var i = 0; i < this.props.members.length; i++) {
      memberComponents.push(
        <MemberRow member={this.props.members[i]} ranking={this.props.rankings[i]} key={i} />
      );
    }

    // return (
    //   <div className="table-row-container">
    //     <div className="round-cell">
    //       <h5>{this.props.round}</h5>

    //     </div>
    //     <div className="members-cell">
    //       {memberComponents}
    //     </div>
    //     <div className="ranking-cell">
    //       {this.props.rankings}
    //     </div>
    //     <div className="share-cell">
    //       checkbox
    //     </div>
    //   </div>
    // );
    return (
      <div className="table-row-container">
        <div className="table-row">
          <div className="round-cell">
            <h5>{this.props.round}</h5>

          </div>
          <div className="members-cell">
            {memberComponents}
          </div>
        </div>
        <DetailsList questions={this.props.questions} />
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
          <p>{this.props.questions[i]}</p>
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