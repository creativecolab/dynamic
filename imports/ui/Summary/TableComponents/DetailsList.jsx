import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
          <p>{this.props.questions[i].question}</p>
        </div>
      );
    }

    if (this.state.show) {
      return (
        <div className="question-summary">
          <div>
            {questionComponents}
          </div>
          <div className="showhide-details" onClick={() => this.hideClicked()}>
            Close Details
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="question-summary">
          <div className="showhide-details" onClick={() => this.showClicked()}>
            Show Details
          </div>
        </div>
      );
    }

  }
}