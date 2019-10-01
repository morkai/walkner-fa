// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-ot/views/edit/FormView',
  './stages'
], function(
  FormView,
  stages
) {
  'use strict';

  return FormView.extend({

    getStages: function()
    {
      return stages;
    },

    getTabs: function()
    {
      return Object.keys(stages);
    }

  });
});
