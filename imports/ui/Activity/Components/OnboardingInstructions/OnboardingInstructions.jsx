import React from 'react';
import '../../../assets/_main.scss';

export default function OnboardingInstructions() {
  return (
    <div>
        <h3>Welcome to Dynamic!</h3>
        <h2>Instructions</h2>
        <hr/>
        <div>In the next 20 minutes the  following will happen 3 times:</div>
        <ol>
          <li>Answer a prompt (2 min)</li>
          <li>Form teams. Be quick!</li>
          <li>Discuss answers (2 min)</li>
        </ol>
        <div>Wait for instructor to begin!</div>
        <div>Please do not refresh your browser!</div>
      </div>
  )
}

