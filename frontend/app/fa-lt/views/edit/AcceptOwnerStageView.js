// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/user',
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/acceptOwner'
], function(
  user,
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

      if (!this.model.isAcceptable())
      {
        return [
          {
            id: 'reject',
            className: 'btn-warning',
            icon: 'fa-times',
            label: this.t('FORM:ACTION:reject'),
            title: this.t('FORM:ACTION:reject:unacceptable')
          },
          {
            id: 'cancel',
            className: 'btn-danger',
            icon: 'fa-stop'
          }
        ];
      }

      return [
        {
          id: 'accept',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times',
          actions: ['protocol', 'verify']
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
      if (action === 'accept')
      {
        formView.handleNewStageAction('acceptFinance');
      }
      else if (action === 'reject')
      {
        formView.handleNewStageAction('verify', {submit: {toggleRequired: false}});
      }
      else if (action === 'protocol'
        || action === 'verify')
      {
        formView.handleNewStageAction(action, {submit: {toggleRequired: false}});
      }
    },

    serializeToForm: function(formData)
    {
      return formData;
    },

    serializeForm: function(formData)
    {
      return {
        comment: (formData.comment || '').trim()
      };
    }

  });
});
