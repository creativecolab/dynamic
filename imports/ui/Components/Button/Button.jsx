import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './Button.scss';

export default class Button extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    active: PropTypes.bool,
    badge: PropTypes.string,
    disabled: PropTypes.bool,
    order: PropTypes.string,
    size: PropTypes.string
  };

  static defaultProps = {
    size: 'large',
    active: false,
    badge: '',
    order: '',
    disabled: false
  };

  getClassNames({ size, active, disabled, color }) {
    let className = 'btn';

    if (size === 'small') className += ' btn-small';
    else if (size === 'large') className += ' btn-large';
    else if (size === 'tags') className += ' btn-tags';
    else if (size === 'input-text') className += ' btn-input-text';

    className += active ? ' btn-active' : '';
    className += disabled ? ' btn-disabled' : '';

    return className;
  }

  render() {
    const { onClick, badge, children, order, style } = this.props;
    const classNames = this.getClassNames(this.props);

    return (
      <div className={classNames} style={style} onClick={onClick}>
        <strong>{order}</strong>
        {children}
        <span className="btn-badge">{badge}</span>
      </div>
    );
  }
}
