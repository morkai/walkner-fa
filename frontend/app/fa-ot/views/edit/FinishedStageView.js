// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/user',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/views/TransactionsInputView',
  './ZplxInputView',
  './VerifyStageView',
  'app/fa-ot/templates/edit/finished'
], function(
  time,
  user,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  ValueInputView,
  TransactionsInputView,
  ZplxInputView,
  VerifyStageView,
  template
) {
  'use strict';

  return StageView.extend({

    template,

    updateOnChange: false,

    events: Object.assign({

      'change #-costCenter': function()
      {
        const costCenter = dictionaries.costCenters.get(this.$id('costCenter').val());

        if (!costCenter)
        {
          return;
        }

        const owner = costCenter.get('owner');

        if (!owner)
        {
          return;
        }

        const $owner = this.$id('owner');

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
      this.valueView = new ValueInputView({model: this.model});
      this.transactionsView = new TransactionsInputView({
        model: this.model,
        required: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-value', this.valueView);
      this.setView('#-transactions', this.transactionsView);

      this.listenTo(this.zplxView, 'change', this.onZplxChange);
    },

    getTemplateData: function()
    {
      const model = this.model;
      const files = [];

      if (model.get('protocolNeeded'))
      {
        files.push('protocol');
      }

      files.push('checklist', 'outlay');

      if (model.get('usageDestination') === 'external-supplier')
      {
        files.push('certificate', 'nameplate');
      }

      if (model.get('commissioningType') === 'new-asset')
      {
        files.push('photo');
      }

      files.push('hrt', 'attachment');

      return {
        model: model.toJSON(),
        details: model.serializeDetails(),
        files
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
      this.setUpEvalGroup1Select2();
      this.setUpEvalGroup5Select2();
      this.setUpAssetClassSelect2();
      this.setUpDepKeySelect2();
      this.setUpEconomicMethodSelect2();
      this.setUpCostCenterSelect2();
      this.setUpOwnerSelect2();
      this.zplxView.checkValidity();
    },

    setUpEvalGroup1Select2: function()
    {
      VerifyStageView.prototype.setUpEvalGroup1Select2.apply(this, arguments);
    },

    setUpEvalGroup5Select2: function()
    {
      VerifyStageView.prototype.setUpEvalGroup5Select2.apply(this, arguments);
    },

    setUpAssetClassSelect2: function()
    {
      VerifyStageView.prototype.setUpAssetClassSelect2.apply(this, arguments);
    },

    setUpDepKeySelect2: function()
    {
      VerifyStageView.prototype.setUpDepKeySelect2.apply(this, arguments);
    },

    setUpEconomicMethodSelect2: function()
    {
      VerifyStageView.prototype.setUpEconomicMethodSelect2.apply(this, arguments);
    },

    selectAssetClass: function()
    {
      VerifyStageView.prototype.selectAssetClass.apply(this, arguments);
    },

    selectDepKey: function()
    {
      VerifyStageView.prototype.selectDepKey.apply(this, arguments);
    },

    updatePeriods: function()
    {
      VerifyStageView.prototype.updatePeriods.apply(this, arguments);
    },

    updateMethods: function()
    {
      VerifyStageView.prototype.updateMethods.apply(this, arguments);
    },

    setUpCostCenterSelect2: function()
    {
      const id = this.model.get('costCenter');
      const model = dictionaries.costCenters.get(id);
      const data = [];

      if (id && !model)
      {
        data.push({
          id: id,
          text: id
        });
      }

      dictionaries.costCenters.forEach(d =>
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

    setUpOwnerSelect2: function()
    {
      if (this.model.get('protocolNeeded'))
      {
        return;
      }

      const owner = this.model.get('owner');
      const $owner = this.$id('owner');

      setUpUserSelect2($owner);

      if (owner)
      {
        $owner.select2('data', {
          id: owner._id,
          text: owner.label
        });
      }
    },

    serializeToForm: function(formData)
    {
      this.valueView.serializeToForm(formData);

      VerifyStageView.prototype.serializeToForm.apply(this, arguments);

      return formData;
    },

    serializeForm: function(formData)
    {
      const protocolNeeded = this.model.get('protocolNeeded');
      const data = {
        protocolDate: protocolNeeded
          ? time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString()
          : null,
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        lineSymbol: (formData.lineSymbol || '').trim(),
        supplier: (formData.supplier || '').trim(),
        costCenter: formData.costCenter || null,
        vendorNo: (formData.vendorNo || '').trim(),
        vendorName: (formData.vendorName || '').trim(),
        assetNo: (formData.assetNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim(),
        odwNo: (formData.odwNo || '').trim()
      };

      if (protocolNeeded)
      {
        const costCenter = dictionaries.costCenters.get(data.costCenter);

        if (costCenter && !this.model.get('owner'))
        {
          const owner = costCenter.get('owner');

          if (owner)
          {
            data.owner = owner;
          }
        }
      }
      else
      {
        data.owner = setUpUserSelect2.getUserInfo(this.$id('owner'));
      }

      this.valueView.serializeForm(data);

      Object.assign(data, VerifyStageView.prototype.serializeForm.apply(this, arguments));

      return data;
    },

    onZplxChange: function()
    {
      this.valueView.setValue(this.zplxView.getTotalValue());
    }

  });
});
