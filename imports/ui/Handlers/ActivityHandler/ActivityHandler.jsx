import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Activities from '../../../api/activities';
import Quiz from '../../Activities/Quiz/Quiz';
import ActivityEnums from '../../../enums/activities';
import Loading from '../../Components/Loading/Loading';
import TeamDiscussion from '../../Activities/TeamDiscussion/TeamDiscussion';

class ActivityHandler extends Component {
  static propTypes = {
    activity_id: PropTypes.string,
    // eslint-disable-next-line react/forbid-prop-types
    activity: PropTypes.object,
    pid: PropTypes.string.isRequired,
    sessionLength: PropTypes.number
  };

  static defaultProps = {
    activity_id: '',
    sessionLength: 0,
    activity: {}
  };

  // set duration based on activity status and session progress
  calculateDuration(activity, progress) {
    // get activity status
    const { status } = activity;

    // get durations
    const { durationIndv, durationOffsetIndv } = activity;
    const { durationTeam, durationOffsetTeam } = activity;

    // individual input phase
    if (status === ActivityEnums.status.INPUT_INDV)
      return progress === 1 ? durationIndv : durationIndv - durationOffsetIndv;

    // team input phase
    if (status === ActivityEnums.status.INPUT_TEAM)
      return progress === 1 ? durationTeam : durationTeam - durationOffsetTeam;

    return -1;
  }

  getStatusStartTime(status, times) {
    if (status === 1) return times.indvPhase;

    if (status === 2) return times.teamForm;

    if (status === 3) return times.teamPhase;

    if (status === 4) return times.peerAssessment;

    return 0;
  }

  render() {
    // get props from parent
    const { activity_id, pid, sessionLength, progress } = this.props;

    // get activity object from withTracker
    const { activity } = this.props;

    // an activity id is required from parent
    if (!activity_id) return <Loading />;

    // waiting for data
    if (!activity) return <Loading />;

    // get activity props
    const { name, status, statusStartTimes } = activity;

    const statusStartTime = this.getStatusStartTime(status, statusStartTimes);

    // // calculate progress
    // const progress = 1;

    // calculate duration
    const duration = this.calculateDuration(activity, progress);

    // render by activity name
    if (name === ActivityEnums.name.QUIZ) {
      return (
        <Quiz
          pid={pid}
          activity_id={activity_id}
          status={status}
          statusStartTime={statusStartTime}
          sessionLength={sessionLength}
          progress={progress}
          duration={duration}
        />
      );
    } else if (name === ActivityEnums.name.TEAM_DISCUSSION) {
      return (
        <TeamDiscussion
          pid={pid}
          activity_id={activity_id}
          status={status}
          statusStartTime={statusStartTime}
          sessionLength={sessionLength}
          progress={progress}
          duration={duration}
        />
      );
    }

    return <Loading />;
  }
}

// updates component when activity changes
export default withTracker(props => {
  const activity = Activities.findOne(props.activity_id);

  return { activity };
})(ActivityHandler);
