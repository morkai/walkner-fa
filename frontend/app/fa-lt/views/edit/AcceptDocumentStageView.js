// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  'app/fa-lt/templates/edit/acceptDocument'
], function(
  time,
  StageView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    getTemplateData()
    {
      return {
        model: this.model.toJSON(),
        details: this.model.serializeDetails()
      };
    },

    getFormActions()
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
          actions: ['protocol', 'verify', 'acceptFinance', 'acceptDepartment', 'verifyDocument']
        },
        {
          id: 'cancel',
          className: 'btn-danger',
          icon: 'fa-stop'
        }
      ];
    },

    handleFormAction(action, formView)
    {
      if (action === 'accept')
      {
        formView.handleNewStageAction('record');
      }
      else if (action === 'reject')
      {
        formView.handleNewStageAction('verify', {submit: {toggleRequired: false}});
      }
      else if (action === 'protocol'
        || action === 'verify'
        || action === 'acceptFinance'
        || action === 'acceptDepartment'
        || action === 'verifyDocument')
      {
        formView.handleNewStageAction(action, {submit: {toggleRequired: false}});
      }
    },

    serializeToForm(formData)
    {
      if (!formData.documentDate)
      {
        formData.documentDate = time.getMoment().format('YYYY-MM-DD');
      }

      return formData;
    },

    serializeForm(formData)
    {
      const data = {
        comment: (formData.comment || '').trim(),
        documentDate: formData.documentDate
          ? time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString()
          : null
      };

      return data;
    }

  });
});
