import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Responses from '../../../../../api/responses';
import Activities from '../../../../../api/activities';

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
        truth: '',
        lie1: '',
        lie2: ''
      };
    } else {
      this.state = {
        truth: prevResponses.truth,
        lie1: prevResponses.lie1,
        lie2: prevResponses.lie2
      };
    }
  }

  handleTruth(evt) {
    this.setState({
      truth: evt.target.value
    });
  }

  handleLie1(evt) {
    this.setState({
      lie1: evt.target.value
    });
  }

  handleLie2(evt) {
    this.setState({
      lie2: evt.target.value
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
        <h2>Please enter one lie and two truths about yourself to share with your team. Feel free to update your responses.</h2>
        <form id="icebreaker-form" onSubmit={(evt) => this.saveReponses(evt)}>
          <div id="icebreaker" className="field-container">
            <label className="field-title" htmlFor="truth">Truth:</label>
            <div className="input-container">
              <input className="u-container" type="text" name="truth" placeholder="i.e., I have been to Mexico"  value={this.state.truth} onChange={(evt) => this.handleTruth(evt)}/>
            </div>
            <label className="field-title" htmlFor="lie1">Lies:</label>
            <div className="input-container">
              <input className="u-container" type="text" name="lie1" placeholder="i.e., I have been to Mexico"  value={this.state.lie1} onChange={(evt) => this.handleLie1(evt)}/>
            </div>
            <div className="input-container">
              <input className="u-container" type="text" name="lie2" placeholder="i.e., I have been to Mexico"  value={this.state.lie2} onChange={(evt) => this.handleLie2(evt)}/>
            </div>
            <input id="next_button" type="submit" value="Save"/>
          </div>
        </form>
      </div>
    )
  }
}
