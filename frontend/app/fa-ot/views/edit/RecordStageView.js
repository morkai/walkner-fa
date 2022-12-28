// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  './AssetsInputView',
  'app/fa-ot/templates/edit/record'
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
      const actions = [];

      if (!this.model.canEdit())
      {
        return actions;
      }

      actions.push({
        id: 'nextStep',
        className: 'btn-success',
        icon: 'fa-check'
      });

      if (this.model.canCancel())
      {
        actions.push({
          id: 'cancel',
          className: 'btn-danger btn-push-right',
          icon: 'fa-stop'
        });
      }

      return actions;
    },

    handleFormAction(action, formView)
    {
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
    },

    handleNextStepAction(formView)
    {
      this.model.set('newStage', 'finished');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
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
