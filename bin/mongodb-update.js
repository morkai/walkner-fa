/* eslint-disable no-var,quotes,curly */
/* global ObjectId,db,print */

'use strict';

db.faots.find({'zplx.code': {$not: /^ZPLX/}}, {zplx: 1}).forEach(d =>
{
  d.zplx.forEach(zplx =>
  {
    if (zplx.code)
    {
      zplx.code = `ZPLX${zplx.code}`;
    }
  });

  db.faots.updateOne({_id: d._id}, {$set: {zplx: d.zplx}});
});
