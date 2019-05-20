import React from 'react';
import './SessionEnd.scss';

export default function SessionEnd() {
  return (
    <div className="outer">
      <div className="inner">
        <h1>
          That&apos;s it! <br /> Please follow the link and fill out our survey.
          <br /> Thank you for participating!
        </h1>
        <br />
        <img alt="" id="moving-logo" src="/dynamic.gif" className="center" />
      </div>
    </div>
  );
}
