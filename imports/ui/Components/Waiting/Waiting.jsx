import React from 'react';
import PropTypes from 'prop-types';
import './Waiting.scss';

function Waiting(props) {
  return (
    <div className="waiting-main">
      {props.text}
      <div>
        <img className="moving-logo" src="./dynamic.gif" alt="" />
      </div>
    </div>
  );
}

Waiting.propTypes = {
  text: PropTypes.string
};

Waiting.defaultProps = {
  text: 'Wait for your instructor to begin'
};

export default Waiting;
