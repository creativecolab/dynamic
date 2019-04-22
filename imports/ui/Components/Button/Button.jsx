import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export default class Button extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool,
    disabled: PropTypes.bool,
    order: PropTypes.string,
    size: PropTypes.string,
  }

  static defaultProps = {
    size: 'large',
    active: false,
    order: '',
    disabled: false
  }

  getClassNames({ size, active, disabled }) {
    let className = "btn";
    if (size === "small") className += " btn-small";
    else if (size === "large") className += " btn-large";
    else if (size === "tags") className += " btn-tags"; 
    className += active? " btn-active" : "";
    className += disabled? " btn-disabled" : "";
    return className;
  }

  render() {
    const { onClick, children, order } = this.props;
    const classNames = this.getClassNames(this.props);
    return <div className={classNames} onClick={onClick}><strong>{order}</strong>{children}</div>;
  }
}
