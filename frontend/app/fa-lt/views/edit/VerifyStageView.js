// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-lt/templates/edit/verify'
], function(
  StageView,
  ValueInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.valueViews = {
        initialValue: new ValueInputView({
          property: 'initialValue',
          model: this.model
        }),
        deprecationValue: new ValueInputView({
          property: 'deprecationValue',
          model: this.model
        }),
        netValue: new ValueInputView({
          property: 'netValue',
          readOnly: true,
          required: false,
          model: this.model
        }),
        economicInitialValue: new ValueInputView({
          property: 'economicInitialValue',
          model: this.model
        }),
        economicDeprecationValue: new ValueInputView({
          property: 'economicDeprecationValue',
          model: this.model
        }),
        economicNetValue: new ValueInputView({
          property: 'economicNetValue',
          readOnly: true,
          required: false,
          model: this.model
        })
      };

      Object.keys(this.valueViews).forEach(prop =>
      {
        this.setView(`#-${prop}`, this.valueViews[prop]);
      });

      this.listenTo(this.valueViews.initialValue, 'change', this.updateFiscalNetValue);
      this.listenTo(this.valueViews.deprecationValue, 'change', this.updateFiscalNetValue);
      this.listenTo(this.valueViews.economicInitialValue, 'change', this.updateEconomicNetValue);
      this.listenTo(this.valueViews.economicDeprecationValue, 'change', this.updateEconomicNetValue);
    },

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
          id: 'accept',
          className: 'btn-success',
          icon: 'fa-check'
        },
        {
          id: 'reject',
          className: 'btn-warning',
          icon: 'fa-times'
        }
      ];
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'accept')
      {
        this.handleAcceptAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleAcceptAction: function(formView)
    {
      this.model.set('newStage', 'acceptOwner');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'protocol');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    serializeToForm: function(formData)
    {
      Object.keys(this.valueViews).forEach(prop =>
      {
        this.valueViews[prop].serializeToForm(formData);
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      const data = {
        assetName: (formData.assetName || '').trim(),
        comment: (formData.comment || '').trim()
      };

      Object.keys(this.valueViews).forEach(prop =>
      {
        this.valueViews[prop].serializeForm(data);
      });

      return data;
    },

    updateFiscalNetValue: function()
    {
      const formData = {};

      this.valueViews.initialValue.serializeForm(formData);
      this.valueViews.deprecationValue.serializeForm(formData);
      this.valueViews.netValue.setValue(formData.initialValue - formData.deprecationValue);
    },

    updateEconomicNetValue: function()
    {
      const formData = {};

      this.valueViews.economicInitialValue.serializeForm(formData);
      this.valueViews.economicDeprecationValue.serializeForm(formData);
      this.valueViews.economicNetValue.setValue(formData.economicInitialValue - formData.economicDeprecationValue);
    }

  });
});
