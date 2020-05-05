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
    for (var i = 0; i < this.props.questions.length; i++) {
      questionComponents.push(
        <div key={i}>
          <p>{this.props.questions[i].question}</p>
        </div>
      );
    }

    if (this.state.show) {
      return (
        <div className="question-summary">
          <div>
            <h4>Questions</h4>
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