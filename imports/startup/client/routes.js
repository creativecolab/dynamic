import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing';
import ChooseUsername from '../../ui/ChooseUsername/ChooseUsername';
import InstructorUI from '../../ui/InstructorUI/InstructorUI';

export const renderRoutes = () => (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/instructor" component={InstructorUI} />
          <Route exact path="/:code" component={ChooseUsername} />
        </Switch>
      </div>
    </Router>
);
