/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.faots.updateMany({photoFile: {$exists: false}}, {$set: {photoFile: null}});
