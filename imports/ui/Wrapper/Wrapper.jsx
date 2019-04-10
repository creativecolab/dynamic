import React from 'react'
import './Wrapper.scss';

export default function Wrapper(props) {
  return (
    <div id="wrapper">
      <h5 className="navbar">Dynamic</h5>
      <div id="inner">
        {props.children}
      </div>
    </div>
  )
}
