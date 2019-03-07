import React from 'react'

export default function TeamBox(props) {
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
