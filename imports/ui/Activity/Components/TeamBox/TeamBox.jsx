import React from 'react'
import PropTypes from 'prop-types'


export default function TeamBox(props) {

  if (!props.team) return "";
  return (
    <div>
      Find your teammates, {props.username}:
      {props.team.members.filter(username => {
        return username !== props.username;
      }).map(username => {
        return <div onClick={(evt) => evt.target.text = "Found " + username} key={username}><b>{username}</b></div>
      })}
        <div>
          <br/>Click on their names when you find them!
        </div>
      </div>
  )
}

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
