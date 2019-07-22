import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Textfit } from 'react-textfit';

import './PictureContent.scss';

export default class PictureContent extends Component {
  static propTypes = {
    title: PropTypes.string,
    hasDescrip: PropTypes.bool,
    descrip: PropTypes.string,
    imageSrc: PropTypes.string,
    hasSubtitle: PropTypes.bool,
    subtitle: PropTypes.string,
    children: PropTypes.node
  };

  static defaultProps = {
    hasDescrip: false,
    subtitle: '',
    desc: ''
  };

  render() {
    const { title } = this.props;
    const { desc } = this.props;
    const { imageSrc } = this.props;
    const { subtitle } = this.props;
    const { children } = this.props;

    return (
      <div className="pic-content-main">
        <div className="pic-title">{title}</div>
        <div className="pic-desc">{desc}</div>
        <img className="pic-image" src={imageSrc} alt="" />
        <div className="subtitle">{subtitle}</div>
        {/* <Textfit className="subtitle" max={24}>
          {subtitle}
        </Textfit> */}
        {children}
      </div>
    );
  }
}
