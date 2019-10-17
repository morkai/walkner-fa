// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ParticipantsInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/protocol'
], function(
  time,
  StageView,
  ParticipantsInputView,
  ZplxInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({model: this.model});
      this.participantsView = new ParticipantsInputView({
        model: this.model,
        label: this.t('protocol:participants')
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-participants', this.participantsView);
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
          id: 'authorize',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'authorize')
      {
        this.handleAuthorizeAction(formView);
      }
    },

    handleAuthorizeAction: function(formView)
    {
      this.model.set('newStage', 'authorize');

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
        protocolDate: time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString(),
        assetName: (formData.assetName || '').trim(),
        lineSymbol: (formData.lineSymbol || '').trim(),
        supplier: (formData.supplier || '').trim(),
        inventoryNo: (formData.inventoryNo || '').trim()
      };

      this.zplxView.serializeForm(data);
      this.participantsView.serializeForm(data);

      return data;
    }

  });
});
