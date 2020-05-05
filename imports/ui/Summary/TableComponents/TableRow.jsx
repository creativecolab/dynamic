import React, { Component } from 'react';
import PropTypes from 'prop-types';

import MemberRow from './MemberRow';
import DetailsList from './DetailsList';

export default class TableRow extends Component {

  static propTypes = {
    data: PropTypes.object.isRequired,
    selectedToEmail: PropTypes.array.isRequired,
    toggleCallback: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }


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