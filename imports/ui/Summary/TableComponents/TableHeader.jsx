import React, { Component } from 'react';

export default class TableHeader extends Component {
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