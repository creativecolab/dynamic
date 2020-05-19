import React, { Component } from 'react';
import './Survey.scss';

export default class Survey extends Component {
  render() {
    return (
      <div id="center-container">
        <div>
          <img id="small-logo" src="./dynamic.gif" alt="" />
        </div>
        <div>
          <h2>You're all done!</h2>
          {/* <h2> Thank you for using ProtoTeams!</h2> */}
          Please fill out our survey
        </div>
        <div className="btn-container">
          <a id="survey-button" href="https://forms.gle/JY3cEFfBy4SBfx6C6">
            Continue to survey
          </a>
        </div>
      </div>
    );
  }
}
