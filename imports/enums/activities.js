// Enums for Activities
const ActivityEnums = {
  name: {
    ICEBREAKER: 'icebreaker',
    QUIZ: 'quiz',
    CREATIVE: 'creative'
  },

  status: {
    READY: 0,
    INPUT_INDV: 1,
    TEAM_FORMATION: 2,
    INPUT_TEAM: 3,
    SUMMARY: 4,
    FINISHED: 5
  },

  quiz: {
    MULTI_CHOICE: 0,
    FREE_RESPONSE: 1
  }
};

export default ActivityEnums;
