import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Slider from '@material-ui/lab/Slider';
import { Slider, Icon } from 'antd/lib';
import 'antd/lib/slider/style/css';
import 'antd/lib/icon/style/css';
// import 'antd/dist/antd.css';

// import Typography from '@material-ui/core/Typography';

import Users from '../../../../api/users';
import '../../../assets/_main.scss';
import './TeammateSliders.scss';
import { action } from 'popmotion';

export default class TeammateSliders extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    activity_id: PropTypes.string.isRequired,
    teammates: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
    progress: PropTypes.number.isRequired,
    session: PropTypes.string.isRequired
  };

  getName(pid) {
    return Users.findOne({ pid }).name;
  }

  getLabel(value) {
    switch (value) {
      case 0:
        return 'Not well at all';
      case 1:
        return 'Slightly well';
      case 2:
        return 'Moderately well';
      case 3:
        return 'Very well';
      case 4:
        return 'Extremely well';
    }
  }

  renderOptions() {
    const { handleChange, teammates } = this.props;

    const marks = {
      0: {
        style: {
          color: '#F05D5E'
        },
        label: <strong>{this.getLabel(0)}</strong>
      },
      1: {},
      2: this.getLabel(),
      3: {},
      4: {
        style: {
          color: '#00DD90'
        },
        label: <strong>{this.getLabel(4)}</strong>
      }
    };

    return teammates.map((mate, index) => (
      <div key={mate.pid}>
        <div className="slider-label">
          <div>{this.getName(mate.pid)}</div>
        </div>
        <div className="icon-wrapper">
          <Icon type="frown-o" />
          <Slider
            value={teammates[index].value}
            marks={marks}
            // tooltipVisible
            tipFormatter={this.getLabel}
            // defaultValue={30}
            min={0}
            max={4}
            step={1}
            onChange={value => handleChange(value, index)}
          />
          <Icon type="smile-o" />
        </div>
      </div>
    ));
  }

  render() {
    return (
      <div>
        <div className="slider-instructions">To what extent did you get to know your groupmates?</div>
        <div className="slider-subinstructions">
          Use the <strong>sliders</strong> to set your response.
        </div>
        <div>{this.renderOptions()}</div>
      </div>
    );
  }

  componentWillUnmount() {
    //when the component is unmounting, save whatever the user has done on the slider if they haven't submitted
    const { pid, activity_id, teammates, session, round } = this.props;

    const user = Users.findOne({ pid });

    const voted = user.preferences.filter(pref => pref.activity_id == activity_id).length === 1;

    console.log("unmounting teammate sliders for ", user._id, this.props);
    // if the user already voted, we don't need to save their preferences
    if (voted) return;

    console.log("updating teammate sliders");

    Users.update(
      user._id,
      {
        $push: {
          preferences: {
            values: teammates,
            activity_id,
            team: this.props.team_id,
            timestamp: new Date().getTime(),
            shareEmail: false,
            round: round,
            session: session,
            noSubmit: true
          }
        }
      },
      error => {
        if (error) {
          console.log(error);
        } else {
          console.log('Submitted preferences after the sliders unmounted');
        }
      }
    );
  }
}
