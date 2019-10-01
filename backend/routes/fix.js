// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

/* eslint-disable no-unused-vars */

'use strict';

const moment = require('moment');
const _ = require('lodash');
const step = require('h5.step');
const mongoSerializer = require('h5.rql/lib/serializers/mongoSerializer');

module.exports = (app, express) =>
{
  const logger = app.logger.create({module: 'fix'});

  function onlySuper(req, res, next)
  {
    const user = req.session.user;

    if (user && user.super)
    {
      return next();
    }

    return res.sendStatus(403);
  }
};
