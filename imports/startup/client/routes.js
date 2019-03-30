import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing';
// import ChooseUsername from '../../ui/ChooseUsername/ChooseUsername';
import Login from '../../ui/Login/Login';
import InstructorUI from '../../ui/InstructorUI/InstructorUI';
import Session from '../../ui/Session/Session';

export const renderRoutes = () => (
    <Router>
      <div>
        <Switch>
          <Route exact path="/" component={Landing} />
          <Route exact path="/instructor" component={InstructorUI} />
          <Route exact path="/:code" component={Login} />
          <Route exact path="/:code/edit" component={Session} />
        </Switch>
      </div>
    </Router>
);
