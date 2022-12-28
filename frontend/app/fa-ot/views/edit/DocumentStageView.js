// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  './AssetsInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/document'
], function(
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  ValueInputView,
  AssetsInputView,
  ZplxInputView,
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

      this.listenTo(this.zplxView, 'change', this.onZplxChange);
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

      if (!this.model.get('protocolNeeded') && this.model.canCancel())
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
      this.model.set('newStage', 'verify');

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
      if (!formData.documentDate)
      {
        formData.documentDate = time.getMoment().format('YYYY-MM-DD');
      }

      this.zplxView.serializeToForm(formData);
      this.assetsView.serializeToForm(formData);

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

      this.zplxView.serializeForm(data);
      this.assetsView.serializeForm(data);

      return data;
    },

    onZplxChange()
    {
      this.valueView.setValue(this.zplxView.getTotalValue());
    }

  });
});
