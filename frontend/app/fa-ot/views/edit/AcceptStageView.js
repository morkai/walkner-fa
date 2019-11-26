// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-ot/templates/edit/accept'
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
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times',
          actions: ['document', 'verify']
        },
        {
          id: 'cancel',
          className: 'btn-danger',
          icon: 'fa-stop'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'nextStep')
      {
        formView.handleNewStageAction('record');
      }
      else if (action === 'document' || action === 'verify')
      {
        formView.handleNewStageAction(action, {submit: {toggleRequired: false}});
      }
    },

    serializeForm: function(formData)
    {
      return {
        comment: (formData.comment || '').trim()
      };
    }

  });
});
