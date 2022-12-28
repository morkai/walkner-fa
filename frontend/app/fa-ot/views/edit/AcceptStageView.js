// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  './AssetsInputView',
  'app/fa-ot/templates/edit/accept'
], function(
  StageView,
  AssetsInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    initialize()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.assetsView = new AssetsInputView({
        model: this.model
      });

      this.setView('#-assets', this.assetsView);
    },

    getTemplateData()
    {
      return {
        model: this.model.attributes,
        details: this.model.serializeDetails()
      };
    },

    getFormActions()
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

    handleFormAction(action, formView)
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

    afterRender()
    {
      this.assetsView.checkValidity();
    },

    serializeToForm(formData)
    {
      this.assetsView.serializeToForm(formData);

      return formData;
    },

    serializeForm(formData)
    {
      const data = {
        comment: (formData.comment || '').trim()
      };

      this.assetsView.serializeForm(data);

      return data;
    }

  });
});
