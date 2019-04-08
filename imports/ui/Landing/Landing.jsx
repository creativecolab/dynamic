import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper'
import '../assets/_main.scss';
import { Redirect } from 'react-router-dom'
import Sessions from "../../api/sessions";

import './Landing.scss';
import '../assets/_main.scss';

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
      session_code: evt.target.value.toUpperCase()}
    );
  }

  //once the user enters the session code, go to that session's page
  handleCodeEntry(evt) {
    evt.preventDefault();

    const session_code = this.state.session_code.toLowerCase();

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
        pathname: '/' + this.state.session_code.toLowerCase()
      }}/>
    }
  }

  render() {

    // USED FOR STYLING INPUT
    const invalid = this.state.invalid_code;

    return (
      <Wrapper>
        {this.renderRedirect()}
        <h1 id="title-dynamic">Dynamic!</h1>
        <img id="logo" src="./dynamic.png" alt=""/>

        {/* FORM BEGINS HERE */}
        <form id="session-form" onSubmit={(evt) => this.handleCodeEntry(evt)}>

          {/* FIRST INPUT */}
          <div id="session-code" className="field-container">

            {/* INPUT LABEL */}
            <label className="field-title" htmlFor="session-code">Session code:</label> 

            {/* DIV THAT HOLDS THE INPUT FIELD */}
            <div className="input-container">

              {/* INPUT FIELD, NOTE THAT THE CLASS CHANGES BASED ON THE STATE OF THIS COMPONENT */}
              <input className={invalid? "input-text-invalid" : "input-text"} type="text"
                name="session-code" placeholder="Enter your session code"
                value={this.state.session_code.toUpperCase()} onChange={(evt) => this.handleChange(evt)}/>
              
              {/* MESSAGE THAT APPEARS IF THE INPUT IS INVALID, SOME INPUTS MIGHT NOT NEED THIS */}
              {invalid && <span className="invalid-input-message">A session with that code does not exist!</span>}
            </div>
          
          {/* FIRT INPUT ENDS HERE, MAKE A COPY OF THIS DIV IF YOU NEED MORE INPUTS IN THE FORM */}
          </div>

          {/* CONTINUE BUTTON */}
          <input className="small-button" type="submit" value="Continue"/>

        </form>
      </Wrapper>
    )
  }
}
