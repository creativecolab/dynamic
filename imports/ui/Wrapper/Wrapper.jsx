import React from 'react'
import './Wrapper.scss';

export default function Wrapper(props) {
  return (
    <div id="mobile-wrapper">
      <div id="inner-mobile">
        {props.children}
      </div>
    </div>
  )
}
