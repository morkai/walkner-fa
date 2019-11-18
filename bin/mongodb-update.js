/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.users.find({}).forEach(user =>
{
  var p = {};

  user.privileges.forEach(privilege => p[privilege] = 1);

  if (p['FA:OT:protocol'] || p['FA:OT:document'])
  {
    p['FA:OT:ADD'] = 1;

    delete p['FA:OT:protocol'];
    delete p['FA:OT:document'];
  }

  if (p['FA:LT:protocol'])
  {
    p['FA:LT:ADD'] = 1;

    delete p['FA:LT:protocol'];
  }

  delete p['FA:OT:add'];
  delete p['FA:OT:accept'];
  delete p['FA:OT:authorize'];
  delete p['FA:LT:add'];
  delete p['FA:LT:acceptOwner'];
  delete p['FA:LT:acceptDocument'];

  if (p['FA:VIEW'])
  {
    delete p['FA:OT:VIEW'];
    delete p['FA:LT:VIEW'];
  }

  db.users.updateOne({_id: user._id}, {$set: {
    privileges: Object.keys(p)
  }});
});
