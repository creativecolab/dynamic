import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './TextBox.scss'; 
import Tags from '../Tags/Tags';

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
      <Tags></Tags>
      </div>
    )
  }
}
