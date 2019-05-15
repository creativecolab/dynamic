import { Mongo } from 'meteor/mongo';
// import SimpleSchema from 'simpl-schema';

const Sessions = new Mongo.Collection('sessions');

// Sessions.schema = new SimpleSchema({
//   code: { type: String }
// });

export default Sessions;
