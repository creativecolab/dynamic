import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';

import Responses from '../../api/responses';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Sessions from '../../api/sessions';
import Quizzes from '../../api/quizzes';

import Loading from '../Components/Loading/Loading';

import './DataOverview.scss';

class DataOverview extends Component {
  state = {
    quiz_id: 'all',
    pid: 'all',
    type: 'all'
  };

  static propTypes = {
    responses: PropTypes.array,
    users: PropTypes.array,
    sessions: PropTypes.array,
    quizzes: PropTypes.array,
    teams: PropTypes.array
  };

  static defaultProps = {
    responses: [],
    users: [],
    sessions: [],
    quizzes: [],
    teams: []
  };

  filterByQuiz(quiz_id) {
    this.setState({
      quiz_id
    });
  }

  filterByType(type) {
    this.setState({
      type
    });
  }

  filterByPid(pid) {
    this.setState({
      pid
    });
  }

  getName(pid) {
    const { users } = this.props;

    return users.filter(u => u.pid === pid)[0].name;
  }

  getText(id, quiz_id, question_index) {
    const { quizzes } = this.props;
    const quiz = quizzes.filter(q => q._id === quiz_id);

    if (!quiz[0]) return 'No quiz';

    const question = quiz[0].questions[question_index];

    if (!question) return 'No question';

    const option = question.options.filter(op => op.id === id);

    if (!option) return 'No option';

    if (!option[0]) return 'No option[0]';

    return option[0].text;
  }

  getCorrect(id, quiz_id, question_index) {
    const { quizzes } = this.props;
    const quiz = quizzes.filter(q => q._id === quiz_id);

    if (!quiz[0]) return 'No quiz';

    const question = quiz[0].questions[question_index];

    if (!question) return 'No question';

    const option = question.options.filter(op => op.id === id);

    if (!option) return 'No option';

    if (!option[0]) return 'No option[0]';

    return option[0].correct;
  }

  getCodeForTeam(t) {
    const { activity_ids } = this.props;

    if (!activity_ids) return;

    if (activity_ids[0].includes(t.activity_id)) return [t.teamFormationTime / 1000];

    //if (activity_ids[1].includes(t.activity_id)) return [null, t.teamFormationTime / 1000, null];

    //if (activity_ids[2].includes(t.activity_id)) return [null, null, t.teamFormationTime / 1000];
  }

  getUserPreferences(pid) {
    const { users } = this.props;
    const user = users.find(u => u.pid === pid);
    if (user) return user.preference;
    return [];
  }

  getSessionParticipants() {
    const { sessions } = this.props;

    // TODO: currently assumes there is only one session, need to make more general in the future

    if (!sessions) {
      console.log("No sessions yet");
      return [];
    }

    const { participants } = sessions[0];

    if (!participants) {
      console.log("No particpants for this session yet");
      return [];
    }

    return participants;
  }

  renderTeamFormationTimeHeader() {

    const { sessions, teams, activity_ids } = this.props;

    if (!sessions) {
      console.log("No sessions yet...");
      return '';
    }

    if (!teams) {
      console.log("No teams yet...");
      return '';
    }

    if (!activity_ids[0]) {
      console.log("No activities found yet...");
      return '';
    }


    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

    return (
      <table>
        <tbody className="data-table">
          <tr>
            <th>{new Date(sessions[0].timestamp).toDateString()}</th>
            <td>
              <i>n_subjects={sessions[0].participants.length}</i>
            </td>
            <td>
              <i>n_activites={activity_ids[0].length}</i>
            </td>
            <td>
              <i>n_teams={teams.filter(t => activity_ids[0].includes(t.activity_id)).length}</i>
            </td>
            <td>
              <i>
                n_teams_confirmed=
                  {teams.filter(t => t.teamFormationTime && activity_ids[0].includes(t.activity_id)).length}
              </i>
            </td>
            <td>
              avg_team_formation_time=
                {average(
                teams
                  .filter(t => t.teamFormationTime && activity_ids[0].includes(t.activity_id))
                  .map(t => t.teamFormationTime / 1000)
              ).toFixed()}
              s
              </td>
          </tr>
          {/* <tr>
              <th>{new Date(sessions[1].timestamp).toDateString()}</th>
              <td>
                <i>n_subjects={sessions[1].participants.length}</i>
              </td>
              <td>
                <i>n_activites={activity_ids[1].length}</i>
              </td>
              <td>
                <i>n_teams={teams.filter(t => activity_ids[1].includes(t.activity_id)).length}</i>
              </td>
              <td>
                <i>
                  n_teams_confirmed=
                  {teams.filter(t => t.teamFormationTime && activity_ids[1].includes(t.activity_id)).length}
                </i>
              </td>
              <td>
                avg_team_formation_time=
                {average(
                  teams
                    .filter(t => t.teamFormationTime && activity_ids[1].includes(t.activity_id))
                    .map(t => t.teamFormationTime / 1000)
                ).toFixed()}
                s
              </td>
            </tr> */}
          {/* <tr>
              <th>{new Date(sessions[2].timestamp).toDateString()}</th>
              <td>
                <i>n_subjects={sessions[2].participants.length}</i>
              </td>
              <td>
                <i>n_activites={activity_ids[2].length}</i>
              </td>
              <td>
                <i>n_teams={teams.filter(t => activity_ids[2].includes(t.activity_id)).length}</i>
              </td>
              <td>
                <i>
                  n_teams_confirmed=
                  {teams.filter(t => t.teamFormationTime && activity_ids[2].includes(t.activity_id)).length}
                </i>
              </td>
              <td>
                avg_team_formation_time=
                {average(
                  teams
                    .filter(t => t.teamFormationTime && activity_ids[2].includes(t.activity_id))
                    .map(t => t.teamFormationTime / 1000)
                ).toFixed()}
                s
              </td>
            </tr> */}
          <tr>{/* <td>{sessions.map(s => new Date(s.timestamp).toDateString()).join()}</td> */}</tr>
          <tr>{/* <td>{sessions.map(s => s.participants.length).join()}</td> */}</tr>
        </tbody>
      </table>
    );
  }

  renderTeamFormationTimeChart() {

    const { sessions, teams } = this.props;

    if (!sessions) {
      console.log("No sessions yet...")
      return '';
    }

    if (!teams) {
      console.log("No teams yet...")
      return '';
    }

    const data = teams.map(t => this.getCodeForTeam(t));

    // data.splice(0, 0, sessions.map(s => new Date(s.timestamp).toDateString()));

    data.splice(0, 0, sessions.map(s => new Date(s.timestamp).toDateString()));


    return (
      <Chart
        width="500px"
        height="300px"
        chartType="Histogram"
        loader={<div>Loading Chart</div>}
        data={data}
        options={{
          width: 1200,
          title: 'Team formation time, in seconds',
          // legend: { position: 'none' },
          legend: { position: 'top', maxLines: 2 },
          bar: { gap: 0 },

          // hAxis: { gridlines: { count: 10 } },
          histogram: { bucketSize: 10 },
          colors: ['#F05D5E', '#00DD90', '#1E91D6', '#999999']
        }}
      />
    );
  }

  renderPreferences() {

    const participants = this.getSessionParticipants();

    return (
      <table>
        <tbody className="data-table">
          <tr>
            <th>PID</th>
            <th>Preferences</th>
          </tr>
          {participants.map(pid => {
            return (
              <tr key={pid}>
                <td key={pid + " entry"}><b>{pid}:</b></td>
                <td key={pid + "'s preferences"}>
                  {this.getUserPreferences(pid).map(pref => {
                    return (pref.values.map(res => {
                      return (
                        <i>{res.pid}: {res.value}, </i>
                      );
                    }));
                  })}
                </td>
              </tr>
            )
          })}

        </tbody>
      </table>
    );

  }

  renderPreferenceRatings() {

    const participants = this.getSessionParticipants();

    // dating for ratings, can be rated 0 to 6, so 7 entries
    const data = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0]]

    participants.map(pid => {
      //if (!user) return '';
      (this.getUserPreferences(pid)).map(pref => {
        return (pref.values.map(res => {
          data[res.value][1] = data[res.value][1] + 1;
        }));
      }
      );
    });

    data.splice(0, 0, ["Rating Value", "Freq"])

    return (
      <Chart
        width="500px"
        height="300px"
        chartType="Bar"
        loader={<div>Loading Chart</div>}
        data={data}
        options={{
          width: 800,
          chart: {
            title: "Preference Ratings",
            subtitle: 'Frequency of each Rating Value',
          },          // legend: { position: 'none' },
          legend: { position: 'top' },
          bar: { gap: 0 },
          colors: ['#1E91D6']
        }}
      />
    );
  }

  // Not in use right now, but don't delete
  renderPreferenceMinAvgMax() {

    const participants = this.getSessionParticipants();

    const data = [];

    // loop through all participants
    participants.map((pid) => {
      let entry = [pid];
      // loop through the teammates of the user
      var min = 7;
      var max = -1;
      var avg = 0;
      var num_ratings = 0;
      this.getUserPreferences(pid).map((pref) => {
        pref.values.map((res) => {
          // get the preferences of each teammate to find rating for og user
          this.getUserPreferences(res.pid).map((teammate_pref) => {
            // add rating for the user
            teammate_pref.values.map((teammate_res) => {
              if (teammate_res.pid === pid) {
                num_ratings = num_ratings + 1;
                avg = avg + teammate_res.value;
                if (teammate_res.value > max) max = teammate_res.value;
                if (teammate_res.value < min) min = teammate_res.value;
              }
            });
          });
        });
      });
      entry.push(min, avg / num_ratings, max)
      console.log(entry);
      data.push(entry);
    });

    data.splice(0, 0, ['pid', 'min_rating', 'avg_rating', 'max_rating']);
    console.log(data);

    return (
      <Chart
        width={'100%'}
        height={350}
        chartType="CandlestickChart"
        loader={<div>Loading Chart</div>}
        data={data}
        options={{
          title: "Differences in Rating for each user"
        }}
        rootProps={{ 'data-testid': '1' }}
      />
    );

  }

  render() {
    const { responses, users, sessions, quizzes, activity_ids, teams } = this.props;

    if (!responses || !teams || !users || !sessions || !quizzes) return <Loading />;

    const { quiz_id, type, pid } = this.state;

    //if (!sessions[0] || !sessions[1] || !sessions[2]) return '';

    if (!sessions[0]) return '';


    // if (!activity_ids[0] || !activity_ids[1] || !activity_ids[2]) return '';

    if (!activity_ids[0]) return '';


    return (
      <div>
        {this.renderTeamFormationTimeHeader()}
        {this.renderTeamFormationTimeChart()}
        <div>
          Filters: {'{ '}
          quiz_id:{' '}
          <button className="subtle-btn" type="button" onClick={() => this.filterByQuiz('all')}>
            {quiz_id}
          </button>
          , type:{' '}
          <button className="subtle-btn" type="button" onClick={() => this.filterByType('all')}>
            {type}
          </button>
          , pid:{' '}
          <button className="subtle-btn" type="button" onClick={() => this.filterByPid('all')}>
            {pid}
          </button>
          {'}'}
        </div>
        <table>
          <tbody>
            <tr>
              <th>name</th>
              <th>pid</th>
              <th>quiz_id</th>
              <th>type</th>
              <th>question_1</th>
              <th>question_2</th>
              <th>question_3</th>
              <th>question_4</th>
            </tr>
          </tbody>
          {/* {responses.map((res, index) => {
            if ((type === 'all' || res.type === type) && (quiz_id === 'all' || res.quiz_id === quiz_id))
              return (
                <tr>
                  <td>{this.getName(res.pid)}</td>
                  <td>{res.pid.toUpperCase()}</td>
                  <td>
                    <button className="subtle-btn" type="button" onClick={() => this.filterByQuiz(res.quiz_id)}>
                      {res.quiz_id}
                    </button>
                  </td>
                  <td>
                    <button className="subtle-btn" type="button" onClick={() => this.filterByType(res.type)}>
                      {res.type}
                    </button>
                  </td>
                  {res.selected.map((opt, j) => {
                    if (j < 2)
                      return (
                        <td className={this.getCorrect(opt, res.quiz_id, j) ? 'right' : 'wrong'}>
                          {this.getText(opt, res.quiz_id, j)}
                        </td>
                      );

                    return <td>{opt.text}</td>;
                  })}
                </tr>
              );
          })} */}
        </table>
        {this.renderPreferences()}
        {this.renderPreferenceRatings()}
      </div>
    );
  }
}

export default withTracker(() => {
  const flatten = arr => {
    return arr.reduce((flat, toFlatten) => {
      return flat.concat(Array.isArray(toFlatten) ? flatten(toFlatten) : toFlatten);
    }, []);
  };

  // get the Session where the trials took place
  const sessions = Sessions.find(
    {
      // code: { $in: ['dsgn100', 'dsgn100quiz', 'quiz2'] }
      code: { $in: ['quiz2'] }
    },
    {
      fields: {
        _id: 1,
        code: 1,
        participants: 1,
        activities: 1,
        timestamp: 1,
        startime: 1,
        endtime: 1
      },
      sort: {
        timestamp: -1
      }
    }
  ).fetch();

  if (!sessions) return {};

  // get the activities from this session
  const activity_ids = sessions.map(s => s.activities);

  const a_ids = flatten(activity_ids);

  if (!a_ids) return {};

  // get the teams formed during all of the activities
  const teams = Teams.find({ activity_id: { $in: a_ids } }).fetch();

  if (!teams) return {};

  const teamsByDay = {
    //'2t1l': teams.filter(t => activity_ids[2].includes(t.activity_id)),
    //quiz1: teams.filter(t => activity_ids[1].includes(t.activity_id)),
    quiz2: teams.filter(t => activity_ids[0].includes(t.activity_id))
  };

  const responses = Responses.find(
    { activity_id: { $in: a_ids } },
    {
      // fields: {
      //   pid: 1,
      //   type: 1,
      //   selected: 1,
      //   quiz_id: 1
      // },
      sort: {
        pid: 1,
        timestamp: -1
      }
    }
  ).fetch();

  const users = Users.find(
    {},
    {
      fields: {
        pid: 1,
        name: 1,
        teammates: 1,
        preference: 1
      }
    }
  ).fetch();

  const quizzes = Quizzes.find({ activity_id: { $in: a_ids } }).fetch();

  return { sessions, teams, teamsByDay, responses, users, quizzes, activity_ids };
})(DataOverview);
