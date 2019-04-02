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
        lie: '',
        saved: false
      };
    } else {
      this.state = {
        truth1: prevResponses.options[0].text,
        truth2: prevResponses.options[1].text,
        lie: prevResponses.options[2].text,
        saved: false
      };
    }
  }

  handleTruth1(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      truth1: evt.target.value
    });
  }

  handleTruth2(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      truth2: evt.target.value
    });
  }

  handleLie(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      lie: evt.target.value
    });
  }

  saveReponses(evt) {
    evt.preventDefault();
    console.log(JSON.stringify(this.state));

    this.setState({
      saved: true
    });

    Responses.insert({
      pid: this.props.pid,
      timestamp: new Date().getTime(),
      session_id: this.props.session_id,
      activity_id: this.props.activity_id,
      activity_type: Activities.findOne(this.props.activity_id).name,
      options: [{text: this.state.truth1, lie: false, votes: []},
                {text: this.state.truth2, lie: false, votes: []},
                {text: this.state.lie, lie: true, votes: []}]
    });
  }

  renderSaved = () => {
    if (this.state.saved) {
      return <p style={{color:"green"}}>Saved!</p>
    }
  }

  // clear tick when not rendered
  componentWillUnmount() {
    clearTimeout(this.timer);
  }

  componentDidUpdate(){
    this.timer = setTimeout(() => this.setState({saved: false}), 5000);
  }

  render() {
    return (
      <div>
        <h3 id="navbar">Dynamic</h3>
        <h2 id="paddingh">Please enter two truths and one lie about yourself to share with your team. Feel free to update your responses.</h2>
        <form id="icebreaker-form" onSubmit={(evt) => this.saveReponses(evt)}>
          <div id="icebreaker" className="field-container">
            <label className="field-title" htmlFor="truth">Truths:</label>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="truth1" placeholder="i.e., I used to do improv"  value={this.state.truth1} onChange={(evt) => this.handleTruth1(evt)}/>
            </div>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="truth2" placeholder="i.e., I snore in my sleep"  value={this.state.truth2} onChange={(evt) => this.handleTruth2(evt)}/>
            </div>
            <label className="field-title" htmlFor="lies" id= "lies">Lie:</label>
            <div className="input-container">
              <input id="input-container" className="u-container" type="text" name="lie" placeholder="i.e., I have been to Mexico"  value={this.state.lie} onChange={(evt) => this.handleLie(evt)}/>
            </div>
            <input id="next_button" type="submit" value="Save"/>
            {this.renderSaved()}
          </div>
        </form>
      </div>
    )
  }
}
