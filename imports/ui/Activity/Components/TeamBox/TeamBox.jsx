import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Teams from '../../../../api/teams';
import Color from '../../../Color';

export default class TeamBox extends Component {
  static propTypes = {
    team_id: PropTypes.string.isRequired,
    confirm: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);
    this.state = {
      teammates: Teams.findOne(props.team_id).members.filter(member => member.username !== props.username)
    };
  }

  // check if confirmed
  componentDidUpdate() {

    let confirmedAll = true;
    this.state.teammates.forEach((member) => {
      if (!member.confirmed) confirmedAll = false;
    }); 

    if (confirmedAll) {
      this.props.confirm(this.props.team_id);
    }

  }

  // sets team member's state confirmed to true
  handleConfirmed(evt) {
    const username = evt.target.innerText;
    console.log(username);
    this.setState((state) => {
      // look for teammate and update state
      state.teammates.forEach((member) => {
        if (member.username === username) {
          member.confirmed = true;
        }
      }); 
      return state;
    });
  }

  render() {
    if (!this.props.team_id) return "";

    const team = Teams.findOne(this.props.team_id);

    return (
      <div>
        <Color color={team.color} username={this.props.username} />
        Find your teammates:
        {this.state.teammates.map(teammate => {
          if (!teammate.confirmed) return <div onClick={(evt) => this.handleConfirmed(evt)} key={teammate.username}><b>{teammate.username}</b></div>;
          else return <div key={teammate.username}><b>Found {teammate.username}</b></div>;
        })}
          <div>
            <br/>Click on their names when you find them!
          </div>
        </div>
  )
  }
}


// import React from 'react'
// import PropTypes from 'prop-types'


// export default function TeamBox(props) {

  
// }

// class TeamBox extends Component {
//   static propTypes = {
//     username: PropTypes.string.isRequired,
//     team: PropTypes.array.isRequired,
//   }

//   constructor(props) {
//     super(props);
//     this.state = {
//       confirmed: false,
//       found: ""
//     }
//   }

//   render() {
//     if (!props.team) return "";
//     return (
//       <div>
//         Find your teammates, {props.username}:
//         {props.team.members.filter(username => {
//           return username !== props.username;
//         }).map(username => {
//           return <div onClick={(evt) => this.setState({found = "Found"})} key={username}><b>{this.state.found} + {username}</b></div>
//         })}
//           <div>
//             <br/>Click on their names when you find them!
//           </div>
//         </div>
//     )
//   }
// }
