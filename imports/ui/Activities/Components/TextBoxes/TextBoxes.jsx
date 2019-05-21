import React, { Component } from 'react'
import PropTypes from 'prop-types'
import TextBox from '../../../Components/TextBox/TextBox';
import { Random } from 'meteor/random';

import './TextBoxes.scss';

export default class TextBoxes extends Component {
  static propTypes = {
    prompt: PropTypes.string,
    boxes: PropTypes.arrayOf(PropTypes.shape({
      label: PropTypes.string,
      text: PropTypes.string.isRequired,
    }).isRequired).isRequired,
  }

  renderTextBoxes({ boxes }) {
    return boxes.map(box => {
      return (
        <TextBox label={box.label} key={Random.id()}>
          {box.text}
        </TextBox>
      );
    });
  }

  render() {
    const { prompt } = this.props;
    return (<div className="textboxes-main">
      {prompt && <div className="textboxes-prompt">
        {prompt}
      </div>}
      <div className="textboxes-boxes">
        {this.renderTextBoxes(this.props)}
      </div>
    </div>);
  }
}
