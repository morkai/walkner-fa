/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.faots.updateMany({attachmentFile: {$exists: false}}, {$set: {attachmentFile: null}});
db.falts.updateMany({attachmentFile: {$exists: false}}, {$set: {attachmentFile: null}});
