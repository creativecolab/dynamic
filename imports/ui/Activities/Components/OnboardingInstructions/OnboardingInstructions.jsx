import React from 'react';
import ReactSwipe from 'react-swipe';
import PictureContent from '../../../Components/PictureContent/PictureContent';
import Mobile from '../../../Layouts/Mobile/Mobile';

import '../../../assets/_main.scss';

import './OnboardingInstructions.scss';

export default function OnboardingInstructions() {
  const callback = () => {
    console.log('swiped: ' + this.reactSwipeEl.getPos());
  };

  return (
    <Mobile title="Instructions" hasFooter={false} footerText="Waiting for instructor to begin...">
      {/* <div className="slider-main"> */}
      <ReactSwipe
        className="carousel"
        swipeOptions={{ continuous: false, callback, auto: 3000 }}
        ref={el => (this.reactSwipeEl = el)}
      >
        <div className="instr-card-wrapper">
          <PictureContent
            title="1. Stand up"
            imageSrc="./crowd-jpg-500.jpg"
            subtitle="Get ready to move around during this activity!"
          />
        </div>
        <div className="instr-card-wrapper">
          <PictureContent
            title="2. Find your group members"
            subtitle="Once you find them, move away from the center of the room."
            imageSrc="./teams-jpg-500.jpg"
          />
        </div>
        <div className="instr-card-wrapper">
          <PictureContent
            title="3. Participate in group activity"
            subtitle="Talk to people! The goal is to get to know your potential teammates."
            imageSrc="./discuss-jpg-500.jpg"
          />
        </div>
        <div className="instr-card-wrapper">
          <PictureContent
            title="4. Assess your experience"
            // desc="These data are kept private and won't be shared with anyone."
            subtitle="Data collected are kept private and available to our research team only."
            imageSrc="./slider-jpg-500.jpg"
          />
        </div>
      </ReactSwipe>
      {/* </div> */}
    </Mobile>
  );
}
