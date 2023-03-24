/* eslint-disable no-var,quotes,curly */
/* global ObjectId,db,print */

'use strict';

const USER_PROPS = ['createdBy', 'committee'];
const USER_ASSET_PROPS = ['owner'];

db.faots.find({}).forEach(d =>
{
  const users = new Set();

  collectUsers(this, USER_PROPS, users);
  d.assets.forEach(asset => collectUsers(asset, USER_ASSET_PROPS, users));

  db.faots.updateOne({_id: d._id}, {$set: {users: Array.from(users)}});
});

function collectUsers(model, props, userSet)
{
  if (!userSet)
  {
    userSet = new Set();
  }

  if (model.stageChangedBy)
  {
    Object.keys(model.stageChangedBy).forEach(stage =>
    {
      const userInfo = model.stageChangedBy[stage];

      if (userInfo && userInfo._id)
      {
        userSet.add(userInfo._id);
      }
    });
  }

  props.forEach(prop =>
  {
    const value = model[prop];

    if (!value)
    {
      return;
    }

    if (Array.isArray(value))
    {
      value.forEach(userInfo =>
      {
        if (userInfo._id)
        {
          userSet.add(userInfo._id);
        }
      });
    }
    else if (value._id)
    {
      userSet.add(value._id);
    }
  });

  return userSet;
}
