// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/fa-common/util/helpers',
  'app/fa-lt/templates/details'
], function(
  DetailsView,
  helpers,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    initialize: function()
    {
      DetailsView.prototype.initialize.apply(this, arguments);

      helpers.extend(this);
    },

    getTemplateData: function()
    {
      var data = DetailsView.prototype.getTemplateData.apply(this, arguments);

      data.details = data.model;
      data.model = this.model.toJSON();

      return data;
    }

  });
});
