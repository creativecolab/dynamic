import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TextInput.scss';

export default class TextInput extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
    placeholder: PropTypes.string,
    invalid: PropTypes.bool,
    invalidMsg: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func
  };

  static defaultProps = {
    invalid: false,
    invalidMsg: 'Invalid input',
    placeholder: 'Placeholder',
    label: 'Label',
    onSubmit: () => { }
  };

  handleSubmit(evt) {
    const { onSubmit } = this.props;

    if (evt.key === 'Enter') onSubmit(evt);
  };

  render() {
    const { name, value, label, placeholder, invalid, invalidMsg, onChange } = this.props;

    return (
      <div className="field-container">
        <label className="field-title" htmlFor={name}>
          {label}
          <div className="input-container">
            <input
              className={'input-text' + (invalid ? ' invalid' : '')}
              type="text"
              name={name}
              placeholder={placeholder}
              value={value}
              onChange={evt => onChange(evt)}
              onKeyPress={evt => this.handleSubmit(evt)}
            />
            {invalid && <span className="input-message">{invalidMsg}</span>}
          </div>
        </label>
      </div>
    );
  }

}

  // TextInput.propTypes = {
  //   name: PropTypes.string.isRequired,
  //   value: PropTypes.string.isRequired,
  //   label: PropTypes.string,
  //   placeholder: PropTypes.string,
  //   invalid: PropTypes.bool,
  //   invalidMsg: PropTypes.string,
  //   onChange: PropTypes.func.isRequired,
  //   onSubmit: PropTypes.func
  // };

  // TextInput.defaultProps = {
  //   invalid: false,
  //   invalidMsg: 'Invalid input',
  //   placeholder: 'Placeholder',
  //   label: 'Label',
  //   onSubmit: () => { }
  // };

  // export default TextInput;
