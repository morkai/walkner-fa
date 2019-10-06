// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/ValueInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/document'
], function(
  time,
  View,
  idAndLabel,
  dictionaries,
  ValueInputView,
  ZplxInputView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      this.zplxView = new ZplxInputView({model: this.model});
      this.valueView = new ValueInputView({model: this.model});

      this.setView('#-zplx', this.zplxView);
      this.setView('#-value', this.valueView);
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
      var actions = [];

      if (this.model.canEdit())
      {
        actions.push({
          id: 'verify',
          className: 'btn-success',
          icon: 'fa-check'
        });
      }

      return actions;
    },

    handleFormAction: function(action, formView)
    {
      if (action === 'verify')
      {
        this.handleVerifyAction(formView);
      }
    },

    handleVerifyAction: function(formView)
    {
      this.model.set('newStage', 'verify');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    afterRender: function()
    {
      this.setUpDestinationSelect2();
      this.setUpCostCenterSelect2();
      this.zplxView.checkValidity();
    },

    setUpDestinationSelect2: function()
    {
      var id = this.model.get('destination');
      var model = dictionaries.destinations.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.destinations.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('destination').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    setUpCostCenterSelect2: function()
    {
      var id = this.model.get('costCenter');
      var model = dictionaries.costCenters.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.costCenters.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('costCenter').select2({
        width: '100%',
        allowClear: true,
        placeholder: ' ',
        data: data
      });
    },

    serializeToForm: function(formData)
    {
      if (!formData.documentDate)
      {
        formData.documentDate = time.getMoment().format('YYYY-MM-DD');
      }

      if (!formData.costCenter
        && this.model.get('usageDestination') === 'external-supplier'
        && dictionaries.costCenters.get('PL02AD13'))
      {
        formData.costCenter = 'PL02AD13';
      }

      this.zplxView.serializeToForm(formData);
      this.valueView.serializeToForm(formData);

      return formData;
    },

    serializeForm: function(formData)
    {
      var usageDestination = this.model.get('usageDestination');
      var data = {
        comment: (formData.comment || '').trim(),
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        inventoryNo: (formData.inventoryNo || '').trim(),
        assetName: (formData.assetName || '').trim(),
        supplier: (formData.supplier || '').trim(),
        destination: formData.destination || null,
        costCenter: formData.costCenter || null
      };

      if (usageDestination === 'factory')
      {
        Object.assign(data, {
          lineSymbol: (formData.lineSymbol || '').trim()
        });
      }
      else if (usageDestination === 'external-supplier')
      {
        Object.assign(data, {
          vendorNo: (formData.vendorNo || '').trim(),
          vendorName: (formData.vendorName || '').trim()
        });
      }

      this.zplxView.serializeForm(data);
      this.valueView.serializeForm(data);

      return data;
    }

  });
});
