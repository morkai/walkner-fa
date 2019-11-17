/* eslint-disable no-var,quotes */
/* global ObjectId,db,print */

'use strict';

db.users.deleteMany({login: {$exists: false}});

db.users.updateMany({}, {$set: {preferences: {language: 'pl'}}});
