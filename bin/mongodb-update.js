/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.users.deleteMany({login: {$exists: false}});

db.users.find({}).forEach(user =>
{
  var anyOt = false;
  var anyLt = false;

  user.privileges.forEach(privilege =>
  {
    anyOt = anyOt || privilege.startsWith('FA:OT:');
    anyLt = anyLt || privilege.startsWith('FA:LT:');
  });

  if (anyOt)
  {
    user.privileges.push('FA:OT:VIEW');
  }

  if (anyLt)
  {
    user.privileges.push('FA:LT:VIEW');
  }

  var privileges = {};

  user.privileges.forEach(privilege => privileges[privilege] = 1);

  if (!user.preferences)
  {
    user.preferences = {};
  }

  if (typeof user.preferences.emails !== 'boolean')
  {
    user.preferences.emails = true;
  }

  if (!user.preferences.language)
  {
    user.preferences.language = 'pl';
  }

  db.users.updateOne({_id: user._id}, {$set: {
    privileges: Object.keys(privileges),
    preferences: user.preferences
  }});
});
