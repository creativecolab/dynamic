import React, { Component, useRef } from 'react';
import './Home.scss';
import Stepper from 'react-stepper-horizontal';
import Button from '../Components/Button/Button';
import Sessions from '../../api/sessions';
import Activities from '../../api/activities';

import ParticipantInfoPage from './ParticipantInfoPage';
import TeamInfoPage from './TeamInfoPage';
import FacilitatorInfoPage from './FacilitatorInfoPage';

import SessionEnums from '../../enums/sessions';
import ActivityEnums from '../../enums/activities';

//const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

export default class Home extends Component {

  render() {
    return (
      <div>
        {/* // TODO: Find where this needs to go */}
        <head>
          <meta charset="utf-8"></meta>
          <title>ProtoTeams</title>

          {/* <!-- mobile responsive meta --> */}
          <meta name="viewport" content="width=device-width, initial-scale=1"></meta>
          <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1"></meta>
          <link rel="icon" href="homepage/favicon.png" type="image/gif" sizes="15x15"></link>


          <link rel="stylesheet" href="plugins/bootstrap/bootstrap.min.css"></link>
          <link rel="stylesheet" href="path/to/font-awesome/css/font-awesome.min.css"></link>

          {/* <!-- Main Stylesheet --> */}
          {/* //FIXME: move this to Home.css */}
          {/* <link href="css/style.css" rel="stylesheet"> */}
        </head>

        {/* <!-- Nav Start --> */}
        <nav class="navbar navbar-expand-lg  main-nav" id="navbar">
          <div class="container">
            <button class="navbar-toggler collapsed" type="button" data-toggle="collapse" data-target="#navbarsExample09" aria-controls="navbarsExample09" aria-expanded="false" aria-label="Toggle navigation">
              <span class="ti-align-justify"></span>
            </button>
            <div class="collapse navbar-collapse" id="navbarsExample09">
              <ul class="navbar-nav ml-auto">
                {/* TODO: Swap to the other Pages */}
                <li class="nav-item"><a class="nav-link" href="index.html">home</a></li>
                <li class="nav-item"><a class="nav-link" href="facilitator.html">facilitator</a></li>
                <li class="nav-item"><a class="nav-link" href="participant.html">participant</a></li>
                <li class="nav-item"><a class="nav-link" href="team.html">team</a></li>
              </ul>
            </div>
          </div>
        </nav>
        {/* <!-- Nav Close --> */}

        {/* < !--Banner Start-- > */}
        <div class="container">
          <div class="row">
            <div class="col-lg-6 col-md-6 col-sm-12">
              <br></br>
              <br></br>
              <br></br>
              <br></br>
              <h1 style={{ 'margin-top': "2.5rem" }}>Give your Crowd a Chance to Meet</h1>

              <br></br>
              {/* <!--<button type="button" class="btn btn-dark">Learn More</button>--> */}
              <button type="button" class="btn btn-light border-dark" onclick="window.location.href='http:\\www.prototeams.com'">Try it!</button>
              <br></br>
            </div>
            <div class="col-lg-6 col-md-6 col-sm-12">
              <img src="homepage/header.png" class="img-fluid w-100 d-block "></img>
            </div>
          </div>
        </div>
        {/* <!-- Banner End --> */}

        <br></br>

        {/* <!-- Portfolio start --> */}
        <section>
          <div class="container">
            <div class="row" id="work">
              <br></br>
              <div class="col-lg-12 col-md-12 col-sm-12  shuffle-item">
                <br></br>
                <br></br>
                <a href="">
                  <img src="homepage/landing.png" class="img-fluid w-100 d-block"></img>
                  <br></br>
                </a>
              </div>
            </div>
            <br></br>

            <div class="row w-80" id="work">
              <br></br>
              <div class="col-lg-6 col-md-6 col-sm-12  shuffle-item">
                <a href="">
                  <h4>For group facilitators →</h4>
                </a>
                <p>Customize the activity through questions, number of rounds and more.</p>
              </div>
              <div class="col-lg-6 col-md-6 col-sm-12  shuffle-item">
                <a href="">
                  <h4>For participant →</h4>
                </a>
                <p>Meet with the people around you with engaging conversation starters.</p>
              </div>
            </div>

            <br></br>

            <div class="row" id="work">
              <br></br>
              <div class="col-lg-12 col-md-12 col-sm-12  shuffle-item">
                <br></br>
                <br></br>
                <img src="homepage/homepage-pic.png" class="img-fluid w-100 d-block"></img>
                <br></br>
              </div>
            </div>

            <br></br>

            <div class="row" id="work">
              <br></br>
              <br></br>
              <div class="col-lg-12 col-md-12 col-sm-12  shuffle-item">
                <h1 class="align-middle">Key Features</h1>
                <br></br>
                <br></br>
                <br></br>
              </div>
              <div class="col-lg-4 col-md-4 col-sm-12  shuffle-item">
                {/* TODO: update images location  */}
                <img src="homepage/feature1.png" class="img-fluid w-100 d-block"></img>
              </div>
              <br></br>
              <div class="col-lg-4 col-md-4 col-sm-12  shuffle-item">
                {/* TODO: update images location  */}
                <img src="homepage/feature2.png" class="img-fluid w-100 d-block"></img>
              </div>
              <br></br>
              <div class="col-lg-4 col-md-4 col-sm-12  shuffle-item">
                {/* TODO: update images location  */}
                <img src="homepage/feature3.png" class="img-fluid w-100 d-block"></img>
              </div>
            </div>

            <br></br>
            <br></br>
          </div>
        </section>
        {/* // <!-- Portfolio End-- > */}

        <br></br>
        <br></br>
        <br></br>

        {/* Footer Begin */}
        <footer class="footer">
          <div>
            <br></br>
            <br></br>
            <p class="text-center">© ProtoTeams 2020</p>
            <br></br>
            <br></br>
          </div>
        </footer>
        {/* Footer End */}

        {/* <!-- jQuery --> */}
        {/* TODO: checkout this stuff, might not need it */}
        {/* <script src="plugins/jQuery/jquery.min.js"></script>}
        {/* <!-- Bootstrap JS --> */}
        {/* <script src="plugins/bootstrap/bootstrap.min.js"></script> */}
        {/* <script src="plugins/aos/aos.js"></script> */}
        {/* <!-- Main Script --> */}
        {/* <script src="js/script.js"></script> */} * /}

        {/* Ending Div */}
      </div >
    );
  }

}