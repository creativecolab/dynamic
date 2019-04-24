import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Button from '../Button/Button';
import './Tags.scss';

export default class Tags extends Component {
  static propTypes = {
    options: PropTypes.array,
    onSelection: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props)
    this.state = {
      picked: '' 
    }
  }

  static defaultProps = {
      options: ['A', 'B','C']
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
          if (this.state.picked !== opt) {
            return <Button key={opt} size="tags" onClick={()=>this.onClick(opt)}>{opt}</Button>
          } else {
            return <Button key={opt} size="tags" onClick={()=>this.onClick(opt)} active={true}>{opt}</Button>
          }
        })} 
      </div>
    )
  }
}
