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

    template,

    events: Object.assign({

      'change [name="commissioningType"]': function()
      {
        const extendedDep = this.$('[name="commissioningType"]:checked').val() === 'inc-asset';

        this.$id('extendedDep')
          .toggleClass('hidden', !extendedDep)
          .find('[value="false"]')
          .prop('checked', true);
      }

    }, FormView.prototype.events),

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
