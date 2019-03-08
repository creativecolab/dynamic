import React from 'react'

export default function TeamBox(props) {

  //TODO: add buttons to each of the names 
  //<button onClick={(evt) => {evt.target.style.background-color: 'red'}} value="not-clicked"></button>

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
