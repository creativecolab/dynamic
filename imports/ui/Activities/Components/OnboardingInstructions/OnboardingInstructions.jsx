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
      <h2>Welcome to ProtoTeams!</h2>
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
          <div className="instr-card">
            <strong>1. Stand up</strong>
            <img src="./crowd.jpg" alt="" />
          </div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">
            <strong>2. Find your teammate</strong>
            <img src="./hold_phones.png" alt="" />
          </div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">
            <strong>3. Participate in group activity</strong>
            <img src="./discussion.png" alt="" />
          </div>
        </div>
        <div className="instr-card-wrapper">
          <div className="instr-card">
            <strong>4. Assess your experience</strong>
            <img src="./rating.png" alt="" />
          </div>
        </div>
      </ReactSwipe>
      <div className="pinned-instr">
        <strong>Waiting for the instructor to begin...</strong>
      </div>
    </div>
  );
}
