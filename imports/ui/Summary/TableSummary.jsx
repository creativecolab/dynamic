import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Button from '../Components/Button/Button';

import './TableSummary.scss';

export default class TableSummary extends Component {

  static propTypes = {
    preferences: PropTypes.array
  };


  render() {
    return (
      <div id="center-container">
        <div>
          <h2>Table Summary</h2>
        </div>
        <div>
          <img id="small-logo" src="./dynamic.gif" alt="" />
        </div>
      </div>
    );
  }
}
