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
        stage: 'acceptDepartment',
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
          id: 'department:accept',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'department:reject',
          className: 'btn-warning',
          icon: 'fa-times'
        },
        {
          id: 'department:cancel',
          className: 'btn-danger',
          icon: 'fa-thumbs-down'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'department:accept')
      {
        this.handleAcceptAction(formView);
      }
      else if (action === 'department:reject')
      {
        this.handleRejectAction(formView);
      }
      else if (action === 'department:cancel')
      {
        this.handleCancelAction(formView);
      }
    },

    handleAcceptAction: function(formView)
    {
      this.model.set('newStage', 'acceptDocument');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'acceptFinance');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    handleCancelAction: function(formView)
    {
      this.model.set('newStage', 'cancelled');

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
