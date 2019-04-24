import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../Button/Button';
import './Tags.scss';

export default class Tags extends Component {
  static propTypes = {
    options: PropTypes.array.isRequired,
    onSelection: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      picked: '' 
    }
  }

  onClick=(opt)=>{ 
    console.log('clicked ' + opt);
    this.props.onSelection(opt);
    this.setState({
      picked: opt
    });
  }

  render() {
    return (
      <div className="tags-container">
        {this.props.options.map((opt)=> {
          return <Button key={opt} size="tags" onClick={()=>this.onClick(opt)} active={this.state.picked === opt}>{opt}</Button>
        })} 
      </div>
    )
  }
}
