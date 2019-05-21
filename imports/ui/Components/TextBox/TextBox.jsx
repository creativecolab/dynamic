import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TextBox.scss';

export default class TextBox extends Component {
  static propTypes = {
    // size: PropTypes.string.isRequired,
    color: PropTypes.string,
    badge: PropTypes.string,
    label: PropTypes.string
  };

  static defaultProps = {
    color: 'black',
    badge: ''
  };

  getClassNames(color) {
    if (color == 'red') return 'invalid';
    else return '';
  }

  render() {
    const { badge, children, label } = this.props;

    return (
      <div className="textbox-main">
        <div className="textbox-label">{label}</div>
        <div className="textbox-text">
          {children}
          <span className="textbox-badge">{badge}</span>
        </div>
      </div>
    );
  }
}
