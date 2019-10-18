// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-ot/templates/edit/record'
], function(
  StageView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

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
      if (!this.model.canEdit())
      {
        return [];
      }

      return [
        {
          id: 'finished',
          className: 'btn-success',
          icon: 'fa-check'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'finished')
      {
        this.handleFinishedAction(formView);
      }
    },

    handleFinishedAction: function(formView)
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
        comment: (formData.comment || '').trim()
      };
    }

  });
});
