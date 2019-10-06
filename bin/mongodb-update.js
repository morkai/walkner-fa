/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.faots.find().forEach(doc =>
{
  if (doc.zplx.length && typeof doc.zplx[0] === 'string')
  {
    doc.zplx = doc.zplx.map(zplx =>
    {
      return {
        code: zplx,
        value: 0
      };
    });
  }

  doc.changes.forEach(change =>
  {
    const zplx = change.data.zplx;

    if (!zplx
      || (zplx[0].length && typeof zplx[0][0] === 'object')
      || (zplx[1].length && typeof zplx[1][0] === 'object'))
    {
      return;
    }

    zplx[0] = zplx[0].map(code => ({code, value: 0}));
    zplx[1] = zplx[1].map(code => ({code, value: 0}));
  });

  db.faots.updateOne({_id: doc._id}, {$set: {
    zplx: doc.zplx,
    changes: doc.changes
  }});
});
