// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/record'
], function(
  StageView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    getTemplateData: function()
    {
      return {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      };
    },

    getFormActions: function()
    {
      const actions = [];

      if (!this.model.canEdit())
      {
        return actions;
      }

      actions.push({
        id: 'nextStep',
        className: 'btn-success',
        icon: 'fa-check'
      });

      if (this.model.canCancel())
      {
        actions.push({
          id: 'cancel',
          className: 'btn-danger btn-push-right',
          icon: 'fa-stop'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
    },

    handleNextStepAction: function(formView)
    {
      this.model.set('newStage', 'finished');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    serializeForm: function(formData)
    {
      return {
        accountingNo: (formData.accountingNo || '').trim(),
        odwNo: (formData.odwNo || '').trim(),
        comment: (formData.comment || '').trim()
      };
    }

  });
});
