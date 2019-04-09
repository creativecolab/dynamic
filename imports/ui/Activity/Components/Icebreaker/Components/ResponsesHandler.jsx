import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Clock from '../../../../Clock/Clock';
// import Wrapper from '../Wrapper/Wrapper'
import Responses from '../../../../../api/responses';
import Activities from '../../../../../api/activities';
// import '../assets/_main.scss';
import './ResponsesHandler.scss';

export default class ResponsesHandler extends Component {
  // static propTypes = {
  // }

  constructor(props) {
    super(props);

    // only get responses of the same type of activity
    const activity_type = Activities.findOne(props.activity_id).name;

    // get prev responses for this session
    const prevResponses = Responses.findOne({pid: props.pid, session_id: props.session_id, activity_type}, {sort: {timestamp: -1}});

    // set state with previous values, if they exist
    if (!prevResponses) {
      this.state = {
        truth1: '',
        truth2: '',
        lie: '',        
        saved: false
      };
    } else {
      console.log(prevResponses);
      this.state = {
        truth1: prevResponses.options[0].text,
        truth2: prevResponses.options[1].text,
        lie: prevResponses.options[2].text,
        saved: false
      };
    }
  }

  handleTruth1(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      truth1: evt.target.value
    });
  }

  handleTruth2(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      truth2: evt.target.value
    });
  }

  handleLie(evt) {
    if (evt.target.value.length > 30) return;
    this.setState({
      lie: evt.target.value
    });
  }

  shuffle(a) {
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  saveReponses(evt) {
    evt.preventDefault();
    console.log(JSON.stringify(this.state));

    this.setState({
      saved: true
    });

    const options = [{text: this.state.truth1, lie: false, count: 0, votes: []},
    {text: this.state.truth2, lie: false, count: 0, votes: []},
    {text: this.state.lie, lie: true, count: 0, votes: []}];

    var shuffled_options = JSON.parse(JSON.stringify(options));
    this.shuffle(shuffled_options);

    Responses.insert({
      pid: this.props.pid,
      timestamp: new Date().getTime(),
      session_id: this.props.session_id,
      activity_id: this.props.activity_id,
      activity_type: Activities.findOne(this.props.activity_id).name,
      options,
      shuffled_options,
      num_voted: 0,
      hotseat: false
    });
  }

  renderSaved = () => {
    if (this.state.saved) {
      return <p id="save">Saved!</p>
    }
  }

  // clear tick when not rendered
  componentWillUnmount() {

    const options = [{text: this.state.truth1, lie: false, count: 0, votes: []},
    {text: this.state.truth2, lie: false, count: 0, votes: []},
    {text: this.state.lie, lie: true, count: 0, votes: []}];

    var shuffled_options = JSON.parse(JSON.stringify(options));
    this.shuffle(shuffled_options);

    const inserted_response = Responses.insert({
      pid: this.props.pid,
      timestamp: new Date().getTime(),
      session_id: this.props.session_id,
      activity_id: this.props.activity_id,
      activity_type: Activities.findOne(this.props.activity_id).name,
      options,
      shuffled_options,
      num_voted: 0,
      hotseat: false
    });
    console.log(inserted_response);
    clearTimeout(this.timer);
  }

  componentDidUpdate(){
    this.timer = setTimeout(() => 
      this.setState({
        saved: false
      }),
    10000);
  }

  render() {
    return (
// {/* <Wrapper>
// <h4>Write two truths and one lie about yourself.</h4>
// <form id="icebreaker-form" onSubmit={(evt) => this.saveReponses(evt)}>
//   <div id="icebreaker-container" className="field-container">
//     <label className="field-title" htmlFor="truth">TWO TRUTHS</label>
//     <div className="input-container">
//       <input className="input-text" type="text" name="truth1" placeholder="I used to do improv." value={this.state.truth1} onChange={(evt) => this.handleTruth1(evt)}/>
//     </div>
//     <div className="input-container">
//       <input className="input-text" type="text" name="truth1" placeholder="I snore in my sleep." value={this.state.truth2} onChange={(evt) => this.handleTruth2(evt)}/>
//     </div>
//     <label className="field-title" htmlFor="lies">ONE LIE</label>
//     <div className="input-container">
//       <input className="input-text" type="text" name="lie" placeholder="I have been to Cabo." value={this.state.lie} onChange={(evt) => this.handleLie(evt)}/>
//     </div>
//     <input className="small-button" type="submit" value="Save"/>
//      {this.renderSaved()}
//   </div>
// </form>
// </Wrapper> */}
<div>
  <h3 id="navbar">Icebreaker</h3>
  <div id="responsive">
    <div id="w_container">
    <h4>Write two truths and one lie about yourself.</h4>
    <form id="icebreaker-form" onSubmit={(evt) => this.saveReponses(evt)}>
      <div id="icebreaker" className="field-container">
        <label className="label" htmlFor="truth">TWO TRUTHS</label>
        <div className="input-container">
          <input id="input-container" className="u-container" type="text" name="truth1" placeholder="i.e., I used to do improv"  value={this.state.truth1} onChange={(evt) => this.handleTruth1(evt)}/>
        </div>
        <div className="input-container">
          <input id="input-container" className="u-container" type="text" name="truth2" placeholder="i.e., I snore in my sleep"  value={this.state.truth2} onChange={(evt) => this.handleTruth2(evt)}/>
        </div><br></br>
        <label className="label" htmlFor="lies">ONE LIE</label>
        <div className="input-container">
          <input id="input-container" className="u-container" type="text" name="lie" placeholder="i.e., I have been to Mexico"  value={this.state.lie} onChange={(evt) => this.handleLie(evt)}/>
        </div>
        <input id="next_b" type="submit" value="Save"/>
        {this.renderSaved()}
      </div>
    </form>
    </div>
  </div>
</div>
    )
  }
}
