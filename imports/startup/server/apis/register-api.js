/* File contains all of the endpoints that we can hit to extract data from the system */
import { Restivus } from 'meteor/nimble:restivus';
import * as data_getter from './data-getter';

/* APIs */

if (Meteor.isServer) {
  // Global API configuration
  const Api = new Restivus({
    useDefaultAuth: true,
    prettyJson: true
  });

  /* Active APIs */

  Api.addRoute('whos_late/:code', {
    get() {
      const content_disposition = 'attachment; filename=late_counts_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getLateCount(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user_info/:code', {
    get() {
      const content_disposition = 'attachment; filename=user_info_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserInfo(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user_assessment/:code', {
    get() {
      const content_disposition = 'attachment; filename=user_assessment_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserAssessment(this.urlParams.code)
      };
    }
  });

  Api.addRoute('groups_info/:code', {
    get() {
      const content_disposition = 'attachment; filename=groups_info_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getGroupsInfo(this.urlParams.code)
      };
    }
  });

  Api.addRoute('questions/:code', {
    get() {
      const content_disposition = 'attachment; filename=questions_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getQuestionsInfo(this.urlParams.code)
      };
    }
  });

  Api.addRoute('default_questions/:code', {
    get() {
      const content_disposition = 'attachment; filename=questions_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getDefaultQuestions(this.urlParams.code)
      };
    }
  });

  Api.addRoute('phase_times/:code', {
    get() {
      const content_disposition = 'attachment; filename=phase_times_[' + this.urlParams.code.toLowerCase() + '].csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getPhaseTimes(this.urlParams.code)
      };
    }
  });

  /* Inactive APIs (not guaranteed to work) */

  Api.addRoute('interactions/:code', {
    get() {
      const content_disposition = 'attachment; filename=interactions_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getInteractions(this.urlParams.code)
      };
    }
  });

  Api.addRoute('users/:code', {
    get() {
      const content_disposition = 'attachment; filename=users_' + this.urlParams.code.toLowerCase() + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserHistory(this.urlParams.code)
      };
    }
  });

  Api.addRoute('last-teams/:code', {
    get() {
      const content_disposition = 'attachment; filename=last-teams_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getLastTeams(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-join-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-join-times_' + this.urlParams.code + '.txt';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserJoinTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('team-confirmation-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=team-confirmation-times_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getTeamConfirmationTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-confirmation-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-confirmation-times_' + this.urlParams.code + '.csv';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserConfirmationTimes(this.urlParams.code)
      };
    }
  });

  Api.addRoute('user-assessment-times/:code', {
    get() {
      const content_disposition = 'attachment; filename=user-assessment-times_' + this.urlParams.code + '.txt';

      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': content_disposition
        },
        body: data_getter.getUserAssessmentTimes(this.urlParams.code)
      };
    }
  });
}
