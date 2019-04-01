import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Users from '../../api/users'
import Wrapper from '../Wrapper/Wrapper'
import { withTracker } from 'meteor/react-meteor-data';
import '../assets/_main.scss';

class SignUp extends Component {

    constructor(props) {
        super(props);
        this.state = {
          firstname: '',
          lastname: '',
          pid: '',
        };
    }

    handleFirstName(evt) {
        this.setState({
          firstname: evt.target.value
        });
      }
    
    handleLastName(evt) {
        this.setState({
            lastname: evt.target.value
        });
    }

    handlePID(evt) {
        this.setState({
            pid: evt.target.value
        });
    }

    // add the user-entered info into the database
    saveUser(evt) {    
        evt.preventDefault();
        console.log(JSON.stringify(this.state));

        if (Users.findOne({pid: this.state.pid})) {
            console.log('User already exists');
            return;
        }

        Users.insert({
            name: this.state.firstname + " " + this.state.lastname,
            ...this.state
        });

        window.location = '/';
    }

    render() {
     return (
        <Wrapper>
            <h2>Please enter your first name, last name, and PID to register!</h2>
            <form id="icebreaker-form" onSubmit={(evt) => this.saveUser(evt)}>
            <div id="icebreaker" className="field-container">
                <label className="field-title" htmlFor="firstname">First Name:</label>
                <div className="input-container">
                    <input className="u-container" type="text" name="firstname" placeholder="Steven"  value={this.state.firstname} onChange={(evt) => this.handleFirstName(evt)}/>
                </div>
                <label className="field-title" htmlFor="lastname">Last Name:</label>
                <div className="input-container">
                    <input className="u-container" type="text" name="lastname" placeholder="Dow"  value={this.state.lastname} onChange={(evt) => this.handleLastName(evt)}/>
                </div>
                <label className="field-title" htmlFor="lies">PID:</label>
                <div className="input-container">
                    <input className="u-container" type="text" name="pid" placeholder="A12345689"  value={this.state.pid} onChange={(evt) => this.handlePID(evt)}/>
                </div>
                <input id="next_button" type="submit" value="Save"/>
            </div>
            </form>
        </Wrapper>
      )
    }
}

export default SignUp; /* withTracker((props) => {
    const pid = Users.findOne({pid: props.match.params.pid});
    return { pid }
})(SignUp);*/