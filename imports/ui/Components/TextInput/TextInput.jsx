import React from 'react';
import PropTypes from 'prop-types';

import './TextInput.scss';

function TextInput(props) {
  const { name, value, label, onChange } = props;
  const { invalid, invalidMsg } = props;

  return (
    <div className="field-container">
      <label className="field-title" htmlFor={name}>
        Session code:
        <div className="input-container">
          <input
            className={'input-text' + (invalid ? ' invalid' : '')}
            type="text"
            name={name}
            placeholder={label}
            value={value}
            onChange={evt => onChange(evt)}
          />
          {invalid && <span className="invalid-input-message">{invalidMsg}</span>}
        </div>
      </label>
    </div>
  );
}

TextInput.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
  label: PropTypes.string,
  invalid: PropTypes.bool.isRequired,
  invalidMsg: PropTypes.string,
  onChange: PropTypes.func.isRequired
};

TextInput.defaultProps = {
  invalidMsg: 'Invalid input',
  label: 'Label'
};

export default TextInput;
