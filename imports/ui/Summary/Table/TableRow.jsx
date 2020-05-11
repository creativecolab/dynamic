import React, { Component } from 'react';
import MemberRow from './MemberRow';
import DetailsList from './DetailsList';

export default class TableRow extends Component {
  render() {
    var memberComponents = [];
    const { selectedToEmail, data } = this.props;
    const { members, rankings, questions, pids, round } = data;
    for (var i = 0; i < members.length; i++) {
      var checked = selectedToEmail.includes(pids[i]);
      memberComponents.push(
        <MemberRow member={members[i]} ranking={rankings[i]} key={i} pid={pids[i]} checked={checked} toggleCallback={this.props.toggleCallback} />
      );
    }

    return (
      <div className="table-row-container">
        <div className="table-row">
          <div className="round-cell">
            {round}

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