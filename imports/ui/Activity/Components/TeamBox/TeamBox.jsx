import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Wrapper from '../../../Wrapper/Wrapper'


export default class TeamBox extends Component {
  static propTypes = {
    // prop: PropTypes
  }

  constructor(props) {
    super(props);
    this.state = {
      teammates: this.props.team.members.filter(username => {
        return username !== this.props.username;
      }).map((username) => {
        return {username, found: false};
      }),
      confirmed: false
    };
  }

  handleFound(evt) {
    //the username that was 'found'
    console.log(evt.target.innerText);
    const clicked_username = evt.target.innerText;
    console.log(this.state.teammates);

    //change the state of the teammate who was 'found', and check if all have been found
    var updatedTeammates = [];
    var allconfirmed = true;
    for (var i=0; i < this.state.teammates.length; i++) {
      if (this.state.teammates[i].username == clicked_username) {
        //the 'found' teammmate should have their found field updated
        updatedTeammates[i] = {
          username: clicked_username,
          found: true
        }
      } else {
        //leave the other teammates as is 
        updatedTeammates[i] = {
          username: this.state.teammates[i].username,
          found: this.state.teammates[i].found
        }
        if (!this.state.teammates[i].found) {
          //track if all of the teammates are found now or not
          allconfirmed = false;
        }
      } 
    }
        // this.setState(({teammates}) => ({
        //   teammates: [
        //     ...teammates.slice(0,i),
        //     {
        //       username: clicked_username,
        //       found: true
        //     },
        //     ...teammates.slice(i+1)
        //   ]
        // }));
    console.log("All users found: " + allconfirmed);
    this.setState({
      teammates: updatedTeammates,
      confirmed: allconfirmed
    });
    // for (var i=0; i <this.state.teammates.length; i++) {
    //   if (!this.state.teammates[i].found) {
    //     allconfirmed = false;
    //   }
    // }
  }

  renderTeammates = () => {
    console.log(this.state.teammates);
    this.state.teammates.map(teammate => {
      if (!teammate.found) {
        return <div onClick={(evt) => this.handleFound(evt)} key={teammate.username}><b>{teammate.username}</b></div>
      } else { 
        return <div key={teammate.username}><b>Found {teammate.username}</b></div> 
      }
    });
    //return current_teammates;
  }
  //check if everyone is found before rendering
  renderFoundEveryone = () => {
    if (this.state.confirmed) {
      return <Wrapper>You found everyone!</Wrapper>
    }
  }

  render() {
    if (!this.props.team) return "";
    return (
      <div>
        Find your teammates, {this.props.username}:
        {this.state.teammates.map(teammate => {
          if (!teammate.found) {
            return <div onClick={(evt) => this.handleFound(evt)} key={teammate.username}><b>{teammate.username}</b></div>
          } else { 
            return <div key={teammate.username}><b>Found {teammate.username}</b></div> 
          }
        })}
          <div>
            <br/>Click on their names when you find them!
          </div>
          {this.renderFoundEveryone()}
        </div>
  )
  }
}
