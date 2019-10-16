// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/View',
  'app/fa-common/views/ValueInputView',
  'app/fa-lt/templates/edit/verify'
], function(
  View,
  ValueInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      var view = this;

      view.valueViews = {
        initialValue: new ValueInputView({
          property: 'initialValue',
          model: view.model
        }),
        deprecationValue: new ValueInputView({
          property: 'deprecationValue',
          required: false,
          model: view.model
        }),
        netValue: new ValueInputView({
          property: 'netValue',
          readOnly: true,
          required: false,
          model: view.model
        }),
        economicInitialValue: new ValueInputView({
          property: 'economicInitialValue',
          required: true,
          model: view.model
        }),
        economicDeprecationValue: new ValueInputView({
          property: 'economicDeprecationValue',
          required: false,
          model: view.model
        }),
        economicNetValue: new ValueInputView({
          property: 'economicNetValue',
          readOnly: true,
          required: false,
          model: view.model
        })
      };

      Object.keys(view.valueViews).forEach(function(prop)
      {
        view.setView('#-' + prop, view.valueViews[prop]);
      });

      view.listenTo(view.valueViews.initialValue, 'change', view.updateFiscalNetValue);
      view.listenTo(view.valueViews.deprecationValue, 'change', view.updateFiscalNetValue);
      view.listenTo(view.valueViews.economicInitialValue, 'change', view.updateEconomicNetValue);
      view.listenTo(view.valueViews.economicDeprecationValue, 'change', view.updateEconomicNetValue);
    },

    getTemplateData: function()
    {
      var lt = this.model;

      return {
        url: lt.url(),
        kind: lt.get('kind'),
        details: lt.serializeDetails()
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
          id: 'acceptOwner',
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
      if (action === 'acceptOwner')
      {
        this.handleAcceptOwnerAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleAcceptOwnerAction: function(formView)
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
      var view = this;

      Object.keys(view.valueViews).forEach(function(prop)
      {
        view.valueViews[prop].serializeToForm(formData);
      });

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;
      var data = {
        comment: (formData.comment || '').trim(),
        assetName: (formData.assetName || '').trim(),
        sapNo: (formData.sapNo || '').trim()
      };

      Object.keys(view.valueViews).forEach(function(prop)
      {
        view.valueViews[prop].serializeForm(data);
      });

      return data;
    },

    updateFiscalNetValue: function()
    {
      var formData = {};

      this.valueViews.initialValue.serializeForm(formData);
      this.valueViews.deprecationValue.serializeForm(formData);
      this.valueViews.netValue.setValue(formData.initialValue - formData.deprecationValue);
    },

    updateEconomicNetValue: function()
    {
      var formData = {};

      this.valueViews.economicInitialValue.serializeForm(formData);
      this.valueViews.economicDeprecationValue.serializeForm(formData);
      this.valueViews.economicNetValue.setValue(formData.economicInitialValue - formData.economicDeprecationValue);
    }

  });
});
