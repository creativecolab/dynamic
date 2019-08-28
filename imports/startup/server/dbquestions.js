const dbquestions = [
  {
    label: 'icebreaker',
    color: '#1E91D6',
    prompts: [
      'Compartilhe o que você fez neste verão.',
      'Qual foi o último filme que você assistiu? Você recomendaria?',
      'Qual é o sonho mais estranho que você já teve?',
      'Qual é a sua série favorita e por quê?',
      'Quem é seu personagem favorito da Disney e por quê?',
      'Qual talento você gostaria de ter?',
      'Qual sua música favorita e por quê?',
      'Compartilhe algo engraçado que aconteceu com você esta semana.',
      'Compartilhe uma de suas memórias de infância favoritas.',
      'Quais são seus hobbies?',
      'Qual é o seu emprego dos sonhos?',
      'Qual é o seu animal favorito e por quê?',
      'Se você pudesse trocar de vida com qualquer pessoa no mundo por um dia, quem seria?',
      'Compartilhe um hábito estranho que você tem.',
      'Onde é o seu lugar favorito para ir e por quê?',
      'Se você pudesse mudar uma coisa sobre si mesmo, o que seria?',
      'Se você pudesse conhecer qualquer celebridade, quem seria e por quê?',
      'O que é algo que você costumava não gostar, mas agora você gosta?'
    ]
  },
  {
    label: 'design',
    color: '#F05D5E',
    prompts: [
      'Júlia tem muita dificuldade para falar em público e sofre muito com insônia. Que produto você poderia criar para ajudá-la?',
      'Maria não consegue acompanhar as aulas e se distrai muito fácil com seu celular. Que produto você poderia criar para ajudar Maria?',
      'Cláudio chega nas aulas, pega presença e vai embora. Qual poderia ser o problema que Cláudio enfrenta e como você poderia ajudá-lo?',
      'Eduardo não consegue parar de fumar, que produto você poderia criar para ajudar Eduardo?',
      'Junior tem muita dificuldade em ficar acordado nas aulas, qual poderia ser o problema que Junior está enfrentando e como você poderia ajudá-lo?',
      'Joana está tendo problemas em lidar com a raiva, o que poderia estar causando isso e como você poderia ajudá-la?',
      'Lukas tem dificuldade em controlar sua alimentação. Que produto você poderia criar para ajudá-lo?',
      'Charlie é tem dificuldade em controlar sua hiperatividade e inquietação durante as aulas. Que produto você poderia criar para ajudá-lo?',
      'Sara tem estado sem motivação e está cada vez mais se isolando de seus amigos. Que produto você poderia criar para ajudar Sara?',
      'José tem 72 anos e está com dificuldade em lembrar as coisas do dia-a-dia. Como você poderia ajudar José?'
    ]
  },
  {
    label: 'team',
    color: '#0CB755',
    prompts: [
      'Quais são seus pontos fortes como membro de uma equipe?',
      'Quais habilidades práticas você pode contribuir para uma equipe?',
      'Onde você prefere estudar em equipe?',
      'Quais são os horarios que você está livre para trabalhar em equipe?'
    ]
  }
];

export default dbquestions;

// const dbquestions = [
//   {
//     label: 'icebreaker',
//     color: "#1E91D6",
//     prompts: [
//       'Share what you did this summer.',
//       'Where do you see yourself five years in the future?',
//       'If you could travel anywhere in the world, where would you travel?',
//       'What is the last movie you watched and would you recommend it?',
//       'If you were any kitchen utensil, which would you be and why?',

//       "What is the weirdest dream you've had?",
//       "What is something you've always wanted to buy?",
//       'What is your favorite TV show and why?',
//       'What is something you used to like that now you dislike?',
//       'What is an unpopular opinion you have?',

//       'Who is your favorite Disney character and why?',
//       'What is a talent you wish you had?',
//       'What is your favorite song and why?',
//       'Share something funny that happened to you this week.',
//       "Is there something that you've dreamed of doing for a long time? Why haven't you done it?",

//       'Share one of your favorite childhood memories.',
//       'What kind of music do you like to listen to?',
//       'What is your favorite subject and why?',
//       'What is something that you are putting off right now?',
//       'If you were just given $20, how would you spend it?',

//       'Who is someone you admire or look up to?',
//       'Share a personal achievement you are proud of.',
//       'Share a time you stepped outside of your comfort zone. Did it pay off?',
//       'What are the top 3 things on your bucket list?',
//       'What are your hobbies?',

//       "What's your dream job?",
//       'What is your favorite animal and why?',
//       'If you could switch lives with anyone in the world for a day, who would it be?',
//       'Share an odd habit or quirk you have.',
//       'What is a memory you wish you could relive?',

//       'Where is your favorite place to go and why?',
//       'If you could change one thing about yourself, what would it be?',
//       'What life lessons have you learned this past year?',
//       'If you could meet any celebrity, who would it be and why?',
//       'What is something you used to dislike but now you like?',

//       'What is your spirit animal and why?',
//       'Who is a fictional character you resonate with and why?',
//       'What is the best gift you have ever received?',
//       'If you could travel back in time to anywhere, where/when would it be?',
//       'Share a weird fear or phobia that you have.',

//       'What is something that you are looking forward to?',
//       'What advice would you give to your middle school self?',
//       'Share your idea of a perfect day.',
//       'How do you plan to spend tomorrow?',
//       "What is something new you've learned recently?",

//       "What's your favorite holiday and why?",
//       'If you had to become a teacher, what subject would you teach?',
//       'What is your favorite book and why?',
//       'Share something you are grateful for.',
//       'What pet peeves do you have?'
//     ]
//   },
//   {
//     label: 'design',
//     color: "#F05D5E",
//     prompts: [
//       'Jane is a college student who has trouble staying awake in class. Apart from sleep trackers, what product can you design to help Jane overcome this problem?',
//       'Rob is struggling to quit smoking. What product/service can you design to help Rob quit?',
//       'Ben is a high school student with anger management issues. What product/service can you design to help Ben better manage his emotions?',
//       'Jerry doesn’t get enough exercise. Apart from activity trackers, what product/service can you design to help motivate him to exercise?',
//       'Claire struggles with frequent stress at work. What product/service can you design to help Claire cope with her stress?',
//       'Ann is a busy mother who can’t spend much time at home with her 4 year old child. What product/service can you design for Ann to stay connected with her child?',
//       'Luke has difficulty managing a healthy diet. What product/service can you design to help him eat healthier?',
//       'Charlie is an energetic middle schooler who has difficulty controlling his hyperactivity and fidgeting while in class. What solutions can you design to help him concentrate?',
//       'Apart from the prompts you’ve already seen, what other health-related design problems are you interested in working on this quarter?'
//     ]
//   },
//   {
//     label: 'team',
//     color: "#0CB755",
//     prompts: [
//       'Have you taken any previous courses related to this class? If so, which ones?',
//       'What previous group projects have you taken on and what was your role on the team?',
//       "Based on previous team projects, what do you think worked and didn't work for you?",
//       'What do you believe is the most important factor for a successful team?',
//       'What are your strengths as a team member?'
//     ]
//   }
// ];

// export default dbquestions;
