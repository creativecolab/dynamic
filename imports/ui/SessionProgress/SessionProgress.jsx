import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../Wrapper/Wrapper';
import { withTracker } from 'meteor/react-meteor-data';

import './SessionProgress.scss';
import Activities from '../../api/activities';
import Sessions from '../../api/sessions';
import Users from '../../api/users';

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
    Sessions.update(this.props.session._id, {
      $set: {
        status: 1
      }
    });
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

  getInstructions(status) {
    if (status === 1) {
      return "Write TWO truths and ONE lie about yourself!";
    }
    if (status === 2) {
      return "Find your teammates!!";
    }
    if (status === 3) {
      return "Try to guess the LIE!";
    }
    if (status === 4) {
      return "Done!";
    }
  }

  renderInfo() {
    const { session } = this.props;
    if (!session) return "Oh.";

    if (session.status === 2) return <h1>The session is over! Please follow the link and fill out our survey! Thanks :)</h1>;

    if (session.status === 0) return (<div>
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
        <div>{this.props.currentActivity.name}</div>
        <h1>{this.getInstructions(this.props.currentActivity.status)}</h1>
        <div>Session code: {this.props.match.params.code}</div>
      </div>
    );
  }

  render() {
    if (!this.props.session) return "TODO: Loading component";
    return (
      <Wrapper>
        <button onClick={() => this.edit()} id="back-button">edit</button>
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
  const currentActivity = Activities.findOne({session_id: session._id, status: { $in: [1, 2, 3] }}, { sort: { status: 1 }});
  return {session, activities, currentActivity};
})(SessionProgress);
