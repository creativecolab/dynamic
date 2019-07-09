import React from 'react';
import PropTypes from 'prop-types';

import './Card.scss';

function Card({ title, children, tag }) {
  return (
    <div className="card-main">
      <div className="card-title">
        <span className="card-tag">{tag}</span>
        {title}
      </div>
      <hr />
      <div className="card-content">{children}</div>
    </div>
  );
}

Card.propTypes = {
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  tag: PropTypes.string
};

Card.defaultProps = {
  tag: null
};

export default Card;
