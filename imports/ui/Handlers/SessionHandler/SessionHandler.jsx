import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ActivityHandler from '../ActivityHandler/ActivityHandler';
import Logs from '/imports/api/logs';
import Sessions from '/imports/api/sessions';
import LogEnums from '/imports/enums/logs';
import ActivityEnums from '/imports/enums/activities';
import SessionEnums from '/imports/enums/sessions';

class SessionHandler extends Component {
  static propTypes = {
    match: PropTypes.shape({
      params: PropTypes.shape({
        code: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
    pid: PropTypes.string.isRequired
  }

  render() {

    // check if user logged in
    const { pid } = this.props;
    if (!pid) return "TODO: Please login first."

    // extract session props
    const { status, progress } = this.props;

    // extract activity props
    const { activity_id } = this.props;

    // render based on session status
    if (status === SessionEnums.status.READY)
      return "TODO: Waiting for instructor to begin.";
    else if (status === SessionEnums.status.ACTIVE)
      return <ActivityHandler pid={pid} progress={progress} activity_id={activity_id} />;
    else if (status === SessionEnums.status.FINISHED)
      return "TODO: Session is over, survey page."
  }
}

export default withTracker(props => {

  // get session code rom URL
  const code = props.match.params.code;

  // get session object from URL
  const session = Sessions.findOne({code});

  // get session status
  let status = -1;
  if (session) {
    status = session.status;
  }

  // get current activity in session
  let activity = null;
  try {
    activity = Activities.findOne({session_id: session._id, status: {
      $in: [
        ActivityEnums.status.READY,
        ActivityEnums.status.INPUT_INDV,
        ActivityEnums.status.TEAM_FORMATION,
        ActivityEnums.status.INPUT_TEAM
      ]
    }}, { sort: { status: 1 }});
  } catch (error) {
    const text = "No session code " + code;
    Logs.insert({
      type: LogEnums.WARNING,
      text,
      timestamp: new Date().getTime(),
    }, () => {
      console.log(text);
    });
  }

  // extract _id and progress here so the Component doesn't update unnecessarily
  let activity_id = null;
  let progress = -1;
  try {
    activity_id = activity._id;
    progress = activity.index + 1;
  } catch (error) {
    console.log(error);
  }

  return { status, progress, activity_id };

})(SessionHandler);