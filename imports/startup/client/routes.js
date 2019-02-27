import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing.jsx';
import ChooseUsername from '../../ui/Username/ChooseUsername.jsx';

//TODO add more routes if necessary 

export const renderRoutes = () => (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/:code" component={ChooseUsername} />
        </Switch>
      </div>
    </Router>
);
