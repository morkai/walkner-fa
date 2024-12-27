/* eslint-disable no-var,quotes,curly */
/* global ObjectId,db,print */

'use strict';

db.falts.find({accountingNo: {$exists: true}}).forEach(lt =>
{
  lt.assets.forEach(a =>
  {
    a.accountingNo = lt.accountingNo;
  });

  db.falts.updateOne({_id: lt._id}, {$set: {assets: lt.assets}, $unset: {accountingNo: 1}});
});

db.falts.dropIndex({accountingNo: 1});
db.falts.createIndex({'assets.accountingNo': 1});
