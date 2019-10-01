// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/View',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/ValueInputView',
  './ZplxInputView',
  './ParticipantsInputView',
  './VerifyStageView',
  'app/fa-ot/templates/edit/finished'
], function(
  time,
  View,
  idAndLabel,
  dictionaries,
  ValueInputView,
  ZplxInputView,
  ParticipantsInputView,
  VerifyStageView,
  template
) {
  'use strict';

  return View.extend({

    template: template,

    updateOnChange: false,

    events: Object.assign({}, VerifyStageView.prototype.events),

    initialize: function()
    {
      this.zplxView = new ZplxInputView({model: this.model});
      this.participantsView = new ParticipantsInputView({model: this.model});
      this.valueView = new ValueInputView({model: this.model});

      this.setView('#-zplx', this.zplxView);
      this.setView('#-participants', this.participantsView);
      this.setView('#-value', this.valueView);
    },

    getTemplateData: function()
    {
      var ot = this.model;
      var files = [];

      if (ot.get('protocolNeeded'))
      {
        files.push('protocol');
      }

      files.push('checklist');

      if (ot.get('usageDestination') === 'external-supplier')
      {
        files.push('certificate', 'nameplate');
      }

      return {
        model: ot.toJSON(),
        details: ot.serializeDetails(),
        files: files
      };
    },

    getFormActions: function()
    {
      return [];
    },

    handleFormAction: function(action, formView) // eslint-disable-line no-unused-vars
    {

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
      this.valueView.serializeToForm(formData);

      VerifyStageView.prototype.serializeToForm.call(this, formData);

      return formData;
    },

    serializeForm: function(formData)
    {
      var view = this;
      var protocolNeeded = view.model.get('protocolNeeded');
      var data = {
        comment: (formData.comment || '').trim(),
        protocolDate: protocolNeeded
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null,
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        inventoryNo: (formData.inventoryNo || '').trim(),
        lineSymbol: (formData.lineSymbol || '').trim(),
        assetName: (formData.assetName || '').trim(),
        supplier: (formData.supplier || '').trim(),
        costCenter: formData.costCenter || null,
        destination: formData.destination,
        vendorNo: (formData.vendorNo || '').trim(),
        vendorName: (formData.vendorName || '').trim(),
        sapNo: (formData.sapNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim()
      };

      view.zplxView.serializeForm(data);
      view.valueView.serializeForm(data);

      if (protocolNeeded)
      {
        view.participantsView.serializeForm(data);
      }

      var verifyData = VerifyStageView.prototype.serializeForm.call(this, formData);

      data.redemptionRate = verifyData.redemptionRate;
      data.economicPeriod = verifyData.economicPeriod;
      data.fiscalPeriod = verifyData.fiscalPeriod;

      return data;
    }

  });
});
