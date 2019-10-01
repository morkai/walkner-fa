// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/DetailsView',
  'app/fa-lt/templates/details'
], function(
  DetailsView,
  template
) {
  'use strict';

  return DetailsView.extend({

    template: template,

    getTemplateData: function()
    {
      var lt = this.model;

      return Object.assign(DetailsView.prototype.getTemplateData.apply(this, arguments), {
        url: lt.url(),
        kind: lt.get('kind')
      });
    }

  });
});
