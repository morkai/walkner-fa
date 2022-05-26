// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ParticipantsInputView',
  'app/fa-common/views/AssetNameBuilderDialogView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/protocol'
], function(
  time,
  StageView,
  ParticipantsInputView,
  AssetNameBuilderDialogView,
  ZplxInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    events: {

      'click #-buildAssetName': function()
      {
        AssetNameBuilderDialogView.showDialog(this);
      }

    },

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: false,
        auc: false,
        readOnly: false
      });

      this.setView('#-zplx', this.zplxView);
    },

    getTemplateData: function()
    {
      return {
        model: this.model.toJSON()
      };
    },

    getFormActions: function()
    {
      var actions = [];

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

    handleFormAction: function(action, formView)
    {
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
    },

    handleNextStepAction: function(formView)
    {
      this.model.set('newStage', 'document');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    afterRender: function()
    {
      this.zplxView.checkValidity();
    },

    serializeToForm: function(formData)
    {
      this.zplxView.serializeToForm(formData);

      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        comment: (formData.comment || '').trim(),
        protocolDate: formData.protocolDate
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null,
        assetName: (formData.assetName || '').trim(),
        lineSymbol: (formData.lineSymbol || '').trim(),
        supplier: (formData.supplier || '').trim(),
        inventoryNo: (formData.inventoryNo || '').trim(),
        serialNo: (formData.serialNo || '').trim()
      };

      this.zplxView.serializeForm(data);

      return data;
    }

  });
});
