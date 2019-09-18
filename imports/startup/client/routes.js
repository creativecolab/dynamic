/* eslint-disable react/jsx-filename-extension */
import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing';
import InstructorUI from '../../ui/InstructorUI/InstructorUI';
import Session from '../../ui/Session/Session';
import SessionProgress from '../../ui/SessionProgress/SessionProgress';
import SessionHandler from '../../ui/Handlers/SessionHandler/SessionHandler';
import DataOverview from '../../ui/DataOverview/DataOverview';
import SharedDisplay from '../../ui/SharedDisplay/SharedDisplay';
import Home from '../../ui/Home/Home';
// eslint-disable-next-line import/prefer-default-export
export const renderRoutes = () => (
  <Router>
    <div>
      <Switch>
        <Route exact path="/" component={Landing} />
        {/* <Route exact path="/" render={() => <Landing />} /> */}
        <Route exact path="/data" component={DataOverview} />
        <Route exact path="/instructor" component={InstructorUI} />
        <Route exact path="/home" component={Home} />
        <Route exact path="/learnmore" component={Home} />
        <Route exact path="/about" component={Home} />
        <Route exact path="/host" component={SharedDisplay} />
        <Route exact path="/:code" component={SessionHandler} />
        <Route exact path="/:code/edit" component={Session} />
        <Route exact path="/:code/view" component={SessionProgress} />
      </Switch>
    </div>
  </Router>
);
