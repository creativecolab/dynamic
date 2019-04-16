import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { withTracker } from 'meteor/react-meteor-data';

import Activities from '../../../api/activities';
import Quiz from '../../Activity/Components/Quiz/Quiz';

class ActivityHandler extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    progress: PropTypes.number.isRequired,
    activity_id: PropTypes.string.isRequired,
  }

  // set duration based on activity status and session progress
  calculateDuration(activity, progress) {

    // get activity status
    const { status } = activity;

    // get durations
    const { durationIndv, durationOffsetIndv} = activity;
    const { durationTeam, durationOffsetTeam} = activity;

    // individual input phase
    if (status === 1)
        return progress === 1? durationIndv : durationIndv - durationOffsetIndv;

    // team formation phase
    if (status === 2 || status === 4)
      return -1;

    // team input phase
    if (status === 3)
        return progress === 1? durationTeam : durationTeam - durationOffsetTeam;
      
  }

  render() {

    // get props from parent
    const { activity_id, pid, progress } = this.props;

    // get activity object from withTracker
    const { activity } = this.props;

    // an activity id is required from parent
    if (!activity_id) return "TODO: No Activity Component, should never be here";

    // waiting for data
    if (!activity) return "TODO: Loading... component";

    // get activity props
    const { name, status, statusStartTime } = activity;
    
    // calculate duration
    const duration = this.calculateDuration(activity);

    // render by activity name
    if (name === "quiz") {
      return <Quiz
        pid={pid}
        status={status}
        statusStartTime={statusStartTime}
        progress={progress}
        duration={duration}
      />;
    }
  }
}

// updates component when activity changes
export default withTracker(props => {
  //TODO: const activity = Activities.findOne(props.activity_id);

  // mock activity, TODO: make sure to add these fields to db
  const activity = {
    status: 1,
    name: 'quiz',
    statusStartTime: new Date().getTime(),
    durationIndv: 20,
    durationTeam: 30,
    durationOffsetIndv: 10,
    durationOffsetTeam: 5,
  }

  return { activity };
})(ActivityHandler);

