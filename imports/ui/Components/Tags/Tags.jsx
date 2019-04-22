import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../Button/Button';
import './Tags.scss';

export default class Tags extends Component {
  static propTypes = {
    options: PropTypes.array,

  }

  static defaultProps = {
      options: ['A', 'B','C','D']
  }

  onClick=(opt)=>{ 
    console.log('clicked ' + opt);
  }

  render() {
    return (
      <div className="tags-container">
        {this.props.options.map((opt)=> {return <Button size="tags" onClick={()=>this.onClick(opt)}>{opt}</Button>})}
      </div>
    )
  }
}
