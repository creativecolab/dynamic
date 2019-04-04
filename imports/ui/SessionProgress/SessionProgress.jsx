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

      console.log("Activity status of " + this.props.currentActivity.name + " advanced to " + currStatus + 1);

      Activities.update(this.props.currentActivity._id, {
        $set: { status: currStatus + 1 }
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

  getInstructions(status) {
    if (status === 1) {
      return (
        <div>
          <Clock end_time={(new Date().getTime() + 60*1000)} />
          <h1>Write TWO truths and ONE lie about yourself!</h1>
        </div>
      )
    }
    if (status === 2) {
      return <TeamShapes skip={this.advanceActivity} activity_id={this.props.currentActivity._id}/>
    }
    if (status === 3) {
      return (
        <div>
          <Clock end_time={(new Date().getTime() + 120*1000)} />
          <h1>Try to guess the LIE!</h1>
        </div>
      )
    }
    if (status === 4) {
      return <h1>Stats page</h1>
    }
  }

  renderInfo() {
    const { session } = this.props;
    if (!session) return "Oh.";

    if (session.status === 2) return <SessionEnd />;

    if (session.status === 0) return (<div>
      <h1>Go to <u>tinyurl.com/dsgn100dynamic</u></h1>
      <h1>Session code: {this.props.match.params.code}</h1>
      <div id="status">Ready to begin</div>
      <ol>
        {this.mapActivities()}
      </ol>
      {session.participants.length > 0 && <div>
        Just joined:
        <ul>
          {session.participants.reverse().map((pid, index) => (index < 4)? <li key={pid}>{Users.findOne({pid}).name}</li>: "")}
        </ul>
      </div>} 
      <button onClick={() => this.startSession()}>Begin</button>
    </div>);

    if (!this.props.currentActivity) return "You should add activities"

    if (session.status === 1) return (
      <div>
        {/* <div>{this.props.currentActivity.name}</div> */}
        {this.getInstructions(this.props.currentActivity.status)}
        {/* <div>Session code: {this.props.match.params.code}</div> */}
        <button onClick={() => this.advanceActivity(this.props.currentActivity)}>Skip to activity</button>
      </div>
    );
  }

  render() {
    if (!this.props.session) return "TODO: Loading component";
    return (
      <Wrapper>
        <img className="dynamic-logo" src="/dynamic.png" alt="Dynamic"/>
        {/* <button onClick={() => this.edit()} id="back-button">edit</button> */}
        {this.renderInfo()}
      </Wrapper>
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
