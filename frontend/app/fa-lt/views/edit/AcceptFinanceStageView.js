// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
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
      return {
        stage: 'acceptFinance',
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
          id: 'finance:accept',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'finance:reject',
          className: 'btn-warning',
          icon: 'fa-times'
        },
        {
          id: 'finance:cancel',
          className: 'btn-danger',
          icon: 'fa-thumbs-down'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'finance:accept')
      {
        this.handleAcceptAction(formView);
      }
      else if (action === 'finance:reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleAcceptAction: function(formView)
    {
      this.model.set('newStage', 'acceptDepartment');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'acceptOwner');

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
