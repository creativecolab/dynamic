import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class Button extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    size: PropTypes.string,
  }

  static defaultProps = {
    size: 'large'
  }

  render() {
    const { onClick, children, size } = this.props;
    if (size === 'small')
      return <div className="small-btn" onClick={onClick}>{children}</div>;
    else 
      return <div className="large-btn" onClick={onClick}>{children}</div>;
  }
}
