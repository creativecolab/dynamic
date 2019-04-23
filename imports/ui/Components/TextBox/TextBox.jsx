import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './TextBox.scss'; 

export default class TextBox extends Component {
  static propTypes = {
 // size: PropTypes.string.isRequired,
    color: PropTypes.string,
  }

  static defaultProps = {
      color: 'black'
  }

  getClassNames(color){
    if (color == 'red') return "invalid"; 
    else return ""; 
  }

  render() {
      const{children} = this.props; 
    return (
      <div className={this.getClassNames(this.props.color)}>
      {children}
      </div>
    )
  }
}
