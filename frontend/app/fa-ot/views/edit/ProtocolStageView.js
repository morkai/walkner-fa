// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  './ZplxInputView',
  './ParticipantsInputView',
  'app/fa-ot/templates/edit/protocol'
], function(
  time,
  View,
  ZplxInputView,
  ParticipantsInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      this.zplxView = new ZplxInputView({model: this.model});
      this.participantsView = new ParticipantsInputView({model: this.model});

      this.setView('#-zplx', this.zplxView);
      this.setView('#-participants', this.participantsView);
    },

    getTemplateData: function()
    {
      var ot = this.model;

      return {
        documentId: ot.id,
        commissioningType: ot.get('commissioningType'),
        usageDestination: ot.get('usageDestination'),
        protocolFile: ot.get('protocolFile')
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

      actions.push({
        id: 'printProtocol',
        className: 'btn-default disabled',
        icon: 'fa-print'
      });

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'authorize')
      {
        this.handleAuthorizeAction(formView);
      }
      else if (action === 'printProtocol')
      {
        this.handlePrintProtocolAction(formView);
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

    // TODO
    handlePrintProtocolAction: function(formView)
    {
      if (!this.model.canEdit())
      {
        console.warn('TODO print protocol now');

        return;
      }

      formView.handleNextRequest = function(fail)
      {
        if (fail)
        {
          return;
        }

        console.warn('TODO print protocol');
      };

      formView.submit();
    },

    afterRender: function()
    {
      this.zplxView.checkValidity();
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
