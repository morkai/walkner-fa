// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'underscore',
  'app/core/View',
  '../util/helpers'
], function(
  _,
  View,
  helpers
) {
  'use strict';

  return View.extend({

    initialize()
    {
      helpers.extend(this);
    }

  });
});
