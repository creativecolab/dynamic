import React, { Component } from 'react'
import Button from '../../Components/Button/Button';
import PropTypes from 'prop-types'

export default class Standard extends Component {
  static propTypes = {
    buttonAction: PropTypes.func,
  }

  static defaultProps = {
    buttonAction: () => {}
  }

  constructor(props) {
    super(props);
    this.state = {
      buttonAction: this.props.buttonAction
    }
  }

  setButtonAction(action) {
    this.setState({
      buttonAction: action
    });
  }

  render() {
    const { buttonAction } = this.state;
    return (
      <div className="main">
        <nav className="navbar"></nav>
        <div className="content"></div>
        <footer className="footer">
          <Button size="small" onClick={buttonAction}>Click me</Button>
        </footer>
      </div>
    )
  }
}
