import React, { Component } from 'react';
import { withTracker } from 'meteor/react-meteor-data';
import PropTypes from 'prop-types';
import Loading from '../Components/Loading/Loading';
import Responses from '../../api/responses';
import Users from '../../api/users';
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
    quizzes: PropTypes.array
  };

  static defaultProps = {
    responses: [],
    users: [],
    sessions: [],
    quizzes: []
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

  render() {
    const { responses, users, sessions, quizzes } = this.props;

    if (!responses || !users || !sessions || !quizzes) return <Loading />;

    const { quiz_id, type, pid } = this.state;

    return (
      <div>
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
            {/* <th>name</th> */}
            {/* <th>pid</th> */}
            <th>quiz_id</th>
            <th>type</th>
            <th>question_1</th>
            <th>question_2</th>
            <th>question_3</th>
            <th>question_4</th>
          </tr>
          {responses.map((res, index) => {
            if ((type === 'all' || res.type === type) && (quiz_id === 'all' || res.quiz_id === quiz_id))
              return (
                <tr>
                  {/* <td>{this.getName(res.pid)}</td> */}
                  {/* <td>{res.pid.toUpperCase()}</td> */}
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
          })}
        </table>
      </div>
    );
  }
}

export default withTracker(() => ({
  responses: Responses.find(
    {},
    {
      fields: {
        pid: 1,
        type: 1,
        selected: 1,
        quiz_id: 1
      },
      sort: {
        pid: 1,
        timestamp: -1
      }
    }
  ).fetch(),
  users: Users.find(
    {},
    {
      fields: {
        pid: 1,
        name: 1
      }
    }
  ).fetch(),
  sessions: Sessions.find(
    {},
    {
      fields: {
        _id: 1
      }
    }
  ).fetch(),
  quizzes: Quizzes.find().fetch()
}))(DataOverview);
