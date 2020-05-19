import React, { Component } from 'react';

import './ActivityCompletion.scss';

export default class ActivityCompletion extends Component {

  render() {
    return (
      <div id="center-container">
        <div>
          <h2>You're all done with Activities!</h2>
        </div>
        <div>
          <img id="small-logo" src="./dynamic.gif" alt="" />
        </div>
      </div>
    );
  }
}
