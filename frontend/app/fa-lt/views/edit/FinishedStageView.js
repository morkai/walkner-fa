// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/time',
  'app/core/util/idAndLabel',
  'app/users/util/setUpUserSelect2',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  'app/fa-common/views/ParticipantsInputView',
  'app/fa-lt/FaLt',
  'app/fa-lt/templates/edit/finished'
], function(
  time,
  idAndLabel,
  setUpUserSelect2,
  dictionaries,
  StageView,
  ValueInputView,
  ParticipantsInputView,
  FaLt,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    initialize: function()
    {
      var view = this;

      StageView.prototype.initialize.apply(view, arguments);

      view.participantsView = new ParticipantsInputView({
        model: view.model,
        owner: false,
        required: false
      });

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

      view.setView('#-participants', view.participantsView);

      if (view.model.get('kind') === 'sale')
      {
        view.valueViews.saleValue = new ValueInputView({
          property: 'saleValue',
          model: view.model
        });
      }

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
      var files = ['attachment'];

      return {
        mergeTypes: FaLt.MERGE_TYPES,
        model: lt.toJSON(),
        details: lt.serializeDetails(),
        files: files
      };
    },

    afterRender: function()
    {
      var view = this;

      view.setUpCostCenterSelect2();
      view.setUpUserSelect2(view.$id('applicant'), view.model.get('applicant'));
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

    setUpUserSelect2: function($input, user)
    {
      setUpUserSelect2($input, {
        width: '100%'
      });

      if (user)
      {
        $input.select2('data', {
          id: user._id,
          text: user.label
        });
      }
    },

    getFormActions: function()
    {
      return [];
    },

    handleFormAction: function(action, formView) // eslint-disable-line no-unused-vars
    {

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
      var kind = view.model.get('kind');
      var data = {
        comment: (formData.comment || '').trim(),
        protocolDate: time.utc.getMoment(formData.protocolDate, 'YYYY-MM-DD').toISOString(),
        documentDate: time.utc.getMoment(formData.documentDate, 'YYYY-MM-DD').toISOString(),
        inventoryNo: (formData.inventoryNo || '').trim(),
        assetName: (formData.assetName || '').trim(),
        costCenter: formData.costCenter || null,
        applicant: setUpUserSelect2.getUserInfo(this.$id('applicant')),
        cause: (formData.cause || '').trim(),
        sapNo: (formData.sapNo || '').trim(),
        accountingNo: (formData.accountingNo || '').trim()
      };

      if (kind === 'merge')
      {
        Object.assign(data, {
          mergeInventoryNo: (formData.mergeInventoryNo || '').trim(),
          mergeLineSymbol: (formData.mergeLineSymbol || '').trim(),
          mergeType: formData.mergeType || null
        });
      }
      else if (kind === 'sale')
      {
        Object.assign(data, {
          buyerName: (formData.buyerName || '').trim(),
          buyerAddress: (formData.buyerAddress || '').trim()
        });
      }

      view.participantsView.serializeForm(data);

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
