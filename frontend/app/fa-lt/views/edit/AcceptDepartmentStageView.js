// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/acceptStage'
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
        stage: 'acceptDepartment',
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

    serializeForm: function(formData)
    {
      return {
        comment: (formData.comment || '').trim()
      };
    }

  });
});
