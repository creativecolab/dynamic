import React from 'react';
import '../../../assets/_main.scss';
import './OnboardingInstructions.scss';

export default function OnboardingInstructions() {
  return (
    <div>
        <h3>Welcome to Dynamic!</h3>
        <h2>Instructions</h2>
        <hr/>
        <div>Let's do a dynamic group activity!<br/>Be ready to:</div>
        <ol className="instructions-ol">
          <li>Answer a prompt (1 min)</li>
          <li>Form teams. Be quick!</li>
          <li>Discuss answers (1 min)</li>
        </ol>
        <div>Wait for instructor to begin.</div>
        <div><strong>Please do not refresh your browser!</strong></div>
      </div>
  )
}

