/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.facostcenters.updateMany({owner: {$exists: false}}, {$set: {owner: null}});

var stages = [
  'protocol',
  'verify',
  'acceptOwner',
  'acceptCommittee',
  'acceptFinance',
  'acceptDepartment',
  'acceptDocument',
  'record'
];

db.falts.find({}).forEach(lt =>
{
  var stageChangedAt = {};
  var stageChangedBy = {};

  stages.forEach(stage =>
  {
    stageChangedAt[stage] = lt.stageChangedAt[stage] || null;
    stageChangedBy[stage] = lt.stageChangedBy[stage] || null;
  });

  if (!lt.committeeAcceptance)
  {
    lt.committeeAcceptance = {};

    lt.committee.forEach(user =>
    {
      lt.committeeAcceptance[user._id] = {
        time: new Date(),
        user: user,
        status: null
      };
    });
  }

  db.falts.updateOne({_id: lt._id}, {$set: {
    stageChangedAt,
    stageChangedBy,
    committeeAcceptance: lt.committeeAcceptance
  }});
});
