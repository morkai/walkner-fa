/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.faots.find({assetClass: {$exists: false}}).forEach(doc =>
{
  db.faots.updateOne({_id: doc._id}, {
    $set: {assetClass: doc.destination},
    $unset: {destination: 1}
  });
});

db.fadestinations.find({active: true}).forEach(doc =>
{
  db.faassetclasses.insertOne(doc);
});
db.fadestinations.drop();
