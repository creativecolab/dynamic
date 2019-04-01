import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Responses from '../../../../../api/responses';
import Activities from '../../../../../api/activities';

import './ResponsesHandler.scss';

export default class ResponsesHandler extends Component {
  // static propTypes = {
  // }

  constructor(props) {
    super(props);

    // only get responses of the same type of activity
    const activity_type = Activities.findOne(props.activity_id).name;

    // get prev responses for this session
    const prevResponses = Responses.findOne({pid: props.pid, session_id: props.session_id, activity_type}, {sort: {timestamp: -1}});

    // set state with previous values, if they exist
    if (!prevResponses) {
      this.state = {
        truth1: '',
        truth2: '',
        lie: ''
      };
    } else {
      this.state = {
        truth1: prevResponses.truth1,
        truth2: prevResponses.truth2,
        lie: prevResponses.lie
      };
    }
  }

  handleTruth1(evt) {
    this.setState({
      truth1: evt.target.value
    });
  }

  handleTruth2(evt) {
    this.setState({
      truth2: evt.target.value
    });
  }

  handleLie(evt) {
    this.setState({
      lie: evt.target.value
    });
  }

  saveReponses(evt) {
    evt.preventDefault();
    console.log(JSON.stringify(this.state));

    Responses.insert({
      pid: this.props.pid,
      timestamp: new Date().getTime(),
      session_id: this.props.session_id,
      activity_id: this.props.activity_id,
      activity_type: Activities.findOne(this.props.activity_id).name,
      ...this.state
    });
  }

  render() {
    return (
      <div>
        <h3 id="navbar">Dynamic</h3>
        <h2>Please enter two truths and one lie about yourself to share with your team. Feel free to update your responses.</h2>
        <form id="icebreaker-form" onSubmit={(evt) => this.saveReponses(evt)}>
          <div id="icebreaker" className="field-container">
            <label className="field-title" htmlFor="truth">Truths:</label>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="truth1" placeholder="i.e., I am taking DSGN 100"  value={this.state.truth1} onChange={(evt) => this.handleTruth1(evt)}/>
            </div>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="truth2" placeholder="i.e., I go to UCSD"  value={this.state.truth2} onChange={(evt) => this.handleTruth2(evt)}/>
            </div>
            <label className="field-title" htmlFor="lies" id= "lies">Lie:</label>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="lie" placeholder="i.e., I have been to Mexico"  value={this.state.lie} onChange={(evt) => this.handleLie(evt)}/>
            </div>
            <input id="next_button" type="submit" value="Save"/>
          </div>
        </form>
      </div>
    )
  }
}
