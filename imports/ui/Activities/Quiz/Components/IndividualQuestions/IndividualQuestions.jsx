import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputButtons from '../../../Components/InputButtons/InputButtons';
import ActivityEnums from '../../../../../enums/activities';
import TextInput from '../../../../Components/TextInput/TextInput';
import './IndividualQuestions.scss';

export default class IndividualQuestions extends Component {
  static propTypes = {
    questions: PropTypes.array,
    responses: PropTypes.array
  };

  static defaultProps = {
    questions: [],
    responses: []
  };

  state = {
    index: 0,
    responses: this.props.responses || this.props.questions.map(() => '')
  };

  handleMC = selected => {
    // this.props.done(selected);
    const { index, responses } = this.state;

    // update response
    responses[index] = selected;

    this.setState(prevState => ({
      index: prevState.index + 1
    }));
  };

  handleFR = evt => {
    const { index, responses } = this.state;

    responses[index] = evt.target.value;

    this.setState({
      responses
    });

    this.props.done(responses);
  };

  render() {
    const { questions } = this.props;
    const { index, responses } = this.state;

    if (!questions) return 'No questions!';

    let question = null;

    try {
      question = questions[index];
    } catch (error) {
      return JSON.stringify(error);
    }

    const selected = responses[index];

    if (question.type === ActivityEnums.quiz.MULTI_CHOICE) {
      return (
        <InputButtons
          prompt={question.prompt}
          handleSelection={this.handleMC}
          list
          selected={selected}
          options={question.options}
        />
      );
    }

    return (
      <div className="fr-main">
        <TextInput
          name="fr-q"
          value={selected}
          label={question.prompt}
          onChange={this.handleFR}
          placeholder="Your answer"
        />
      </div>
    );
  }
}
