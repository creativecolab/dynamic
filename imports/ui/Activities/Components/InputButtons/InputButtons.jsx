import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Button from '/imports/ui/Components/Button/Button';

import './InputButtons.scss';

export default class InputButtons extends Component {
  static propTypes = {
    prompt: PropTypes.string.isRequired,
    options: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired
      }).isRequired
    ).isRequired,
    handleSelection: PropTypes.func.isRequired,
    list: PropTypes.bool,
    freeze: PropTypes.bool,
    selected: PropTypes.string,
    shuffle: PropTypes.bool
  };

  static defaultProps = {
    selected: null,
    shuffle: false,
    list: false,
    freeze: false
  };

  constructor(props) {
    super(props);
    this.state = {
      selected: props.selected
    };
  }

  handleSelection(id) {
    this.props.handleSelection(id);

    if (this.props.freeze) return;

    this.setState({
      selected: id
    });
  }

  getLetter(list, index) {
    if (!list) return '';

    switch (index) {
      case 0:
        return 'A. ';
      case 1:
        return 'B. ';
      case 2:
        return 'C. ';
      case 3:
        return 'D. ';
      default:
        return '';
    }
  }

  renderButtons({ options, list, freeze }) {
    const { selected } = this.state;

    return options.map((opt, index) => {
      return (
        <Button
          onClick={() => this.handleSelection(opt.id)}
          active={opt.id === selected}
          disabled={freeze}
          order={this.getLetter(list, index)}
          key={opt.id}
        >
          {opt.text}
        </Button>
      );
    });
  }

  render() {
    const { prompt } = this.props;

    return (
      <div className="input-main">
        <div className="input-prompt">{prompt}</div>
        <div className="input-btns">{this.renderButtons(this.props)}</div>
      </div>
    );
  }
}
