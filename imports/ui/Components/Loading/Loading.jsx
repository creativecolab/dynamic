import React from 'react'
import PropTypes from 'prop-types'
import { css } from '@emotion/core';
import DotLoader from 'react-spinners/DotLoader';
import './Loading.scss'; 

const override = css`
    display: block;
    margin: 0 auto;
    border-color: red;
`;

function Loading(props) {
  return (
    <div className='center-loader'>
    <DotLoader
      size={120}
      color={'#F05D5E'}
    />
  </div> 
  )
}

Loading.propTypes = {
    
}

export default Loading


