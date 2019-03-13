import React, { Component } from 'react'
import PropTypes from 'prop-types'

export default class TeamBox extends Component {
  static propTypes = {
    // prop: PropTypes
  }

  constructor(props) {
    super(props);
    this.state = {
      teammates: this.props.team.members.filter(username => {
        return username !== this.props.username;
      }).map(username => {
        return {username, found: false};
      })
    };
  }

  handleFound(evt) {
    console.log(evt.target.innerText);
    //evt.target.innerText = "Found " + evt.target.innerText;
  }

  render() {
    if (!this.props.team) return "";
    return (
      <div>
        Find your teammates, {this.props.username}:
        {this.state.teammates.map(teammate => {
          if (!teammate.found) return <div onClick={(evt) => this.handleFound(evt)} key={teammate.username}><b>{teammate.username}</b></div>;
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
