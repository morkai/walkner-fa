/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.faots.updateMany({photoFile: {$exists: false}}, {$set: {photoFile: null}});

db.faots.find({}, {protocolNo: 1, documentNo: 1}).forEach(d =>
{
  db.faots.updateOne({_id: d._id}, fixNo(d));
});

db.falts.find({}, {protocolNo: 1, documentNo: 1}).forEach(d =>
{
  db.falts.updateOne({_id: d._id}, fixNo(d));
});

function fixNo(d)
{
  ['protocolNo', 'documentNo'].forEach(prop =>
  {
    var value = d[prop];

    if (!value)
    {
      return;
    }

    var parts = value.split('/');

    if (parts.length === 4)
    {
      parts[2] = null;
    }

    d[prop] = parts.filter(p => p !== null).join('/');
  });

  return {$set: {
    protocolNo: d.protocolNo,
    documentNo: d.documentNo
  }};
}
