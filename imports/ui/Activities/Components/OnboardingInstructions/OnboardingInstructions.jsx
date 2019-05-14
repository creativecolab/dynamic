import React from 'react';
import '../../../assets/_main.scss';
import './OnboardingInstructions.scss';

export default function OnboardingInstructions() {
  return (
    <div className="instr-main">
      <h2>Welcome to Dynamic!</h2>
      <h3>
        <strong>Instructions</strong>
      </h3>
      <hr />
      <div>
        Let's do a dynamic group activity!
        <br />
        Be ready to:
      </div>
      <ol className="instructions-ol">
        <li>Answer a prompt (1 min)</li>
        <li>Form teams. Be quick!</li>
        <li>Discuss answers (1 min)</li>
      </ol>
      <div>
        <strong>Wait for the instructor to begin.</strong>
      </div>
    </div>
  );
}
