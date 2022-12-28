// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  './ZplxInputView',
  './AssetsInputView',
  'app/fa-ot/templates/edit/protocol'
], function(
  time,
  StageView,
  ZplxInputView,
  AssetsInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    initialize()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: false,
        auc: false,
        readOnly: false
      });

      this.assetsView = new AssetsInputView({
        model: this.model
      });

      this.setView('#-zplx', this.zplxView);
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

      if (this.model.canEdit())
      {
        actions.push({
          id: 'nextStep',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

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
      this.model.set('newStage', 'document');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    afterRender()
    {
      this.zplxView.checkValidity();
      this.assetsView.checkValidity();
    },

    serializeToForm(formData)
    {
      this.zplxView.serializeToForm(formData);
      this.assetsView.serializeToForm(formData);

      return formData;
    },

    serializeForm(formData)
    {
      const data = {
        comment: (formData.comment || '').trim(),
        protocolDate: formData.protocolDate
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null
      };

      this.zplxView.serializeForm(data);
      this.assetsView.serializeForm(data);

      return data;
    }

  });
});
