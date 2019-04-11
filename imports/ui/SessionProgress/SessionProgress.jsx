import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper';
import Clock from '../Clock/Clock';
import { withTracker } from 'meteor/react-meteor-data';

import './SessionProgress.scss';
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';
import Logs from "../../api/logs";

import SessionEnd from './Components/SessionEnd';
import TeamShapes from './Components/TeamShapes';
import StatsPage from './Components/StatsPage';


class SessionProgress extends Component {
  static propTypes = {
    // code: PropTypes.string.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      duration: -1
    }
  }

  mapActivities() {
    const { activities } = this.props;
    if (!activities) return ""; 
    return activities.filter((act) => act.status < 3).map((act) => {
      return <li  key={act._id}>{act.name}</li>;
    });
  }

  edit() {    
    window.location = '/' + this.props.match.params.code + '/edit';
  }

  startSession() {
    if (this.props.session.participants.length < 2) return;
    Sessions.update(this.props.session._id, {
      $set: {
        status: 1
      }
    });

    //track the session that a session had started 
    const new_log = Logs.insert({
      log_type: "Session Started",
      code: this.props.match.params.code,
      timestamp: new Date().getTime(),
    });

    console.log(new_log);
  }

  componentDidUpdate(prevProps) {
    if (!prevProps.currentActivity && this.props.currentActivity) {
      this.setState({
        duration: 10
      }, () => {
        // tick
        console.log('Duration set!');
      });
    }
  }

  // advance the status of the activity
  advanceActivity = () => {

    // get the current status, increment if possible
    const currStatus = this.props.currentActivity.status;
    console.log("Status of activity " + this.props.currentActivity.name + "is " + currStatus);

    if (currStatus + 1 != 6) {

      console.log("Activity status of " + this.props.currentActivity.name + " advanced to " + (currStatus + 1));

      Activities.update(this.props.currentActivity._id, {
        $set: { status: currStatus + 1, startTime: new Date().getTime() }
      });
    } else {
      console.log("Can no longer advance the status of " + this.props.currentActivity.name);
    }
  }

  // startNextActivity = () => {
  //   Activities.update(this.props.currentActivity._id, {
  //     $set: {
  //       status: 5,
  //       endTime: new Date().getTime()
  //     }
  //   });
  // }

  renderClock() {
    const { currentActivity } = this.props;
    let totalTime = 0;
    if (currentActivity.status === 1) {
      totalTime = 120;
    } else if (currentActivity.status === 3) {
      totalTime = 120;
    } else {
      return "";
    }
    // console.log("Start time: " + currentActivity.startTime);
    return <Clock startTime={this.props.currentActivity.startTime} big={true} totalTime={totalTime}/>
  }

  getInstructions(status) {
    const { currentActivity } = this.props;
    if (status === 1) {
      return (
        <div>
          {this.renderClock()}
          <h1 id="header">{currentActivity.name}</h1>
          <div id="font-size">2 Truths and 1 Lie</div>
          <br></br>
          <h2>Instructions:</h2>
          <div className="text-box-bigscreen">
            <h2>Write TWO interesting truths and ONE lie about yourself!</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>The goal is to make it hard for people to guess which is the lie.</h2>
          </div><br></br><br></br>
        </div>
      )
    }
    if (status === 2) {
      return <TeamShapes skip={this.advanceActivity} activity_id={this.props.currentActivity._id}/>
    }
    if (status === 3) {
      return (
        <div>
          {this.renderClock()}
          <h1>2 Truths and 1 Lie</h1>
          <div id="font-size">1 Person is in the hotseat</div>
          <br></br>
          <h2>Instructions:</h2>
          <div className="text-box-bigscreen">
            <h2>Select which of the 3 statements is the lie.</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>When everyone has guessed, you'll be able to see who was right.</h2>
          </div><br></br>
          <div className="text-box-bigscreen">
            <h2>Then continue to the next person in the hotseat.</h2>
          </div><br></br><br></br>
        </div>
      )
    }
    if (status === 4) {
      return <StatsPage session_id={this.props.session._id} activity_id={currentActivity._id} />
    }
  }

  renderInfo() {
    const { session } = this.props;
    if (!session) return "Oh.";
    const numJoined = session.participants.length;

    if (session.status === 2) return <SessionEnd />;

    if (session.status === 0) return (
    <div>
      <h1 id="header">Dynamic</h1>
      <h2>Enter url:</h2>
      <div className="text-box-bigscreen">
      <c>http://sodynamic.herokuapp.com</c>
      </div>
      <h2>Session code:</h2>
      <div className="text-box-bigscreen">
      <c>{this.props.match.params.code}</c>
      </div>
      <div id="spacing"><c>{numJoined}</c><br></br>{numJoined === 1? ' person has ' : ' people have '} joined</div>
      <button className="bigscreen-button" onClick={() => this.startSession()}>Begin</button>
    </div>);

    if (!this.props.currentActivity) return "You should add activities"

    if (session.status === 1) return (
      <div>
        {/* <div>{this.props.currentActivity.name}</div> */}
        {this.getInstructions(this.props.currentActivity.status)}
        {/* <div>Session code: {this.props.match.params.code}</div> */}
        <button className="bigscreen-button" onClick={() => this.advanceActivity(this.props.currentActivity)}>Skip to activity</button>
      </div>
    );
  }

  render() {
    if (!this.props.session) return "TODO: Loading component";
    return (
      <div>
        <div id="inner">
        {this.renderInfo()}
        </div>
      </div>
    )
  }
}


export default withTracker((props) => {
  const { code } = props.match.params;
  const session = Sessions.findOne({code});
  if (!session) return {};
  const activities = Activities.find({session_id: session._id}).fetch();
  const currentActivity = Activities.findOne({session_id: session._id, status: { $in: [1, 2, 3, 4] }}, { sort: { status: 1 }});
  return {session, activities, currentActivity};
})(SessionProgress);
