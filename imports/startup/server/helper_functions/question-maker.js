/**
 * This file contains functionality for automating the system's discussion question set-up.abs
 */ 
import Questions from '../../../api/questions';

// make some default questions for TeamDiscussion
export function createDefaultQuestions() {
  if (Questions.find({owner: 'default'}).count() !== 0) {
    return;
  }

  // for each group of questions
  dbquestions.map(group => {
    // icebreaker questions
    if (group.label === 'icebreaker') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 3 === 0) round += 1;

        Questions.insert({
          owner: 'default',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          teamViewTimer: [],
          timesViewed: 0,
          label: 'ICEBREAKER',
          color: group.color,
          round
        });
      });
    } else if (group.label === 'ideation') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 2 === 0) round += 1;


        Questions.insert({
          owner: 'default',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          teamViewTimer: [],
          timesViewed: 0,
          label: 'IDEATION',
          color: group.color,
          round: round
        });
      });
    } else if (group.label === 'team') {
      let round = 0;

      group.prompts.map((q, index) => {
        if (index % 3 === 0) round += 1;

        Questions.insert({
          owner: 'default',
          prompt: q,
          default: true,
          createdTime: new Date().getTime(),
          viewTimer: 0,
          teamViewTimer: [],
          timesViewed: 0,
          label: 'TEAM QUESTION',
          color: group.color,
          round: round
        });
      });
    }
  });
}

// make some default questions for TeamDiscussion
export function createCustomQuestions(instructor, questions) {
  if (Questions.find({owner: instructor}).count() !== 0) {
    return;
  }

  // for each group of questions
  questions.map(group => {
    // get the correct label
    let round = 0;

    group.prompts.map((q, index) => {
      if (index % group.numPerRound === 0) round += 1;

      Questions.insert({
        owner: instructor,
        prompt: q,
        default: true,
        createdTime: new Date().getTime(),
        viewTimer: 0,
        teamViewTimer: [],
        timesViewed: 0,
        label: group.label,
        color: group.color,
        round
      });
    });
  });
}

const dbquestions = [
  {
    label: 'icebreaker',
    color: "#1E91D6",
    prompts: [

      "What is the best TV show/movie that you watched recently?",
      "UC Socially Dead; Agree or disagree? ",
      "Star Wars or Star Trek?",

      "What other languages do you speak? Teach everyone to say “hello” in that language.",
      "Who is your favorite singer/band?",
      "What is an item on your bucket list?",

      "If you were to become a YouTuber, what would your topic be (e.g., vlogger, gamer, etc.)?",
      "What is your favorite thing to do at the beach?",
      "Who are your most and least favorite professors so far?",

      "What are you looking forward to?",
      "What is the best TV show/movie that you watched recently?",
      "Star Wars or Star Trek?",
      
      'If you had to become a teacher, what subject would you teach?',
      "What other languages do you speak? Teach everyone to say “hello” in that language.",
      "Who are your most and least favorite professors so far?",

    ]
  },
  {
    label: 'ideation',
    color: "#F05D5E",
    prompts: [

      'Jane is a college student who has trouble staying awake in class. Apart from sleep trackers, what product can you design to help Jane overcome this problem?',
      'Luke has difficulty controlling his eating. What product/service can you design to help him eat healthier?',

      'How would you design for a more efficient recycling mechanism, as opposed to multiple, physical bins right next to each other?',
      'Seth struggles with frequent stress at work. What product/service can you design to help Seth cope with his stress?',

      'Camille is frequently forgetting her belongings at her friends houses. What kind of solution can you design to help Camille overcome her forgetfulness?',
      'Jane is a college student who has trouble staying awake in class. Apart from sleep trackers, what product can you design to help Jane overcome this problem?',

      'Seth struggles with frequent stress at work. What product/service can you design to help Seth cope with his stress?',
      'How would you design for a more efficient recycling mechanism, as opposed to multiple, physical bins right next to each other?',

      'Luke has difficulty controlling his eating. What product/service can you design to help him eat healthier?',
      'Camille is frequently forgetting her belongings at her friends houses. What kind of solution can you design to help Camille overcome her forgetfulness?',

    ]
  },
  {
    label: 'team',
    color: "#0CB755",
    prompts: [
      
      'What do you believe is the most important factor for a successful team?',
      'How is your course load this quarter?',
      'What do you hope to get out of this class?',

      'Ideally, how often would you like to meet with your team members?',
      "Based on previous team projects, what do you think worked and didn't work for you?",
      'What do you look for in a good team member?',

      "If you were to specialize, which would you be? Colorist, Layout Specialist, Information Designer, or Content Writer.",
      'What do you believe is the most important factor for a successful team?',
      'How is your course load this quarter?',

      'What do you hope to get out of this class?',
      'Ideally, how often would you like to meet with your team members?',
      "Based on previous team projects, what do you think worked and didn't work for you?",

      'What do you look for in a good team member?',
      "If you were to specialize, which would you be? Colorist, Layout Specialist, Information Designer, or Content Writer.",
      'What do you believe is the most important factor for a successful team?',
    ]
  }
];
