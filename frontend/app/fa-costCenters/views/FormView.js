// Part of <https://miracle.systems/p/walkner-wmes> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/core/views/FormView',
  'app/users/util/setUpUserSelect2',
  'app/fa-costCenters/templates/form'
], function(
  user,
  FormView,
  setUpUserSelect2,
  formTemplate
) {
  'use strict';

  return FormView.extend({

    template: formTemplate,

    afterRender: function()
    {
      FormView.prototype.afterRender.call(this);

      setUpUserSelect2(this.$id('owner'), {
        allowClear: true
      });

      var owner = this.model.get('owner');

      if (owner)
      {
        this.$id('owner').select2('data', {
          id: owner[user.idProperty],
          text: owner.label
        });
      }
    },

    serializeForm: function(formData)
    {
      formData.owner = setUpUserSelect2.getUserInfo(this.$id('owner'));

      return formData;
    }

  });
});
