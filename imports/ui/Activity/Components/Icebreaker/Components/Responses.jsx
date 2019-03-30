import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../../../../Wrapper/Wrapper';

export default class Responses extends Component {
  static propTypes = {
  }

  constructor(props) {
    super(props);
    this.state = {
      truth: '',
      lie1: '',
      lie2: ''
    };
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

  enterIdea(evt) {
    evt.preventDefault();
    console.log(JSON.stringify(this.state));
  }

  render() {
    return (
      <div>
        <form id="icebreaker-form" onSubmit={(evt) => this.enterIdea(evt)}>
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
