import React, { Component } from 'react';
import PropTypes from 'prop-types';
import InputButtons from '../../../Components/InputButtons/InputButtons';
import ActivityEnums from '../../../../../enums/activities';
import TextInput from '../../../../Components/TextInput/TextInput';
import './IndividualQuestions.scss';
import { Random } from 'meteor/random';

export default class IndividualQuestions extends Component {
  static propTypes = {
    questions: PropTypes.array,
    responses: PropTypes.array,
    index: PropTypes.number
  };

  static defaultProps = {
    questions: [],
    responses: [],
    index: 0
  };

  state = {
    responses: this.props.responses || this.props.questions.map(() => '')
  };

  handleMC = selected => {
    // this.props.done(selected);
    const { responses } = this.state;
    const { index, questions, done, next } = this.props;

    // update response
    responses[index] = selected;

    // this.setState(prevState => ({
    //   index: prevState.index + 1
    // }));
    if (questions.length === index + 1) done(responses);
    else next();
  };

  handleFR = evt => {
    const { responses } = this.state;
    const { index, questions, done, next } = this.props;

    responses[index] = { text: evt.target.value, id: Random.id() };

    this.setState({
      responses
    });

    if (questions.length === index + 1) done(responses);
    else next();
  };

  render() {
    const { index, questions } = this.props;
    const { responses } = this.state;

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
          value={selected.text || ''}
          label={question.prompt}
          onChange={this.handleFR}
          placeholder="Your answer"
        />
      </div>
    );
  }
}
