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

  enterIdea(evt) {
    evt.preventDefault();
  }

  render() {
    return (
      <div>
        <form id="icebreaker-form" onSubmit={(evt) => this.enterIdea(evt)}>
          <div id="icebreaker" className="field-container">
            {this.renderUsernameTaken()}
            <label className="field-title" htmlFor="truth">Truth:</label>
            <div className="input-container">
              <input className="u-container" type="text" name="truth" placeholder="i.e., I have been to Mexico"  value={this.state.truth} onChange={(evt) => this.handleTruth(evt)}/>
            </div>
            <input id="next_button" type="submit" value="Continue"/>
          </div>
        </form>
      </div>
    )
  }
}
