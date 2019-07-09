import React from 'react';
import ReactSwipe from 'react-swipe';

import '../../../assets/_main.scss';
import './OnboardingInstructions.scss';

export default function OnboardingInstructions() {
  const callback = () => {
    console.log('dsa: ' + this.reactSwipeEl.getPos());
  };

  return (
    <div className="instr-main">
      <h2>Welcome to Dynamic!</h2>
      <h3>
        <strong>Instructions</strong>
      </h3>
      <hr />
      <div>Swipe for more instructions</div>
      <ReactSwipe
        className="carousel"
        swipeOptions={{ continuous: false, callback, auto: 3000 }}
        ref={el => (this.reactSwipeEl = el)}
      >
        <div className="instr-card-wrapper">
          <div className="instr-card">First</div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">Second</div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">Third</div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">Fourth</div>
        </div>
      </ReactSwipe>
      <div className="pinned-instr">
        <strong>Wait for the instructor to begin.</strong>
      </div>
    </div>
  );
}
