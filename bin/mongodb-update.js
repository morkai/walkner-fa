/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.fatas.find({}).forEach(doc =>
{
  try { db.faots.insertOne(doc); }
  catch (err) {} // eslint-disable-line no-empty
});

db.fatas.drop();

db.users.find({}).forEach(user =>
{
  user.privileges = user.privileges.map(p => p.includes('FA:TA') ? p.replace('FA:TA', 'FA:OT') : p);

  db.users.updateOne({_id: user._id}, {$set: {privileges: user.privileges}});
});
