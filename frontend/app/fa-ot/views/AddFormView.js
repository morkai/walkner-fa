// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/views/FormView',
  'app/fa-ot/templates/addForm'
], function(
  FormView,
  template
) {
  'use strict';

  return FormView.extend({

    template: template,

    handleSuccess: function()
    {
      this.broker.publish('router.navigate', {
        url: this.model.genClientUrl('edit'),
        trigger: true,
        replace: false
      });
    }

  });
});
