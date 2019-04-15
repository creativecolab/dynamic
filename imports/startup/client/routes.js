import React from 'react';
import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// route components
import Landing from '../../ui/Landing/Landing';
// import ChooseUsername from '../../ui/ChooseUsername/ChooseUsername';
import Login from '../../ui/Login/Login';
import InstructorUI from '../../ui/InstructorUI/InstructorUI';
import Session from '../../ui/Session/Session';
import SessionProgress from '../../ui/SessionProgress/SessionProgress';
import SignUp from '../../ui/SignUp/SignUp';
import Quiz from '../../ui/Activity/Components/Quiz/Quiz';

export const renderRoutes = () => (
    <Router>
      <div>
        <Switch>
            <Route exact path="/" component={Landing} />
            <Route exact path="/instructor" component={InstructorUI} />
            <Route exact path="/sandbox" component={Quiz} />
            <Route exact path="/:code" component={Login} />
            <Route exact path="/:code/signup" component={SignUp} />
            <Route exact path="/:code/edit" component={Session} />
            <Route exact path="/:code/view" component={SessionProgress} />
        </Switch>
      </div>
    </Router>
);
