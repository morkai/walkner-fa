/* eslint-disable no-var,quotes,curly */
/* global ObjectId,db,print */

'use strict';

db.faassetgroups.find({evalGroup5: /PL-2/}).forEach(g =>
{
  db.faassetgroups.updateOne({_id: g._id}, {$set: {evalGroup5: g.evalGroup5.replace('PL-2', 'PL2-')}});
});

db.faots.find({'assets.evalGroup5': /PL-2/}).forEach(ot =>
{
  ot.assets.forEach(a =>
  {
    a.evalGroup5 = a.evalGroup5.replace('PL-2', 'PL2-');
  });

  db.faots.updateOne({_id: ot._id}, {$set: {assets: ot.assets}});
});
