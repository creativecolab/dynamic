import React from 'react'
import './Wrapper.scss';

export default function Wrapper(props) {
  return (
    <div id="wrapper">
      <div id="inner">
        {props.children}
      </div>
    </div>
  )
}
