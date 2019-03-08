import React from 'react'

export default function TeamBox(props) {

  //TODO: add buttons to each of the names 
  //<button onClick={(evt) => {evt.target.style.background-color: 'red'}} value="not-clicked"></button>

  if (!props.team) return "";
  return (
    <div>
      Find your teammates, {"HELOO"}:
      {props.team.members.map(username => {
        return <div key={username}>{username}</div>
      })}
      </div>
  )
}
