// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/views/ParticipantsInputView',
  './ZplxInputView',
  './VerifyStageView',
  'app/fa-ot/templates/edit/finished'
], function(
  time,
  user,
  idAndLabel,
  dictionaries,
  StageView,
  ValueInputView,
  ParticipantsInputView,
  ZplxInputView,
  VerifyStageView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    events: Object.assign({

      'change #-costCenter': function()
      {
        var costCenter = dictionaries.costCenters.get(this.$id('costCenter').val());

        if (!costCenter)
        {
          return;
        }

        var owner = costCenter.get('owner');

        if (!owner)
        {
          return;
        }

        var $owner = this.participantsView.$id('owner');

        if ($owner.length)
        {
          $owner.select2('data', {
            id: owner[user.idProperty],
            text: owner.label
          });
        }
      }

    }, VerifyStageView.prototype.events),

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: true,
        auc: true,
        readOnly: false
      });
      this.participantsView = new ParticipantsInputView({
        model: this.model,
        label: this.t('protocol:participants')
      });
      this.valueView = new ValueInputView({model: this.model});
      this.fiscalValueView = new ValueInputView({
        model: this.model,
        property: 'fiscalValue',
        required: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-participants', this.participantsView);
      this.setView('#-value', this.valueView);
      this.setView('#-fiscalValue', this.fiscalValueView);
    },

    getTemplateData: function()
    {
      var model = this.model;
      var files = [];

      if (model.get('protocolNeeded'))
      {
        files.push('protocol');
      }

      files.push('checklist');

      if (model.get('usageDestination') === 'external-supplier')
      {
        files.push('certificate', 'nameplate');
      }

      files.push('attachment');

      return {
        model: model.toJSON(),
        details: model.serializeDetails(),
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
      this.setUpAssetClassSelect2();
      this.setUpCostCenterSelect2();
      this.zplxView.checkValidity();
    },

    setUpAssetClassSelect2: function()
    {
      var id = this.model.get('assetClass');
      var model = dictionaries.assetClasses.get(id);
      var data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.assetClasses.forEach(function(d)
      {
        if (d.get('active') || d.id === id)
        {
          data.push(idAndLabel(d));
        }
      });

      this.$id('assetClass').select2({
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
      this.zplxView.serializeToForm(formData);
      this.valueView.serializeToForm(formData);
      this.fiscalValueView.serializeToForm(formData);

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
        assetClass: formData.assetClass || null,
        vendorNo: (formData.vendorNo || '').trim(),
        vendorName: (formData.vendorName || '').trim(),
        sapNo: (formData.sapNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim()
      };

      view.zplxView.serializeForm(data);
      view.valueView.serializeForm(data);
      view.fiscalValueView.serializeForm(data);

      if (protocolNeeded)
      {
        view.participantsView.serializeForm(data);
      }

      var verifyData = VerifyStageView.prototype.serializeForm.call(this, formData);

      data.deprecationRate = verifyData.deprecationRate;
      data.economicPeriod = verifyData.economicPeriod;
      data.fiscalPeriod = verifyData.fiscalPeriod;

      return data;
    }

  });
});
