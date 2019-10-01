// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-dashboard/templates/dashboard'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    nlsDomain: 'fa-dashboard'

  });
});
