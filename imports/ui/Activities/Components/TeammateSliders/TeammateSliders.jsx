import React, { Component } from 'react';
import PropTypes from 'prop-types';
// import Slider from '@material-ui/lab/Slider';
import { Slider, Icon } from 'antd/lib';
import 'antd/lib/slider/style/css';
import 'antd/lib/icon/style/css';
// import 'antd/dist/antd.css';

// import Typography from '@material-ui/core/Typography';

import Teams from '../../../../api/teams';
import Users from '../../../../api/users';
import '../../../assets/_main.scss';
import './TeammateSliders.scss';
import Button from '../../../Components/Button/Button';
import PictureContent from '../../../Components/PictureContent/PictureContent';

export default class TeammateSliders extends Component {
  static propTypes = {
    pid: PropTypes.string.isRequired,
    team_id: PropTypes.string.isRequired,
    handleChosen: PropTypes.func
  };

  constructor(props) {
    super(props);
    const { pid, team_id } = props;
    const team = Teams.findOne(team_id);
    const user = Users.findOne(
      { pid, 'preference.activity_id': team.activity_id },
      { sort: { 'preference.timestamp': 1 } }
    );

    if (user) {
      this.props.handleChosen();
      const teammates = team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 3 }));

      this.state = {
        teammates
      };
    } else {
      const teammates = team.members.filter(m => m.pid !== pid).map(m => ({ pid: m.pid, value: 3 }));

      this.state = {
        teammates
      };
    }
  }

  handleVote = () => {
    const { pid, team_id } = this.props;
    const team = Teams.findOne(team_id);

    const user = Users.findOne({ pid });

    Users.update(
      user._id,
      {
        $push: {
          preference: {
            values: this.state.teammates,
            activity_id: team.activity_id,
            timestamp: new Date().getTime()
          }
        }
      },
      error => {
        if (error) {
          console.log(error);
        } else {
          console.log(this.state.teammates);
          this.props.handleChosen();
        }
      }
    );
  };

  getName(pid) {
    return Users.findOne({ pid }).name;
  }

  handleChange = (value, index) => {
    const { teammates } = this.state;

    teammates[index].value = value;
    this.setState({
      teammates
    });
    console.log(teammates);
  };

  getLabel(value) {
    switch (value) {
      case 0:
        return 'Nope';
      case 1:
        return 'Unlikely';
      case 2:
        return 'Somewhat unlikely';
      case 3:
        return 'Neutral';
      case 4:
        return 'Somewhat likely';
      case 5:
        return 'Likely';
      case 6:
        return 'Yeah!';
    }
  }

  renderOptions() {
    const { teammates } = this.state; //team.members.filter(member => member.pid !== pid);

    const marks = {
      //0: this.getLabel(0),
      // 6: this.getLabel(6)
      0: {
        style: {
          color: '#F05D5E'
          // 'font-size': '18px'
        },
        label: <strong>{this.getLabel(0)}</strong>
      },
      1: {},
      2: {},
      3: this.getLabel(3),
      4: {},
      5: {},
      6: {
        style: {
          color: '#00DD90'
          // 'font-size': '18px'
        },
        label: <strong>{this.getLabel(6)}</strong>
      }
    };

    return teammates.map((mate, index) => (
      <div key={mate.pid}>
        <div className="slider-label">
          <strong>{this.getName(mate.pid)}</strong>
        </div>
        <div className="icon-wrapper">
          <Icon type="frown-o" />
          <Slider
            value={teammates[index].value}
            marks={marks}
            // tooltipVisible
            tipFormatter={this.getLabel}
            defaultValue={30}
            min={0}
            max={6}
            step={1}
            onChange={value => this.handleChange(value, index)}
          />
          <Icon type="smile-o" />
        </div>
      </div>
    ));
  }

  render() {
    return (
      <>
        <div className="end-main">
          <div className="slider-instructions">Rate how likely you are to work with these members again:</div>
          <div>{this.renderOptions()}</div>
        </div>
        <Button onClick={this.handleVote}>Submit</Button>
      </>
    );
  }
}
