// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-lt/templates/edit/record'
], function(
  View,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    getTemplateData: function()
    {
      var lt = this.model;

      return {
        url: lt.url(),
        kind: lt.get('kind'),
        details: lt.serializeDetails()
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
        sapNo: (formData.sapNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim(),
        comment: (formData.comment || '').trim()
      };
    }

  });
});
