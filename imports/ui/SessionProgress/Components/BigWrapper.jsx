import React from 'react'
import './BigWrapper.scss';

export default function BigWrapper(props) {
  return (
    <div id="wrapper">
    <img id="dynamic-logo-big" src="./dynamic_logo.png" alt=""/>
      <div id="inner">
      {props.children}
      </div>
    </div>
  )
}
