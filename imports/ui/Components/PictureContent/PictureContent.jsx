import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';

import './PictureContent.scss';

function PictureContent(props) {
  const { title } = props;
  const { fitTitle } = props;
  const { desc } = props;
  const { imageSrc } = props;
  const { subtitle } = props;
  const { children } = props;

  return (
    <div className="pic-content-main">
      <div>
        {fitTitle ? (
          <Textfit mode="single" className="pic-title">
            {title}
          </Textfit>
        ) : (
          <div className="pic-title">{title}</div>
        )}
        <div className="pic-desc">{desc}</div>
        <img className="pic-image" src={imageSrc} alt="" />
        <div className="subtitle">{subtitle}</div>
      </div>
      <div>{children}</div>
    </div>
  );
}

PictureContent.propTypes = {
  title: PropTypes.string,
  fitTitle: PropTypes.bool,
  desc: PropTypes.string,
  imageSrc: PropTypes.string,
  subtitle: PropTypes.string
};

PictureContent.defaultProps = {
  fitTitle: false,
  subtitle: '',
  desc: ''
};

export default PictureContent;
