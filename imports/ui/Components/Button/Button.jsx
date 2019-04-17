import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export default class Button extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    size: PropTypes.string,
  }

  static defaultProps = {
    size: 'large',
    active: false,
    disabled: false
  }

  getClassNames(size, active, disabled) {
    let className = "btn";
    if (size === "small") className += " btn-small";
    else if (size === "large") className += " btn-large";
    className += active? " btn-active" : "";
    className += disabled? " btn-disabled" : "";
    return className;
  }

  render() {
    const { onClick, children, size, active, disabled } = this.props;
    const classNames = this.getClassNames(size, active, disabled);
    return <div className={classNames} onClick={onClick}><div><a>{children}</a></div></div>;
  }
}
