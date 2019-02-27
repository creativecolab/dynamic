import React from 'react';
import Hello from './Hello.jsx';
import Info from './Info.jsx';

const App = () => (
  <div>
    <h1>Welcome to Dynamic!</h1>
    <Hello />
    <Info />
  </div>
);

export default App;

//TODO: Routes if not done (install meteor react-routes, Render Dynamic component for form entry that takes you to enter username page