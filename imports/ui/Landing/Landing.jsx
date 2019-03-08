import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import { Redirect } from 'react-router-dom'
import Sessions from "../../api/sessions";


export default class Landing extends Component {

  constructor(props) {
    super(props);
    this.state = {
      session_code: '',
      redirect: false,
      invalid_code: false
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

    const { session_code } = this.state;

    if (session_code === "instructor") {
      console.log('NOOO!!');
    }

    if (session_code === "") {
      console.log('NOOO!!');
    }

    // check if session exists
    const session = Sessions.findOne({code: session_code});
    if (session) {
      this.setState({
        redirect: true,
        invalid_code: false
      });  
    } else {
      console.log('Nope');
      this.setState({
        invalid_code: true
      });
      
    }
     
  }

  //will redirect to the enter username page if the redirect state is set
  renderRedirect = () => {
    if (this.state.redirect) {
      return <Redirect to={{
        pathname: '/' + this.state.session_code
      }}/>
    }
  }

  //will alert the user that the entered code is not valid
  renderCodeNonexistant = () => {
    if (this.state.invalid_code && !this.state.redirect) {
      return <p style={{color:"red"}}>A session with that code does not exist!</p>
    }
  }

  render() {
    return (
      <Wrapper>
        {this.renderRedirect()}
        <h1 id="title-dynamic">Dynamic!</h1>
        <form id="session-form" onSubmit={(evt) => this.handleCodeEntry(evt)}>
          <div id="session-code" className="field-container">
            <label className="field-title" htmlFor="session-code">Session code</label>
            <div className="input-container">
              <input type="text" name="session-code" placeholder="Enter your session code" value={this.state.session} onChange={(evt) => this.handleChange(evt)}/>
            </div>
            {this.renderCodeNonexistant()}
            <input type="submit" value="Next"/>
          </div>
        </form>
      </Wrapper>
    )
  }
}
