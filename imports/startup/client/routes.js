import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing';
import ChooseUsername from '../../ui/ChooseUsername/ChooseUsername';

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
