import React, { Component } from 'react'
import PropTypes from 'prop-types'
import './PictureContent.scss';

export default class PictureContent extends Component {
  static propTypes = {
    title: PropTypes.string,
    hasDescrip: PropTypes.bool,
    descrip: PropTypes.string,
    hasImage: PropTypes.bool,
    imageSrc: PropTypes.string,
    hasSubtitle: PropTypes.bool,
    subtitle: PropTypes.string,
    children: PropTypes.node
    //   hasImage
    //   title
    //   subtitle (optional)
    //   children (optional)
    // 
  }

  static defaultProps = {
    subtitle: ''
  };

  //<PictureContent hasInstructions={false} ><ReactSwipe></ReactSwipe></PictureContent>

  render() {
    const { title } = this.props;
    const { hasDescrip, descrip } = this.props;
    const { hasImage, imageSrc } = this.props;
    const { hasSubtitle, subtitle } = this.props;
    const { children } = this.props;

    return (
      <div className="pic-content-main">
        <div className="title">{title}
          {hasDescrip &&
            <div className="descrip">
              {descrip}
            </div>
          }
          {hasImage &&
            <img className="image" src={imageSrc} alt="" />
          }
          {hasSubtitle &&
            <div className="subtitle">
              {subtitle}
            </div>
          }
        </div>
        <div className="children">
          {children}
        </div>
      </div>
    );
  }
}

// size set w: 30vw
// height h: jw
// content height
// elements: parent 
