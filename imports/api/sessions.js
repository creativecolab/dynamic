import { Mongo } from 'meteor/mongo';
// import SimpleSchema from 'simpl-schema';

// eslint-disable-next-line prettier/prettier
export default Sessions = new Mongo.Collection('sessions');

// const sessionsSchema = new SimpleSchema({
//   code: String,
//   participants: [String],
//   activities: [String],
//   status: Number,
//   creationTime: Date,
//   startTime: Date,
//   endTime: Date,
// });

// const sessionValidationContext = sessionsSchema.namedContext('Session Form');

// Sessions.schema = sessionsSchema;

// export default Sessions;
