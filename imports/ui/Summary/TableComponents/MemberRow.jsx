import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './MemberRow.scss';
import './CheckBox.scss';

export default class MemberRow extends Component {

  static proptypes = {
    member: PropTypes.string.isRequired,
    ranking: PropTypes.number.isRequired,
    key: PropTypes.number.isRequired,
    checked: PropTypes.bool.isRequired,
    toggleCallback: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  render() {
    var rankingComponents = [];
    for (var i = 0; i < 5; i++) {
      if (i <= this.props.ranking && !this.props.noSubmit) {
        rankingComponents.push(
          <span key={"dot" + i} className="full-dot ranking-dot"></span>
        );
      }
      else {
        rankingComponents.push(
          <span key={"dot" + i} className="empty-dot ranking-dot"></span>
        );
      }

      if (i < 4) {
        if (i < this.props.ranking) {
          rankingComponents.push(
            <div className="ranking-connector filled-connector" key={i}></div>
          );
        }
        else {
          rankingComponents.push(
            <div className="ranking-connector empty-connector" key={i}></div>
          );
        }
      }
    }

    return (
      <div className="member-row-container">
        <div className="member-cell">
          <h1>
            {this.props.member}
          </h1>

        </div>
        <div className="ranking-cell">
          <div className="ranking-container">
            {rankingComponents}
          </div>
        </div>
        <div className="share-cell">
          <CheckBox checked={this.props.checked} teammate_pid={this.props.pid} teammate_name={this.props.member} toggleCallback={this.props.toggleCallback} />
        </div>
      </div>
    );

  }
}

class CheckBox extends Component {

  static proptypes = {
    teammate_pid: PropTypes.string.isRequired,
    teammate_name: PropTypes.string.isRequired,
    checked: PropTypes.bool.isRequired,
    toggleCallback: PropTypes.func.isRequired
  }

  constructor(props) {
    super(props);
  }

  toggle() {
    this.props.toggleCallback(this.props.teammate_pid, this.props.teammate_name, this.props.checked);
  }

  render() {
    if (this.props.checked) {
      return (
        <div id="checkbox" className="checked" onClick={() => this.toggle()}></div>
      );
    }
    else {
      return (
        <div id="checkbox" className="unchecked" onClick={() => this.toggle()}></div>
      );
    }

  }
}