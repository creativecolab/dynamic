// Enums for Activities
const ActivityEnums = {
  name: {
    ICEBREAKER: 'icebreaker',
    TEAM_DISCUSSION: 'team_discussion',
    QUIZ: 'quiz',
    CREATIVE: 'creative'
  },

  status: {
    READY: 0,
    BUILDING_TEAMS: 1,
    TEAM_FORMATION: 2,
    INPUT_TEAM: 3,
    ASSESSMENT: 4,
    FINISHED: 5
  },

  quiz: {
    MULTI_CHOICE: 0,
    FREE_RESPONSE: 1
  }
};

export default ActivityEnums;
