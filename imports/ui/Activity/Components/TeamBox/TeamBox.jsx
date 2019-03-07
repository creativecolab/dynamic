import React from 'react'

export default function TeamBox(props) {
  if (!props.team) return "";
  return (
    <div>
      {props.team.map(mate => {
        return <div key={mate.username}>{mate.username}</div>
      })}
    </div>
  )
}
