import React, { Component } from 'react';
import { Redirect } from 'react-router-dom';

import { Card, Col, Row } from 'antd';
import Button from '../Components/Button/Button';
import 'antd/lib/card/style/css';

import Sessions from '../../api/sessions';
import SessionEnums from '../../enums/sessions';

import Activities from '../../api/activities';
import ActivityEnums from '../../enums/activities';

import './SharedDisplay.scss';

export default class SharedDisplay extends Component {
  state = {
    createdSession: false,
    code: null
  };

  makeSessionCode() {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charactersLength = characters.length;

    for (let i = 0; i < 5; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }

    return result;
  }

  // insert new session to db
  createSession = () => {
    const code = this.makeSessionCode();

    console.log(code);

    const session = Sessions.findOne({ code });

    // session already exists!
    if (session) {
      console.log('Session already exists!');

      return;
    }

    // create session
    const session_id = Sessions.insert(
      {
        code: code.toLowerCase(),
        participants: [],
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

    // create 3 default activities
    const activities = [];

    for (let i = 0; i < 3; i++) {
      const activity_id = Activities.insert({
        name: ActivityEnums.name.TEAM_DISCUSSION,
        session_id,
        teamSize: 3, // TODO: default value?
        hasIndvPhase: false,
        durationIndv: 180,
        durationTeam: 180,
        durationOffsetIndv: 0,
        durationOffsetTeam: 0,
        status: ActivityEnums.status.READY,
        creationTime: new Date().getTime(),
        statusStartTimes: {
          indvPhase: 0,
          teamForm: 0,
          teamPhase: 0,
          peerAssessment: 0
        },
        teams: [],
        allTeamsFound: false,
        endTime: 0
      });

      activities.push(activity_id);
    }

    // add new activity to this session, necessary? good?
    Sessions.update(
      session_id,
      {
        $set: {
          activities
        }
      },
      error => {
        if (!error) {
          this.setState({
            createdSession: true,
            code
          });
        }
      }
    );
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
            <div>How it works</div>
          </div>
          <div className="how-to-card-container">
            <Row gutter={16}>
              <Col span={6}>
                <Card title="1. Gather group of people with mobile phones" bordered={false}>
                  {/* <img src="./crowd.jpg" alt="" /> */}
                </Card>
              </Col>
              <Col span={6}>
                <Card title="2. Participants enter session code" bordered={false}>
                  {/* <img src="./homescreen.png" alt="" /> */}
                </Card>
              </Col>
              <Col span={6}>
                <Card title="3. Form teams" bordered={false}>
                  {/* <img src="./hold_phones.png" alt="" /> */}
                </Card>
              </Col>
              <Col span={6}>
                <Card title="4. Rate member preferences for future teams" bordered={false}>
                  {/* <img src="./rating.png" alt="" /> */}
                </Card>
              </Col>
            </Row>
          </div>
          <Button size="small" onClick={this.createSession}>
            Begin
          </Button>
        </section>
      </div>
    );
  }
}
