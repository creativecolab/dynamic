import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import ActivityHandler from '../ActivityHandler/ActivityHandler';

import Sessions from '../../../api/sessions';
import Activities from '../../../api/activities';

import ActivityEnums from '../../../enums/activities';
import SessionEnums from '../../../enums/sessions';

import Loading from '../../Components/Loading/Loading';
import Survey from '../../Components/Survey/Survey';
import OnboardingInstructions from '../../Activities/Components/OnboardingInstructions/OnboardingInstructions';
import { UserContext } from '../../Contexts/UserContext';

class SessionHandler extends Component {
  static propTypes = {
    location: PropTypes.shape({
      state: PropTypes.shape({
        pid: PropTypes.string
      })
    }),
    match: PropTypes.shape({
      params: PropTypes.shape({
        code: PropTypes.string.isRequired
      }).isRequired
    }).isRequired,
    activity: PropTypes.object,
    status: PropTypes.number,
    length: PropTypes.number
  };

  static defaultProps = {
    location: {
      state: {
        pid: null
      }
    }
  };

  constructor(props) {
    super(props);
    console.log(props);
  }

  render() {
    // check if user logged in
    const { pid } = this.props;

    if (!pid) return 'Please log in first!';

    // extract session props
    const { status, length } = this.props;

    // extract activity props
    const { activity } = this.props;

    if (status === SessionEnums.status.FINISHED) return <Survey />;

    if (status === SessionEnums.status.READY) return <OnboardingInstructions />;

    if (!activity) return <Loading />;

    if (status === SessionEnums.status.ACTIVE)
      return <ActivityHandler pid={pid} sessionLength={length} activity_id={activity._id} />;

    return <Loading />;
  }
}

SessionHandler.contextType = UserContext;

export default withTracker(props => {
  // get session code from URL
  const { code } = props.match.params;

  // user not logged in
  if (!props.location.state) return {};

  const { pid } = props.location.state;

  // get session object from URL
  const session = Sessions.findOne({ code });

  if (!session) return { pid };

  // get session status and progress
  const status = session.status;
  const length = session.activities.length;

  // get current activity in session
  const activity = Activities.findOne(
    {
      session_id: session._id,
      status: {
        $in: [
          ActivityEnums.status.INPUT_INDV,
          ActivityEnums.status.TEAM_FORMATION,
          ActivityEnums.status.INPUT_TEAM,
          ActivityEnums.status.SUMMARY
        ]
      }
    },
    { sort: { status: 1 } }
  );

  return { pid, status, length, activity };
})(SessionHandler);
