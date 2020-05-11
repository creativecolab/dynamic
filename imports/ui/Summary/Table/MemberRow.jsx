import React, { Component } from 'react';

export default class MemberRow extends Component {
  render() {
    var rankingComponents = [];
    for (var i = 0; i < 5; i++) {
      if (i <= this.props.ranking) {
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
        <div className="check-cell">
          <CheckBox checked={this.props.checked} teammate_pid={this.props.pid} toggleCallback={this.props.toggleCallback} />
        </div>
      </div>
    );

  }
}

class CheckBox extends Component {
  constructor(props) {
    super(props);
  }

  toggle() {
    this.props.toggleCallback(this.props.teammate_pid, this.props.checked);
  }

  render() {
    if (this.props.checked) {
      return (
        <div id="checkbox" className="checked checkbox" onClick={() => this.toggle()}></div>
      );
    }
    else {
      return (
        <div id="checkbox" className="unchecked checkbox" onClick={() => this.toggle()}></div>
      );
    }

  }
}