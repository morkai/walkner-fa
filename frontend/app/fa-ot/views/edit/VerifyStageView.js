// Part of <https://miracle.systems/p/walkner-fa> licensed under <CC BY-NC-SA 4.0>

define([
  'app/core/util/idAndLabel',
  'app/fa-common/dictionaries',
  'app/fa-common/views/StageView',
  'app/fa-common/views/ValueInputView',
  './ZplxInputView',
  'app/fa-ot/templates/edit/verify'
], function(
  idAndLabel,
  dictionaries,
  StageView,
  ValueInputView,
  ZplxInputView,
  template
) {
  'use strict';

  return StageView.extend({

    template: template,

    updateOnChange: false,

    events: {
      'change #-deprecationRate': function(e)
      {
        var rr = e.target.valueAsNumber;

        if (!rr || rr < 0)
        {
          rr = 0;
        }

        if (rr > 100)
        {
          rr = 100;
        }

        e.target.value = (Math.round(rr * 100) / 100).toLocaleString();

        var ratio = 100 / rr;
        var years = Math.floor(ratio);
        var months = Math.ceil(12 * (ratio % 1));

        if (months === 12)
        {
          years += 1;
          months = 0;
        }

        this.$id('fiscalPeriodY').val(years && isFinite(years) ? years : '0');
        this.$id('fiscalPeriodM').val(months && isFinite(months) ? months : '0');
      },
      'blur #-economicPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        var $y = this.$id('economicPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      },
      'blur #-fiscalPeriodM': function(e)
      {
        if (e.target.value !== '12')
        {
          return;
        }

        e.target.value = '0';

        var $y = this.$id('fiscalPeriodY');

        $y.val((parseInt($y.val(), 10) || 0) + 1);
      }
    },

    initialize: function()
    {
      StageView.prototype.initialize.apply(this, arguments);

      this.zplxView = new ZplxInputView({
        model: this.model,
        value: true,
        auc: true,
        readOnly: true
      });
      this.fiscalValueView = new ValueInputView({
        model: this.model,
        property: 'fiscalValue',
        required: true
      });

      this.setView('#-zplx', this.zplxView);
      this.setView('#-fiscalValue', this.fiscalValueView);
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
          id: 'nextStep',
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
      if (action === 'nextStep')
      {
        this.handleNextStepAction(formView);
      }
      else if (action === 'reject')
      {
        this.handleRejectAction(formView);
      }
    },

    handleNextStepAction: function(formView)
    {
      this.model.set('newStage', 'accept');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit();
    },

    handleRejectAction: function(formView)
    {
      this.model.set('newStage', 'document');

      formView.handleNextRequest = function()
      {
        formView.model.set('newStage', null);
      };

      formView.submit({toggleRequired: false});
    },

    afterRender: function()
    {
      this.setUpAssetClassSelect2();
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

    serializeToForm: function(formData)
    {
      this.zplxView.serializeToForm(formData);
      this.fiscalValueView.serializeToForm(formData);

      formData.economicPeriodY = Math.floor(formData.economicPeriod / 12);
      formData.economicPeriodM = formData.economicPeriod % 12;
      formData.fiscalPeriodY = Math.floor(formData.fiscalPeriod / 12);
      formData.fiscalPeriodM = formData.fiscalPeriod % 12;

      return formData;
    },

    serializeForm: function(formData)
    {
      var data = {
        assetName: (formData.assetName || '').trim(),
        assetClass: formData.assetClass || null,
        inventoryNo: (formData.inventoryNo || '').trim(),
        deprecationRate: Math.round(Math.min(100, Math.max(parseFloat(formData.deprecationRate) || 0, 0)) * 100) / 100,
        economicPeriod: ((+formData.economicPeriodY || 0) * 12) + (+formData.economicPeriodM || 0),
        fiscalPeriod: ((+formData.fiscalPeriodY || 0) * 12) + (+formData.fiscalPeriodM || 0),
        comment: (formData.comment || '').trim()
      };

      this.zplxView.serializeForm(data);
      this.fiscalValueView.serializeForm(data);

      return data;
    }

  });
});
