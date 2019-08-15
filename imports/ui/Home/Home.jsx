import React, { useRef } from 'react';
import "./Home.scss";
import Button from '../Components/Button/Button';
import Stepper from 'react-stepper-horizontal';

//const scrollToRef = (ref) => window.scrollTo(0, ref.current.offsetTop);

export default function Home() {
  const myRef = useRef(null)
  const executeScroll = () => { console.log(myRef.current.offsetTop); myRef.current.scrollIntoView({ behavior: 'smooth' }); }

  return (
    <div className="home-main">

      <div className="landing-rect">
        <div className="header-flex">
          <img src="./logo-png-100.png" alt="" />
          <div className="header">Prototeams</div>
        </div>

        <div className="landing-content-flex">
          <div className="landing-content">
            <div className="landing-title" id="landing-title">Let's break the ice!</div>
            <div className="landing-subtitle">Forming teams has never been easier.</div>
            <div className="button-flex">
              <div className="begin-button">
                <Button
                  style={{ color: 'white', background: '#FF6D5F', margin: 0 }}
                  size="fixed"
                //onClick={this.createSession}
                >BEGIN
              </Button>
              </div>
              <div className="learn-button">
                <Button
                  style={{ color: '#FF6D5F', background: '#080808', margin: 0, boxShadow: "inset 0 0 0 3px #FF6D5F" }}
                  size="fixed"
                  onClick={executeScroll}
                >LEARN MORE
              </Button>
              </div>
            </div>
          </div>
          <div className="landing-image"><img src="./icecubes-png-700.png" alt="" /></div>
        </div>
      </div>



      <div className="landing-info-flex" ref={myRef}>
        <div className="info-wrapper">
          <div className="info-heading"><b>What</b> is it?</div>
          <div className="info-text">ProtoTeams is an app designed to help people meet potential teammates through a series of short, small-group activities. Based on the concept of “speed dating”, this app allows people to interact with various temporary groups, before committing to a long-term team.
          </div>
        </div>
        <div className="info-image"><img src="./crowd-jpg-500.jpg" alt="" /></div>

        <div className="info-image"><img src="./teams-jpg-500.jpg" alt="" /></div>
        <div className="info-wrapper">
          <div className="info-heading"><b>Who</b> uses it?</div>
          <div className="info-text">ProtoTeams can be used in classrooms, workplaces, and even large events like hackathons. Users include:
            <br />
            <br />
            <ul>
              <li><b>Instructors</b> who want to help their students get to know each other.</li>
              <li><b>Project managers</b> who are looking to build team rapport.</li>
              <li><b>Event coordinators</b> who need to organize small groups within a crowd of strangers.</li>
            </ul>
          </div>
        </div>
        <div className="info-wrapper">
          <div className="info-heading"><b>How</b> does it work?</div>
          <div className="info-text">To help people get to know each other, the app consists of activities focusing on facilitating small group interaction. For each round of an activity, new groups are assigned so people can dynamically meet new members and broaden their connections.
          <br />Every round follows the following stages:</div>
        </div>
        <div className="info-image"><img src="./discuss-jpg-500.jpg" alt="" /></div>
        <div className="steps-background">
          <div className="steps">
            <Stepper steps={[{ title: 'Group Formation' }, { title: 'Activity' }, { title: 'Assessment' }]}
              activeStep={2}
              size={70}
              circleFontColor='#FF6D5F'
              completeColor="white"
              activeColor="white"
              circleFontSize={45}
              titleFontSize={28}
              activeTitleColor="white"
              completeTitleColor="white"
              defaultBorderWidth={6}
            />
          </div>

          <div className="steps-detail-flex">
            <div className="step">Participants are assigned a group and a corresponding colored shape displayed on their phones. People form groups by finding others with the same icon.</div>
            <div className="step">Groups participate in a timed activity. Activities can be customized by the host to fit the context.</div>
            <div className="step">Each member reflects on the group interaction and assesses how well they got to know the other members.</div>
          </div>
        </div>
        <div className="info-image"><img src="./slider-jpg-500.jpg" alt="" /></div>

        <div className="info-wrapper">
          <div className="info-heading"><b>Why</b> should I use it?</div>
          <div className="info-text">Forming teams is often challenging. There are so many factors to consider when selecting team members: personality, skills…what factors really matter? Especially in a large group of people, you might not even know who to talk to or where to start.
            <br /><br />As a tool to facilitate face-to-face, small-group interactions, ProtoTeams eases the process of finding teams by helping you meet with potential members and “prototype” teams before choosing members you want to work with.
            <br /><br />By using this system, you are helping us better understand how in-person teams form, so we can improve the experience as well as the outcomes of working in teams.</div>
        </div>


        <div className="bye-image-bottom"><img src="./bye-jpg-500.jpg" alt="" /></div>

        <div className="begin-button-bottom">
          <Button
            style={{ color: 'white', background: '#FF6D5F', margin: 0 }}
            size="fixed"
          //onClick={this.createSession}
          //onClick={() => document.getElementById('landing-title').scrollIntoView()}
          >GET STARTED
          </Button>
        </div>

      </div>

    </div >
  )
}
