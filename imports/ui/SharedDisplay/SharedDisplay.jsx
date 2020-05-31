import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import Button from '../Components/Button/Button';
import 'antd/lib/card/style/css';

import Card from '../Components/Card/Card';

import Sessions from '../../api/sessions';
import SessionEnums from '../../enums/sessions';

import './SharedDisplay.scss';

export default class SharedDisplay extends Component {
  state = {
    createdSession: false,
    code: null
  };

  makeSessionCode() {
    let result = '';
    const characters = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  // insert new session to db
  createSession() {
    const code = this.makeSessionCode();

    console.log(code);

    const session = Sessions.findOne({ code });

    // session already exists!
    if (session) {
      console.log('Session already exists!');
      return;
    }

    Sessions.insert(
      {
        code: code.toLowerCase(),
        instructor: "default",
        participants: [],
        teamHistory: {},
        activities: [],
        status: SessionEnums.status.READY,
        creationTime: new Date().getTime(),
        startTime: 0,
        endTime: 0
      },
      error => {
        if (error) console.log('Something went wrong!');
        else console.log('Session created!');
      }
    );

    this.setState({
      code: code.toLowerCase(),
      createdSession: true
    });
  };


  renderRedirect() {
    const { createdSession, code } = this.state;

    if (createdSession) {
      return (
        <Redirect
          to={{
            pathname: '/' + code.toLowerCase() + '/view'
          }}
        />
      );
    }
  }

  render() {
    return (
      <div className="shared-display-main">
        {this.renderRedirect()}
        <nav className="shared-nav">
          <div>
            <img src="./small_dynamic.png" alt="dynamic logo" />
            <div>PROTOTEAMS</div>
          </div>
        </nav>
        <section className="how-to-main">
          <div className="how-to-title">
            <div>HOW IT WORKS</div>
          </div>
          <div className="how-to-card-container">
            <Card tag="1" title="Gather a group of people">
              <img src="./crowd-jpg-500.jpg" alt="" />
            </Card>
            <Card tag="2" title="Use mobile devices">
              <img src="./phone-jpg-500.jpg" alt="" />
            </Card>
            <Card tag="3" title="Make small groups">
              <img src="./teams-jpg-500.jpg" alt="" />
            </Card>
            <Card tag="4" title="Perform group activities">
              <img src="./discuss-jpg-500.jpg" alt="" />
            </Card>
          </div>
        </section>
        <Button
          style={{ color: 'white', background: '#080808', fontWeight: 600 }}
          size="small"
          onClick={this.createSession.bind(this)}
        >
          BEGIN
        </Button>
      </div>
    );
  }
}