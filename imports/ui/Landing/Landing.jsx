import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import { Redirect } from 'react-router-dom'


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      session_code: '',
      redirect: false
    };
  }

  //update the session_code state so we know where to go
  handleChange(evt) {
    this.setState({
      session_code: evt.target.value}
    );
  }

  //once the user enters the session code, go to that session's page
  handleCodeEntry(evt) {
    evt.preventDefault();
    console.log("Code entered");
    console.log(this.state.session_code);
    this.setState({
      redirect: true
    })    
  }

  //will redirect to the enter username page if the redirect state is set
  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: '/' + this.state.session_code
      }}/>
    }
  }

  render() {
    return (
      <Wrapper>
        {this.renderRedirect()}
        <h1 id="title-dynamic">Dynamic!</h1>
        <form id="session-form" onSubmit={(evt) => this.handleCodeEntry(evt)}>
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">Please enter session code</label>
            <div className="input-container">
              <input type="text" name="session-code" placeholder="Type your session code here" value={this.state.session} onChange={(evt) => this.handleChange(evt)}/>
            </div>
          </div>
        </form>
      </Wrapper>
    )
  }
}
