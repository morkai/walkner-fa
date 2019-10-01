// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-lt/templates/edit/acceptStage'
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
        stage: 'acceptFinance',
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
          id: 'record',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-danger',
          icon: 'fa-times'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'record')
      {
        this.handleRecordAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleRecordAction: function(formView)
    {
      this.model.set('newStage', 'record');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'acceptDepartment');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    serializeForm: function(formData)
    {
      return {
        comment: (formData.comment || '').trim()
      };
    }

  });
});
