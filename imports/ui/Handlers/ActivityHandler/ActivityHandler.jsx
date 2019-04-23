import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Activities from '/imports/api/activities';
import Quiz from '/imports/ui/Activities/Quiz/Quiz';
import ActivityEnums from '/imports/enums/activities';
import Loading from '../../Components/Loading/Loading';

class ActivityHandler extends Component {
  static propTypes = {
    activity_id: PropTypes.string,
    pid: PropTypes.string.isRequired,
    sessionLength: PropTypes.number,
  }

  // set duration based on activity status and session progress
  calculateDuration(activity, progress) {

    // get activity status
    const { status } = activity;

    // get durations
    const { durationIndv, durationOffsetIndv} = activity;
    const { durationTeam, durationOffsetTeam} = activity;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
        return progress === 1? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return progress === 1? durationTeam : durationTeam - durationOffsetTeam;
    
    return -1;
    
  }

  render() {

    // get props from parent
    const { activity_id, pid, sessionLength, statusStartTime } = this.props;

    // get activity object from withTracker
    const { activity } = this.props;

    // an activity id is required from parent
    if (!activity_id) return <Loading />;

    // waiting for data
    if (!activity) return <Loading />;

    // get activity props
    const { _id, name, status } = activity;

    // calculate progress
    const progress = activity.index + 1;
    
    // calculate duration
    const duration = this.calculateDuration(activity, progress);

    // render by activity name
    if (name === ActivityEnums.name.QUIZ) {
      return <Quiz
        pid={pid}
        activity_id={_id}
        status={status}
        statusStartTime={statusStartTime}
        sessionLength={sessionLength}
        progress={progress}
        duration={duration}
      />;
    }
  }
}

// updates component when activity changes
export default withTracker(props => {
  const activity = Activities.findOne(props.activity_id);
  let statusStartTime = new Date().getTime();
  if (activity)
    statusStartTime = activity.statusStartTime;
  return { activity, statusStartTime };
})(ActivityHandler);

