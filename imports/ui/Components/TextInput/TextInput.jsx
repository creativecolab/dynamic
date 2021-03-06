import React, { Component } from 'react';
import PropTypes from 'prop-types';
import './TextInput.scss';
import Button from '../Button/Button';

export default class TextInput extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    value: PropTypes.string.isRequired,
    label: PropTypes.string,
    labelPos: PropTypes.string,
    placeholder: PropTypes.string,
    invalid: PropTypes.bool,
    invalidMsg: PropTypes.string,
    onChange: PropTypes.func.isRequired,
    onSubmit: PropTypes.func,
    hasButton: PropTypes.bool
  };

  static defaultProps = {
    invalid: false,
    invalidMsg: 'Invalid input',
    placeholder: 'Placeholder',
    label: 'Label',
    labelPos: 'center',
    hasButton: false,
    onSubmit: () => { }
  };

  handleSubmit(evt) {
    const { onSubmit } = this.props;

    if (evt.key === 'Enter') onSubmit();
  }

  render() {
    const { name, value, label, labelPos, placeholder, invalid, invalidMsg, onSubmit, onChange, hasButton } = this.props;

    return (
      <div className="field-container">
        <label className="field-title" htmlFor={name}>
          <div style={{ textAlign: labelPos }}>
            {label}
          </div>
          <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', position: 'relative' }}>
            <div className="input-container">
              <input
                className={'input-text' + (invalid ? ' invalid' : '') + (hasButton ? ' with-btn' : '')}
                type="text"
                name={name}
                placeholder={placeholder}
                value={value}
                onChange={evt => onChange(evt)}
                onKeyPress={evt => this.handleSubmit(evt)}
              />
            </div>
            {hasButton && (
              <Button size="input-text" onClick={() => onSubmit()}>
                Go!
              </Button>
            )}
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
