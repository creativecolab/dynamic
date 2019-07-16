import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from 'meteor/react-meteor-data';

import Users from '../../../api/users';
import Sessions from '../../../api/sessions';

import Loading from '../../Components/Loading/Loading'

import './SessionBegin.scss';

class SessionBegin extends Component {

  static propTypes = {
    session_id: PropTypes.string.isRequired,
  };

  render() {

    if (!this.props.session) return <Loading />;

    const { session } = this.props;

    const numJoined = session.participants.length;

    return (
      <div>
        <img className="contentPic" src="/dynamic.gif" alt="" />
        <div className="joinees">
          {numJoined && <h2>{Users.findOne({ pid: session.participants[numJoined - 1] }).name + ' just joined!'}</h2>}
        </div>
      </div >
    );
  }

}

export default withTracker(props => {
  const { session_id } = props;

  const session = Sessions.findOne({ session_id });

  return { session };
})(SessionBegin);
