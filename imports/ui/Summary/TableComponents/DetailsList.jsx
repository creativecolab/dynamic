import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './DetailsList.scss';

export default class DetailsList extends Component {

  static proptypes = {
    questions: PropTypes.array.isRequired
  }

  constructor(props) {
    super(props);
    this.state = ({
      show: false
    });
  }

  showClicked() {
    this.setState({
      show: true
    });
  }

  hideClicked() {
    this.setState({
      show: false
    });
  }

  render() {
    var questionComponents = [];

    //TODO
    const max = 3;

    for (var i = 0; i < this.props.questions.length && i < max; i++) {
      questionComponents.push(
        <div key={i} className="question-detail-container">
          <div className="question-label">{this.props.questions[i].question.label}</div>
          <p>{this.props.questions[i].question.prompt}</p>
        </div>
      );
    }

    const { shape, color } = this.props.team;

    if (this.state.show) {
      return (
        <div>
          <div className="details-container">
            <div className="details-shape-container">
              <img src={`/shapes/${shape}-solid-${color}.jpg`}></img>
            </div>
            <div className="question-summary">
              <h1>
                Questions
              </h1>
              {questionComponents}
            </div>
          </div>
          <div className="showhide-details" onClick={() => this.hideClicked()}>
            <svg height="10" width="30">
              <line x1="0" y1="10" x2="15" y2="0" style={{ "stroke": "rgb(0,0,0)", "strokeWidth": "1" }} />
              <line x1="30" y1="10" x2="15" y2="0" style={{ "stroke": "rgb(0,0,0)", "strokeWidth": "1" }} />
            </svg>
            <div>
              Close Details
            </div>
          </div>
        </div>
      );
    }
    else {
      return (
        <div>
          <div className="showhide-details" onClick={() => this.showClicked()}>
            Show Details
          </div>
        </div>
      );
    }

  }
}