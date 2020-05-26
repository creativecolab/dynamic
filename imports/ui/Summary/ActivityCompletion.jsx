import React, { Component } from 'react';

import './ActivityCompletion.scss';

export default class ActivityCompletion extends Component {

  render() {
    return (
      <div id="center-container">
        <div>
          <h2>You're all done with the Activities!</h2>
          <img id="small-logo" src="./dynamic.gif" alt="" />
          <h2>Click the button below to view your Session Summary.</h2>
        </div>
      </div>
    );
  }
}
