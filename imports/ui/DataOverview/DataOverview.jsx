import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import { Chart } from 'react-google-charts';
import Loading from '../Components/Loading/Loading';
import Responses from '../../api/responses';
import Users from '../../api/users';
import Teams from '../../api/teams';
import Sessions from '../../api/sessions';
import Tags from '../Components/Tags/Tags';
import Quizzes from '../../api/quizzes';

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

    if (activity_ids[0].includes(t.activity_id)) return [t.teamFormationTime / 1000, null, null];

    if (activity_ids[1].includes(t.activity_id)) return [null, t.teamFormationTime / 1000, null];

    if (activity_ids[2].includes(t.activity_id)) return [null, null, t.teamFormationTime / 1000];
  }

  renderTeamFormationTime(teams) {
    const data = teams.map(t => this.getCodeForTeam(t));
    const { sessions } = this.props;

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

  render() {
    const { responses, users, sessions, quizzes, activity_ids, teams } = this.props;

    if (!responses || !teams || !users || !sessions || !quizzes) return <Loading />;

    const { quiz_id, type, pid } = this.state;

    const average = arr => arr.reduce((p, c) => p + c, 0) / arr.length;

    if (!sessions[0] || !sessions[1] || !sessions[2]) return '';

    if (!activity_ids[0] || !activity_ids[1] || !activity_ids[2]) return '';

    return (
      <div>
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
            <tr>
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
            </tr>
            <tr>
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
            </tr>
            <tr>{/* <td>{sessions.map(s => new Date(s.timestamp).toDateString()).join()}</td> */}</tr>
            <tr>{/* <td>{sessions.map(s => s.participants.length).join()}</td> */}</tr>
          </tbody>
        </table>
        {this.renderTeamFormationTime(teams)}
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

  const sessions = Sessions.find(
    {
      code: { $in: ['dsgn100', 'dsgn100quiz', 'quiz2'] }
    },
    {
      fields: {
        _id: 1,
        code: 1,
        participants: 1,
        activities: 1,
        timestamp: 1
      },
      sort: {
        timestamp: -1
      }
    }
  ).fetch();

  if (!sessions) return {};

  const activity_ids = sessions.map(s => s.activities);

  const a_ids = flatten(activity_ids);

  if (!a_ids) return {};

  const teams = Teams.find({ activity_id: { $in: a_ids } }).fetch();

  if (!teams) return {};

  const teamsByDay = {
    '2t1l': teams.filter(t => activity_ids[2].includes(t.activity_id)),
    quiz1: teams.filter(t => activity_ids[1].includes(t.activity_id)),
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
        name: 1
      }
    }
  ).fetch();

  const quizzes = Quizzes.find({ activity_id: { $in: a_ids } }).fetch();

  return { sessions, teams, teamsByDay, responses, users, quizzes, activity_ids };
})(DataOverview);
